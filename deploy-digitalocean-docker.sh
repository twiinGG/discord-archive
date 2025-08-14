#!/bin/bash

# Discord Archive - DigitalOcean Docker Deployment Script
# This script deploys the Discord Archive to a DigitalOcean Docker droplet

set -e

echo "🚀 Discord Archive - DigitalOcean Deployment"
echo "=============================================="

# Configuration
DROPLET_NAME="discord-archive"
REGION="nyc1"  # Change to your preferred region
SIZE="s-1vcpu-1gb"  # Basic droplet size
IMAGE="docker-20-04"  # Docker 1-click app

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if doctl is installed
check_doctl() {
    if ! command -v doctl &> /dev/null; then
        print_error "doctl CLI is not installed. Please install it first:"
        echo "  https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    # Check if authenticated
    if ! doctl account get &> /dev/null; then
        print_error "doctl is not authenticated. Please run: doctl auth init"
        exit 1
    fi
    
    print_success "doctl is installed and authenticated"
}

# Check if Docker is installed locally
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed locally. Please install Docker first."
        exit 1
    fi
    
    print_success "Docker is installed locally"
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building Docker image..."
    
    # Build the image
    docker build -t discord-archive:latest .
    
    # Tag for DigitalOcean Container Registry (optional)
    # docker tag discord-archive:latest registry.digitalocean.com/your-registry/discord-archive:latest
    # docker push registry.digitalocean.com/your-registry/discord-archive:latest
    
    print_success "Docker image built successfully"
}

# Create droplet
create_droplet() {
    print_status "Creating DigitalOcean droplet..."
    
    # Create the droplet
    DROPLET_ID=$(doctl compute droplet create $DROPLET_NAME \
        --size $SIZE \
        --image $IMAGE \
        --region $REGION \
        --format ID,Name,Status \
        --no-header | awk '{print $1}')
    
    if [ -z "$DROPLET_ID" ]; then
        print_error "Failed to create droplet"
        exit 1
    fi
    
    print_success "Droplet created with ID: $DROPLET_ID"
    
    # Wait for droplet to be ready
    print_status "Waiting for droplet to be ready..."
    while true; do
        STATUS=$(doctl compute droplet get $DROPLET_ID --format Status --no-header)
        if [ "$STATUS" = "active" ]; then
            break
        fi
        echo "  Status: $STATUS"
        sleep 10
    done
    
    print_success "Droplet is ready!"
}

# Get droplet IP
get_droplet_ip() {
    print_status "Getting droplet IP address..."
    
    DROPLET_IP=$(doctl compute droplet get $DROPLET_ID --format PublicIPv4 --no-header)
    
    if [ -z "$DROPLET_IP" ]; then
        print_error "Failed to get droplet IP"
        exit 1
    fi
    
    print_success "Droplet IP: $DROPLET_IP"
}

# Setup droplet
setup_droplet() {
    print_status "Setting up droplet..."
    
    # Wait for SSH to be available
    print_status "Waiting for SSH to be available..."
    while ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@$DROPLET_IP exit 2>/dev/null; do
        sleep 5
    done
    
    # Copy files to droplet
    print_status "Copying files to droplet..."
    scp -o StrictHostKeyChecking=no docker-compose.yml root@$DROPLET_IP:/root/
    scp -o StrictHostKeyChecking=no .env.local root@$DROPLET_IP:/root/
    
    # Setup environment on droplet
    print_status "Setting up environment on droplet..."
    ssh -o StrictHostKeyChecking=no root@$DROPLET_IP << 'EOF'
        # Update system
        apt update && apt upgrade -y
        
        # Install Docker Compose if not already installed
        if ! command -v docker-compose &> /dev/null; then
            curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create app directory
        mkdir -p /opt/discord-archive
        cd /opt/discord-archive
        
        # Move files
        mv /root/docker-compose.yml .
        mv /root/.env.local .
        
        # Create docker-compose.yml with proper configuration
        cat > docker-compose.yml << 'DOCKER_COMPOSE_EOF'
version: '3.8'

services:
  discord-archive:
    build: .
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    restart: unless-stopped
    volumes:
      - ./data:/app/data
DOCKER_COMPOSE_EOF
        
        # Start the application
        docker-compose up -d --build
        
        # Setup firewall
        ufw allow 80/tcp
        ufw allow 22/tcp
        ufw --force enable
EOF
    
    print_success "Droplet setup completed!"
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Create a tarball of the application
    tar -czf discord-archive.tar.gz --exclude=node_modules --exclude=.git .
    
    # Copy to droplet
    scp -o StrictHostKeyChecking=no discord-archive.tar.gz root@$DROPLET_IP:/opt/discord-archive/
    
    # Extract and deploy on droplet
    ssh -o StrictHostKeyChecking=no root@$DROPLET_IP << 'EOF'
        cd /opt/discord-archive
        tar -xzf discord-archive.tar.gz
        rm discord-archive.tar.gz
        
        # Rebuild and restart
        docker-compose down
        docker-compose up -d --build
EOF
    
    # Clean up local tarball
    rm discord-archive.tar.gz
    
    print_success "Application deployed successfully!"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Wait for application to start
    sleep 30
    
    # Test HTTP response
    if curl -f http://$DROPLET_IP > /dev/null 2>&1; then
        print_success "Application is running at http://$DROPLET_IP"
    else
        print_warning "Application might still be starting up. Check manually at http://$DROPLET_IP"
    fi
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    # Pre-flight checks
    check_doctl
    check_docker
    
    # Build image
    build_and_push_image
    
    # Create and setup droplet
    create_droplet
    get_droplet_ip
    setup_droplet
    
    # Deploy application
    deploy_application
    
    # Test deployment
    test_deployment
    
    echo ""
    echo "🎉 Deployment completed!"
    echo "=============================================="
    echo "Application URL: http://$DROPLET_IP"
    echo "Droplet ID: $DROPLET_ID"
    echo "SSH Access: ssh root@$DROPLET_IP"
    echo ""
    echo "Next steps:"
    echo "1. Visit http://$DROPLET_IP to verify the application"
    echo "2. Run the Discord export: ssh root@$DROPLET_IP 'cd /opt/discord-archive && npm run enhanced-export'"
    echo "3. Monitor logs: ssh root@$DROPLET_IP 'cd /opt/discord-archive && docker-compose logs -f'"
    echo ""
}

# Run main function
main "$@"
