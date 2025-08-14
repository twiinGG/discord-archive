#!/bin/bash

# Discord Archive - GitHub Deployment Setup Script
# This script helps prepare your project for DigitalOcean App Platform deployment

set -e

echo "🚀 Discord Archive - GitHub Deployment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if git is initialized
check_git() {
    if [ ! -d ".git" ]; then
        print_status "Initializing git repository..."
        git init
        print_success "Git repository initialized"
    else
        print_success "Git repository already exists"
    fi
}

# Check if .env.local exists
check_env_file() {
    if [ ! -f ".env.local" ]; then
        print_error ".env.local file not found!"
        echo "Please create .env.local with your environment variables before deploying."
        exit 1
    else
        print_success ".env.local file found"
    fi
}

# Create .gitignore if it doesn't exist
create_gitignore() {
    if [ ! -f ".gitignore" ]; then
        print_status "Creating .gitignore file..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.tgz
*.tar.gz

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
        print_success ".gitignore file created"
    else
        print_success ".gitignore file already exists"
    fi
}

# Update app.yaml with GitHub username
update_app_yaml() {
    print_status "Please enter your GitHub username:"
    read -r github_username
    
    if [ -z "$github_username" ]; then
        print_error "GitHub username is required"
        exit 1
    fi
    
    # Update the app.yaml file
    sed -i.bak "s/YOUR_GITHUB_USERNAME/$github_username/g" .do/app.yaml
    rm -f .do/app.yaml.bak
    
    print_success "Updated .do/app.yaml with GitHub username: $github_username"
}

# Check if remote is configured
check_remote() {
    if git remote get-url origin > /dev/null 2>&1; then
        print_success "Git remote 'origin' is configured"
        git remote get-url origin
    else
        print_warning "Git remote 'origin' is not configured"
        echo "You'll need to add your GitHub repository as a remote:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/discord-archive.git"
    fi
}

# Create initial commit
create_commit() {
    if git status --porcelain | grep -q .; then
        print_status "Creating initial commit..."
        git add .
        git commit -m "Initial commit - Discord Archive ready for deployment"
        print_success "Initial commit created"
    else
        print_success "No changes to commit"
    fi
}

# Main setup process
main() {
    echo "Setting up GitHub deployment..."
    
    # Pre-flight checks
    check_git
    check_env_file
    create_gitignore
    update_app_yaml
    check_remote
    create_commit
    
    echo ""
    echo "🎉 GitHub deployment setup completed!"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo "1. Create a GitHub repository at: https://github.com/new"
    echo "2. Add your GitHub repository as remote:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/discord-archive.git"
    echo "3. Push to GitHub:"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo "4. Follow the DigitalOcean App Platform deployment guide:"
    echo "   DIGITALOCEAN_APP_PLATFORM_DEPLOYMENT.md"
    echo ""
    echo "Remember to add funds to your DigitalOcean account before deploying!"
    echo ""
}

# Run main function
main "$@"
