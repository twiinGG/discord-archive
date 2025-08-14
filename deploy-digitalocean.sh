#!/bin/bash

# DigitalOcean Deployment Script for Discord Archive
# This script helps deploy the Discord archive to a DigitalOcean droplet

set -e

echo "🚀 Deploying Discord Archive to DigitalOcean..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it with your Discord credentials."
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t discord-archive .

# Create necessary directories
mkdir -p exports logs

# Run the container
echo "🚀 Starting Discord Archive container..."
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Your Discord Archive is running at: http://localhost:3000"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run export' to start archiving your Discord server"
echo "2. Monitor logs with: docker-compose logs -f"
echo "3. Stop the service with: docker-compose down"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Update: docker-compose pull && docker-compose up -d"

