#!/bin/bash

# Discord Archive - Vercel Deployment Script
# This script deploys the Discord Archive to Vercel

set -e

echo "🚀 Discord Archive - Vercel Deployment"
echo "======================================"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Installing now..."
        npm install -g vercel
    else
        print_success "Vercel CLI is installed"
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_error ".env.local file not found!"
        echo "Please create .env.local with your environment variables before deploying."
        exit 1
    else
        print_success ".env.local file found"
    fi
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        print_error "Git repository not initialized!"
        echo "Please run: git init && git add . && git commit -m 'Initial commit'"
        exit 1
    else
        print_success "Git repository found"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if already linked to a Vercel project
    if [ -f ".vercel/project.json" ]; then
        print_status "Project already linked to Vercel. Deploying..."
        vercel --prod
    else
        print_status "Linking to Vercel project..."
        vercel --yes
    fi
}

# Set up environment variables
setup_env_vars() {
    print_status "Setting up environment variables in Vercel..."
    
    # Read environment variables from .env.local and set them in Vercel
    while IFS='=' read -r key value; do
        if [[ ! $key =~ ^# ]] && [[ -n $key ]] && [[ -n $value ]]; then
            print_status "Setting $key..."
            vercel env add "$key" production <<< "$value"
        fi
    done < .env.local
    
    print_success "Environment variables configured"
}

# Show post-deployment instructions
show_post_deployment() {
    echo ""
    echo "🎉 POST-DEPLOYMENT STEPS"
    echo "========================"
    echo ""
    echo "Once your app is deployed:"
    echo ""
    echo "1. 🧪 Test the application:"
    echo "   - Visit your Vercel URL"
    echo "   - Verify the interface loads"
    echo "   - Test search functionality"
    echo "   - Test channel browsing"
    echo ""
    echo "2. 📊 Monitor the deployment:"
    echo "   - Check Vercel dashboard for logs"
    echo "   - Monitor function execution times"
    echo ""
    echo "3. 🔄 Discord Export Strategy:"
    echo "   - For small exports: Use Vercel serverless functions"
    echo "   - For large exports: Run locally or on a small server"
    echo "   - Export scripts are included in the deployment"
    echo ""
    echo "4. 🔗 Connect Custom Domain (optional):"
    echo "   - Go to Vercel dashboard"
    echo "   - Add your custom domain"
    echo ""
}

# Main deployment process
main() {
    echo "Starting Vercel deployment process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Deploy to Vercel
    deploy_to_vercel
    
    # Set up environment variables
    setup_env_vars
    
    # Show post-deployment steps
    show_post_deployment
    
    echo ""
    echo "🔗 Useful Links:"
    echo "================"
    echo "Vercel Dashboard: https://vercel.com/dashboard"
    echo "Supabase Dashboard: https://supabase.com/dashboard"
    echo "GitHub Repository: https://github.com/twiinGG/discord-archive"
    echo ""
    echo "🚀 Your Discord Archive is now deployed on Vercel!"
    echo ""
}

# Run main function
main "$@"
