#!/bin/bash

echo "🚀 Setting up BerseMuka App with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔧 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend npx prisma migrate dev

# Seed the database (optional)
echo "🌱 Seeding database with sample data..."
docker-compose exec backend npx prisma db seed

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Reset database: docker-compose down -v && ./scripts/docker-setup.sh"