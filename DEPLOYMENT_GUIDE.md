# 🚀 Discord Archive - DigitalOcean Deployment Guide

## Overview
This guide will help you deploy the Discord Archive to DigitalOcean using a Docker droplet. The deployment includes the web interface and all necessary components for running the full Discord server export.

## Prerequisites

### 1. DigitalOcean Account
- ✅ Active DigitalOcean account (confirmed)
- ⚠️ Note: Current balance shows -$2.83, you may need to add funds

### 2. Local Setup
- Docker installed locally
- doctl CLI tool installed and authenticated
- SSH key configured with DigitalOcean

## Deployment Options

### Option 1: Automated Script (Recommended)
Use the provided deployment script for a fully automated deployment.

### Option 2: Manual Deployment
Step-by-step manual deployment process.

### Option 3: DigitalOcean App Platform
Deploy directly to DigitalOcean App Platform (requires GitHub integration).

## 🎯 Option 1: Automated Deployment (Recommended)

### Step 1: Install doctl CLI
```bash
# macOS
brew install doctl

# Linux
snap install doctl

# Or download from: https://docs.digitalocean.com/reference/doctl/how-to/install/
```

### Step 2: Authenticate with DigitalOcean
```bash
doctl auth init
# Follow the prompts to authenticate
```

### Step 3: Run the Deployment Script
```bash
# Make sure you're in the discord-archive directory
cd discord-archive

# Run the deployment script
./deploy-digitalocean-docker.sh
```

The script will:
- ✅ Check prerequisites
- 🐳 Build Docker image
- ☁️ Create DigitalOcean droplet with Docker
- 🔧 Setup the environment
- 📦 Deploy the application
- 🧪 Test the deployment

### Expected Output
```
🚀 Discord Archive - DigitalOcean Deployment
==============================================
[SUCCESS] doctl is installed and authenticated
[SUCCESS] Docker is installed locally
[INFO] Building Docker image...
[SUCCESS] Docker image built successfully
[INFO] Creating DigitalOcean droplet...
[SUCCESS] Droplet created with ID: 123456789
[INFO] Waiting for droplet to be ready...
[SUCCESS] Droplet is ready!
[INFO] Getting droplet IP address...
[SUCCESS] Droplet IP: 123.456.789.012
[INFO] Setting up droplet...
[SUCCESS] Droplet setup completed!
[INFO] Deploying application...
[SUCCESS] Application deployed successfully!
[INFO] Testing deployment...
[SUCCESS] Application is running at http://123.456.789.012

🎉 Deployment completed!
==============================================
Application URL: http://123.456.789.012
Droplet ID: 123456789
SSH Access: ssh root@123.456.789.012
```

## 🎯 Option 2: Manual Deployment

### Step 1: Create Droplet
1. Go to DigitalOcean Console
2. Click "Create" → "Droplets"
3. Choose "Marketplace" → "Docker"
4. Select size: Basic → $6/month (1GB RAM, 1 vCPU)
5. Choose region (closest to you)
6. Add your SSH key
7. Click "Create Droplet"

### Step 2: Connect to Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### Step 3: Setup Environment
```bash
# Update system
apt update && apt upgrade -y

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/discord-archive
cd /opt/discord-archive
```

### Step 4: Upload Application
From your local machine:
```bash
# Create tarball
tar -czf discord-archive.tar.gz --exclude=node_modules --exclude=.git .

# Upload to droplet
scp discord-archive.tar.gz root@YOUR_DROPLET_IP:/opt/discord-archive/
scp .env.local root@YOUR_DROPLET_IP:/opt/discord-archive/
```

### Step 5: Deploy on Droplet
```bash
# Extract application
cd /opt/discord-archive
tar -xzf discord-archive.tar.gz
rm discord-archive.tar.gz

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
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
EOF

# Build and start
docker-compose up -d --build

# Setup firewall
ufw allow 80/tcp
ufw allow 22/tcp
ufw --force enable
```

## 🎯 Option 3: DigitalOcean App Platform

### Prerequisites
- GitHub repository with the Discord Archive code
- GitHub integration configured in DigitalOcean

### Steps
1. Go to DigitalOcean Console → Apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment: Node.js
5. Add environment variables from `.env.local`
6. Deploy

## 🧪 Post-Deployment Testing

### 1. Verify Web Interface
```bash
# Visit the application URL
curl http://YOUR_DROPLET_IP
```

### 2. Run System Tests
```bash
# SSH into the droplet
ssh root@YOUR_DROPLET_IP

# Navigate to app directory
cd /opt/discord-archive

# Run test suite
npm run test-suite

# Run audit
npm run audit
```

### 3. Test Discord Export
```bash
# Run a small test export
npm run test-export

# Or run the full enhanced export
npm run enhanced-export
```

## 📊 Monitoring and Management

### View Logs
```bash
# Application logs
docker-compose logs -f

# System logs
journalctl -u docker
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Data
```bash
# Backup database (if using local database)
docker-compose exec discord-archive pg_dump -U postgres discord_archive > backup.sql

# Backup application data
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

## 💰 Cost Estimation

### Basic Droplet (Recommended)
- **Size**: s-1vcpu-1gb (Basic)
- **Cost**: $6/month
- **Storage**: 25GB SSD
- **Bandwidth**: 1TB

### Larger Droplet (For Large Servers)
- **Size**: s-2vcpu-2gb (Basic)
- **Cost**: $12/month
- **Storage**: 50GB SSD
- **Bandwidth**: 2TB

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Not Starting
```bash
# Check logs
docker-compose logs discord-archive

# Check if port 80 is available
netstat -tlnp | grep :80
```

#### 2. Environment Variables Missing
```bash
# Verify .env.local is present
ls -la .env.local

# Check environment variables in container
docker-compose exec discord-archive env
```

#### 3. Discord Export Failing
```bash
# Check Discord credentials
docker-compose exec discord-archive node scripts/test-export.js

# Verify Docker is running
docker ps
```

#### 4. Database Connection Issues
```bash
# Test Supabase connection
docker-compose exec discord-archive node scripts/audit-and-fix.js
```

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Web interface loads at http://YOUR_DROPLET_IP
- ✅ All tests pass: `npm run test-suite`
- ✅ Audit passes: `npm run audit`
- ✅ Discord export works: `npm run test-export`
- ✅ Search functionality works
- ✅ Channel browsing works

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Run diagnostics: `npm run audit`
4. Check system resources: `htop`, `df -h`

---

**Ready to deploy?** 🚀

Choose your preferred deployment method and let's get your Discord Archive running in production!
