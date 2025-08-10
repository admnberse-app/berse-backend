#!/bin/bash

# Production Deployment Script for BerseMuka
# Usage: ./scripts/deploy.sh [staging|production]

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}"

echo -e "${GREEN}Starting deployment to ${ENVIRONMENT}...${NC}"

# Validation
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check for required files
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}Error: .env.${ENVIRONMENT} file not found${NC}"
    exit 1
fi

# Create backup directory
echo -e "${YELLOW}Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup database
echo -e "${YELLOW}Backing up database...${NC}"
./scripts/backup-db.sh "$BACKUP_DIR"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm run test

# Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Prisma migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy

# Docker deployment
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${YELLOW}Deploying with Docker...${NC}"
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down
    
    # Build and start new containers
    docker-compose -f docker-compose.production.yml build --no-cache
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 10
    
    # Check health
    docker-compose -f docker-compose.production.yml ps
    
    # Run post-deployment checks
    echo -e "${YELLOW}Running health checks...${NC}"
    curl -f http://localhost:3001/health || exit 1
    
    echo -e "${GREEN}Deployment to production completed successfully!${NC}"
else
    echo -e "${YELLOW}Starting staging server...${NC}"
    npm run start
fi

# Clean up old backups (keep last 10)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
ls -dt ./backups/* | tail -n +11 | xargs -r rm -rf

echo -e "${GREEN}Deployment completed at $(date)${NC}"
echo -e "${GREEN}Backup saved to: ${BACKUP_DIR}${NC}"