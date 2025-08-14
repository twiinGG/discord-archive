# DigitalOcean Deployment Guide

This guide covers deploying your Discord Archive to DigitalOcean using both MCP (Managed Cloud Platform) and traditional droplet methods.

## 🚀 **Option 1: DigitalOcean MCP (Recommended)**

### Prerequisites
- DigitalOcean account with API token
- MCP server configured in Cursor

### Deployment Steps

1. **Create MCP Project**:
   ```bash
   # Using MCP server (when available)
   mcp_digitalocean_create_project --name "discord-archive" --region "nyc1"
   ```

2. **Deploy Application**:
   ```bash
   # Build and deploy
   docker build -t discord-archive .
   docker tag discord-archive registry.digitalocean.com/your-registry/discord-archive
   docker push registry.digitalocean.com/your-registry/discord-archive
   ```

3. **Configure Environment**:
   - Set environment variables in MCP dashboard
   - Configure domain and SSL

## 🖥️ **Option 2: Traditional Droplet Deployment**

### Step 1: Create Droplet

1. **Choose Specifications**:
   - **Size**: Basic Droplet ($6-12/month)
     - 1-2 vCPUs
     - 1-2 GB RAM
     - 25-50 GB SSD
   - **OS**: Ubuntu 22.04 LTS
   - **Region**: Choose closest to you

2. **Create Droplet**:
   ```bash
   # Using doctl CLI
   doctl compute droplet create discord-archive \
     --size s-1vcpu-1gb \
     --image ubuntu-22-04-x64 \
     --region nyc1 \
     --ssh-keys your-ssh-key-id
   ```

### Step 2: Server Setup

1. **Connect to Droplet**:
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Install Docker**:
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/discord-archive.git
   cd discord-archive
   ```

### Step 3: Configure Environment

1. **Create Environment File**:
   ```bash
   cp env.example .env.local
   nano .env.local
   ```

2. **Add Your Credentials**:
   ```env
   # Discord Configuration
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_GUILD_ID=your_server_id_here
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://eyypgmbbkdcqpdmfjevu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # Authentication
   NEXTAUTH_SECRET=your_generated_secret
   NEXTAUTH_URL=https://your-domain.com
   ```

### Step 4: Deploy Application

1. **Build and Run**:
   ```bash
   # Build Docker image
   docker build -t discord-archive .
   
   # Run with docker-compose
   docker-compose up -d
   ```

2. **Verify Deployment**:
   ```bash
   # Check container status
   docker ps
   
   # View logs
   docker-compose logs -f
   
   # Test application
   curl http://localhost:3000
   ```

### Step 5: Configure Domain & SSL

1. **Point Domain**:
   - Add A record pointing to your droplet IP
   - Wait for DNS propagation

2. **Install Nginx**:
   ```bash
   apt install nginx -y
   ```

3. **Configure Nginx**:
   ```bash
   cat > /etc/nginx/sites-available/discord-archive << 'EOF'
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   EOF
   
   # Enable site
   ln -s /etc/nginx/sites-available/discord-archive /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

4. **Install SSL with Certbot**:
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d your-domain.com
   ```

## 🔧 **Export Process on DigitalOcean**

### Run Discord Export

1. **Start Export Process**:
   ```bash
   # Run the export script
   npm run export
   
   # Or run manually
   node scripts/run-export.js
   ```

2. **Monitor Progress**:
   ```bash
   # View real-time logs
   docker-compose logs -f
   
   # Check database stats
   node scripts/check-stats.js
   ```

3. **Handle Large Exports**:
   ```bash
   # For very large servers, consider running export in background
   nohup npm run export > export.log 2>&1 &
   
   # Monitor progress
   tail -f export.log
   ```

## 📊 **Monitoring & Maintenance**

### Health Checks

1. **Application Health**:
   ```bash
   # Check if application is running
   curl -f http://localhost:3000/api/health
   
   # Check container status
   docker ps
   ```

2. **Database Health**:
   ```bash
   # Check Supabase connection
   node scripts/check-db.js
   ```

### Backup Strategy

1. **Database Backups**:
   - Supabase provides automatic backups
   - Consider additional exports to JSON

2. **Application Backups**:
   ```bash
   # Backup configuration
   tar -czf backup-$(date +%Y%m%d).tar.gz .env.local scripts/
   ```

### Scaling Considerations

1. **Upgrade Droplet**:
   - Monitor resource usage: `htop`
   - Upgrade droplet size if needed

2. **Load Balancing**:
   - Consider multiple droplets for high traffic
   - Use DigitalOcean Load Balancer

## 🚨 **Troubleshooting**

### Common Issues

1. **Container Won't Start**:
   ```bash
   # Check logs
   docker-compose logs
   
   # Check environment variables
   docker-compose config
   ```

2. **Export Fails**:
   ```bash
   # Check Discord bot permissions
   # Verify bot token is valid
   # Check network connectivity
   ```

3. **Database Connection Issues**:
   ```bash
   # Verify Supabase credentials
   # Check network connectivity
   # Test connection manually
   ```

### Performance Optimization

1. **For Large Discord Servers**:
   - Use larger droplet (2-4 vCPUs, 4-8 GB RAM)
   - Consider SSD storage for faster I/O
   - Monitor memory usage during export

2. **Database Optimization**:
   - Ensure proper indexes are created
   - Monitor query performance
   - Consider read replicas for high traffic

## 💰 **Cost Estimation**

### Monthly Costs (USD)

- **Basic Droplet**: $6-12/month
- **Supabase**: Free tier (up to 500MB), then $25/month
- **Domain**: $10-15/year
- **Total**: ~$30-40/month for production setup

### Cost Optimization

- Start with basic droplet, upgrade as needed
- Use Supabase free tier initially
- Monitor usage and optimize resources

## 🔐 **Security Considerations**

1. **Firewall Configuration**:
   ```bash
   # Allow only necessary ports
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

2. **Regular Updates**:
   ```bash
   # Update system regularly
   apt update && apt upgrade -y
   
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

3. **Access Control**:
   - Use SSH keys only
   - Disable root login
   - Regular security audits

## 📈 **Future Enhancements**

1. **Auto-scaling**: Set up auto-scaling based on load
2. **CDN**: Use DigitalOcean Spaces for static assets
3. **Monitoring**: Set up monitoring with DigitalOcean Monitoring
4. **CI/CD**: Automate deployments with GitHub Actions

---

**Next Steps**: Choose your deployment method and follow the corresponding guide. The MCP method is recommended for easier management, while the traditional method gives you more control.

