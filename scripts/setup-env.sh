#!/bin/bash

# Environment Setup Script for BerseMuka
# This script helps set up environment variables for different deployment environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate secure random string
generate_secret() {
    local length=${1:-64}
    openssl rand -hex $length 2>/dev/null || head -c $length /dev/urandom | xxd -p | tr -d '\n'
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    local missing_tools=()
    
    if ! command -v openssl &> /dev/null; then
        missing_tools+=("openssl")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_info "Please install the missing tools and run this script again."
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Setup environment for specific environment
setup_environment() {
    local env_type=$1
    local env_file=".env"
    local template_file=".env.example"
    
    case $env_type in
        "development")
            template_file=".env.example"
            ;;
        "staging")
            template_file=".env.staging.example"
            env_file=".env.staging"
            ;;
        "production")
            template_file=".env.production.example"
            env_file=".env.production"
            ;;
        *)
            print_error "Invalid environment type: $env_type"
            print_info "Valid options: development, staging, production"
            exit 1
            ;;
    esac
    
    print_info "Setting up $env_type environment..."
    
    # Check if template exists
    if [ ! -f "$template_file" ]; then
        print_error "Template file $template_file not found!"
        exit 1
    fi
    
    # Backup existing env file if it exists
    if [ -f "$env_file" ]; then
        print_warning "Backing up existing $env_file to ${env_file}.backup"
        cp "$env_file" "${env_file}.backup"
    fi
    
    # Copy template to env file
    cp "$template_file" "$env_file"
    
    # Generate secure secrets
    print_info "Generating secure secrets..."
    
    local jwt_secret=$(generate_secret 32)
    local jwt_refresh_secret=$(generate_secret 32)
    local cookie_secret=$(generate_secret 24)
    local webhook_secret=$(generate_secret 32)
    local secrets_master_key=$(generate_secret 32)
    
    # Replace placeholder secrets in env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secret-jwt-key-here-min-256-bits/$jwt_secret/g" "$env_file"
        sed -i '' "s/your-super-secret-refresh-jwt-key-here-min-256-bits/$jwt_refresh_secret/g" "$env_file"
        sed -i '' "s/your-cookie-secret-key-here/$cookie_secret/g" "$env_file"
        sed -i '' "s/your-webhook-secret/$webhook_secret/g" "$env_file"
        sed -i '' "s/PRODUCTION_SECRETS_MASTER_KEY_HEX/$secrets_master_key/g" "$env_file"
        sed -i '' "s/STAGING_SECRETS_MASTER_KEY_HEX/$secrets_master_key/g" "$env_file"
    else
        # Linux
        sed -i "s/your-super-secret-jwt-key-here-min-256-bits/$jwt_secret/g" "$env_file"
        sed -i "s/your-super-secret-refresh-jwt-key-here-min-256-bits/$jwt_refresh_secret/g" "$env_file"
        sed -i "s/your-cookie-secret-key-here/$cookie_secret/g" "$env_file"
        sed -i "s/your-webhook-secret/$webhook_secret/g" "$env_file"
        sed -i "s/PRODUCTION_SECRETS_MASTER_KEY_HEX/$secrets_master_key/g" "$env_file"
        sed -i "s/STAGING_SECRETS_MASTER_KEY_HEX/$secrets_master_key/g" "$env_file"
    fi
    
    # Set proper file permissions
    chmod 600 "$env_file"
    
    print_success "Environment file $env_file created successfully!"
    print_warning "Please review and update the configuration values in $env_file"
    
    if [ "$env_type" != "development" ]; then
        print_warning "Make sure to update all API keys and database URLs for $env_type environment"
    fi
}

# Validate environment file
validate_environment() {
    local env_file=${1:-.env}
    
    print_info "Validating environment file: $env_file"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found!"
        exit 1
    fi
    
    # Source the env file and check required variables
    set -a
    source "$env_file"
    set +a
    
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "COOKIE_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    # Check for placeholder values
    local placeholder_patterns=(
        "your-"
        "CHANGE_THIS"
        "PRODUCTION_"
        "STAGING_"
    )
    
    local has_placeholders=false
    
    for pattern in "${placeholder_patterns[@]}"; do
        if grep -q "$pattern" "$env_file"; then
            print_warning "Found placeholder values containing '$pattern' in $env_file"
            has_placeholders=true
        fi
    done
    
    if [ "$has_placeholders" = true ]; then
        print_warning "Please replace all placeholder values with actual configuration"
    else
        print_success "Environment validation passed!"
    fi
}

# Install dependencies and generate Prisma client
setup_database() {
    print_info "Setting up database..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    npm run prisma:generate
    
    # Ask if user wants to run migrations
    read -p "Do you want to run database migrations? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running database migrations..."
        npm run prisma:migrate
    fi
    
    # Ask if user wants to seed database
    read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."
        npm run prisma:seed
    fi
    
    print_success "Database setup completed!"
}

# Main menu
show_menu() {
    echo
    print_info "BerseMuka Environment Setup"
    echo "1) Setup Development Environment"
    echo "2) Setup Staging Environment"
    echo "3) Setup Production Environment"
    echo "4) Validate Environment File"
    echo "5) Setup Database"
    echo "6) Exit"
    echo
}

# Main execution
main() {
    check_requirements
    
    while true; do
        show_menu
        read -p "Choose an option (1-6): " choice
        
        case $choice in
            1)
                setup_environment "development"
                ;;
            2)
                setup_environment "staging"
                ;;
            3)
                setup_environment "production"
                ;;
            4)
                read -p "Enter environment file path (.env): " env_path
                env_path=${env_path:-.env}
                validate_environment "$env_path"
                ;;
            5)
                setup_database
                ;;
            6)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-6."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi