#!/bin/bash

# Discord Archive - DigitalOcean App Platform Deployment Helper
# This script helps you complete the deployment process

set -e

echo "🚀 Discord Archive - DigitalOcean App Platform Deployment"
echo "========================================================"

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

# Check if we're ready to deploy
check_readiness() {
    print_status "Checking deployment readiness..."
    
    # Check if GitHub repo exists
    if curl -s "https://api.github.com/repos/twiinGG/discord-archive" | grep -q "Not Found"; then
        print_error "GitHub repository not found. Please create it first."
        exit 1
    else
        print_success "GitHub repository found: https://github.com/twiinGG/discord-archive"
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_error ".env.local file not found. Please create it with your environment variables."
        exit 1
    else
        print_success ".env.local file found"
    fi
}

# Display deployment instructions
show_deployment_instructions() {
    echo ""
    echo "🎯 DEPLOYMENT INSTRUCTIONS"
    echo "=========================="
    echo ""
    echo "1. 📱 Open your browser and go to:"
    echo "   https://cloud.digitalocean.com/apps"
    echo ""
    echo "2. 🔗 Click 'Create App'"
    echo ""
    echo "3. 🔌 Choose 'GitHub' as your source"
    echo ""
    echo "4. 🔐 Connect your GitHub account:"
    echo "   - Click 'Link Your GitHub Account'"
    echo "   - Authorize DigitalOcean to access your repositories"
    echo "   - Select the 'discord-archive' repository"
    echo ""
    echo "5. ⚙️ Configure the app settings:"
    echo "   - Repository: twiinGG/discord-archive"
    echo "   - Branch: main"
    echo "   - Root Directory: / (leave as default)"
    echo "   - Environment: Node.js"
    echo "   - Build Command: npm run build"
    echo "   - Run Command: npm start"
    echo "   - HTTP Port: 3000"
    echo ""
    echo "6. 🔑 Add Environment Variables:"
    echo "   Copy these from your .env.local file:"
    echo ""
    
    # Read and display environment variables
    if [ -f ".env.local" ]; then
        echo "   Environment Variables to add:"
        echo "   ============================="
        while IFS='=' read -r key value; do
            if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
                echo "   - $key: [SECRET] (copy from .env.local)"
            fi
        done < .env.local
    fi
    
    echo ""
    echo "7. 💰 Configure Resources:"
    echo "   - Instance Size: Basic XXS ($5/month) for testing"
    echo "   - Instance Count: 1"
    echo ""
    echo "8. 🚀 Deploy:"
    echo "   - Click 'Create Resources'"
    echo "   - Wait for deployment to complete (5-10 minutes)"
    echo ""
    echo "9. ✅ Verify Deployment:"
    echo "   - Check app status shows 'Running'"
    echo "   - Visit your app URL"
    echo "   - Test the Discord Archive interface"
    echo ""
}

# Show post-deployment steps
show_post_deployment() {
    echo ""
    echo "🎉 POST-DEPLOYMENT STEPS"
    echo "========================"
    echo ""
    echo "Once your app is deployed:"
    echo ""
    echo "1. 🧪 Test the application:"
    echo "   - Visit your app URL"
    echo "   - Verify the interface loads"
    echo "   - Test search functionality"
    echo "   - Test channel browsing"
    echo ""
    echo "2. 📊 Monitor the deployment:"
    echo "   - Check the 'Logs' tab in your app dashboard"
    echo "   - Monitor for any errors"
    echo ""
    echo "3. 🔄 Run Discord Export (when ready):"
    echo "   - The export scripts are included in the deployment"
    echo "   - You can run them via the DigitalOcean console"
    echo ""
    echo "4. 📈 Scale if needed:"
    echo "   - Go to Settings → Resources"
    echo "   - Adjust instance size or count"
    echo ""
}

# Main function
main() {
    print_status "Starting DigitalOcean App Platform deployment process..."
    
    # Check readiness
    check_readiness
    
    # Show instructions
    show_deployment_instructions
    
    # Show post-deployment steps
    show_post_deployment
    
    echo ""
    echo "🔗 Useful Links:"
    echo "================"
    echo "GitHub Repository: https://github.com/twiinGG/discord-archive"
    echo "DigitalOcean Apps: https://cloud.digitalocean.com/apps"
    echo "Deployment Guide: DIGITALOCEAN_APP_PLATFORM_DEPLOYMENT.md"
    echo ""
    echo "💰 Remember to add funds to your DigitalOcean account!"
    echo "   Current balance: -$2.83 (needs to be positive)"
    echo ""
    echo "🚀 Ready to deploy? Follow the instructions above!"
    echo ""
}

# Run main function
main "$@"
