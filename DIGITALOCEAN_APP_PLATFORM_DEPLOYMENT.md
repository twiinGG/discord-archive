# 🚀 Discord Archive - DigitalOcean App Platform Deployment

## Overview
This guide will help you deploy the Discord Archive to DigitalOcean App Platform, which provides a managed platform for running your Next.js application with automatic scaling, SSL certificates, and easy deployment.

## Prerequisites

### 1. GitHub Repository
You need to push your Discord Archive code to a GitHub repository.

### 2. DigitalOcean Account
- ✅ Active DigitalOcean account (confirmed)
- ⚠️ Note: Current balance shows -$2.83, you may need to add funds

## Step-by-Step Deployment Guide

### Step 1: Prepare Your GitHub Repository

1. **Create a new GitHub repository** (if you haven't already):
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit - Discord Archive ready for deployment"
   
   # Create repository on GitHub and push
   git remote add origin https://github.com/YOUR_USERNAME/discord-archive.git
   git branch -M main
   git push -u origin main
   ```

2. **Update the app.yaml file** with your GitHub username:
   ```yaml
   # In .do/app.yaml, replace YOUR_GITHUB_USERNAME with your actual GitHub username
   github:
     repo: YOUR_ACTUAL_USERNAME/discord-archive
     branch: main
   ```

### Step 2: Access DigitalOcean App Platform

1. **Go to DigitalOcean Console**:
   - Visit: https://cloud.digitalocean.com/apps
   - Sign in to your DigitalOcean account

2. **Create New App**:
   - Click "Create App"
   - Choose "GitHub" as your source

### Step 3: Connect GitHub Repository

1. **Connect GitHub Account**:
   - Click "Link Your GitHub Account"
   - Authorize DigitalOcean to access your repositories
   - Select your `discord-archive` repository

2. **Configure Repository Settings**:
   - **Repository**: Select `discord-archive`
   - **Branch**: `main`
   - **Root Directory**: `/` (leave as default)

### Step 4: Configure Build Settings

1. **Environment**: Select `Node.js`

2. **Build Command**: `npm run build`

3. **Run Command**: `npm start`

4. **HTTP Port**: `3000`

### Step 5: Configure Environment Variables

Add all the environment variables from your `.env.local` file:

| Variable Name | Type | Value |
|---------------|------|-------|
| `NODE_ENV` | Plain | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Secret | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Secret | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Your Supabase service role key |
| `DISCORD_BOT_TOKEN` | Secret | Your Discord bot token |
| `DISCORD_USER_TOKEN` | Secret | Your Discord user token |
| `DISCORD_GUILD_ID` | Secret | Your Discord guild ID |
| `NEXTAUTH_SECRET` | Secret | Your NextAuth secret |

### Step 6: Configure Resources

1. **Instance Size**: Choose `Basic XXS` ($5/month) for testing
   - For production with large Discord servers, consider `Basic XS` ($12/month)

2. **Instance Count**: Start with `1` instance
   - Can be scaled up later if needed

### Step 7: Deploy

1. **Review Configuration**:
   - Double-check all settings
   - Verify environment variables are correct

2. **Deploy**:
   - Click "Create Resources"
   - Wait for deployment to complete (usually 5-10 minutes)

## Post-Deployment Steps

### Step 1: Verify Deployment

1. **Check App Status**:
   - Go to your app dashboard
   - Verify status shows "Running"

2. **Test Web Interface**:
   - Visit your app URL (provided by DigitalOcean)
   - Verify the Discord Archive interface loads

### Step 2: Test Functionality

1. **Run System Tests**:
   ```bash
   # You can run tests via the DigitalOcean console or SSH
   npm run test-suite
   npm run audit
   ```

2. **Test Discord Export**:
   ```bash
   # Test with a small channel first
   npm run test-export
   ```

### Step 3: Run Full Discord Export

Once you've verified everything works:

```bash
# Run the full enhanced export
npm run enhanced-export
```

## Monitoring and Management

### View Logs
- Go to your app dashboard
- Click on "Logs" tab
- Monitor application logs in real-time

### Scale Application
- Go to your app dashboard
- Click "Settings" → "Resources"
- Adjust instance count or size as needed

### Update Application
- Push changes to your GitHub repository
- DigitalOcean will automatically redeploy

## Cost Estimation

### Basic XXS Instance (Recommended for Testing)
- **Cost**: $5/month
- **Resources**: 0.5 vCPU, 512MB RAM
- **Storage**: 1GB SSD

### Basic XS Instance (Recommended for Production)
- **Cost**: $12/month
- **Resources**: 1 vCPU, 1GB RAM
- **Storage**: 2GB SSD

### Basic S Instance (For Large Servers)
- **Cost**: $24/month
- **Resources**: 2 vCPU, 2GB RAM
- **Storage**: 4GB SSD

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check build logs in the DigitalOcean console
- Verify all dependencies are in `package.json`
- Ensure build command is correct: `npm run build`

#### 2. Environment Variables Missing
- Verify all environment variables are set in the app configuration
- Check that secret variables are properly configured
- Ensure variable names match exactly

#### 3. Application Not Starting
- Check run command: should be `npm start`
- Verify HTTP port is set to `3000`
- Check application logs for errors

#### 4. Database Connection Issues
- Verify Supabase credentials are correct
- Check that Supabase project is active
- Ensure RLS policies are configured correctly

### Getting Help

1. **Check Logs**: Use the DigitalOcean console to view application logs
2. **Test Locally**: Verify the application works locally first
3. **Review Configuration**: Double-check all settings in the app configuration

## Advantages of App Platform

### ✅ **Managed Platform**
- Automatic SSL certificates
- Built-in CDN
- Automatic scaling
- Zero-downtime deployments

### ✅ **Easy Deployment**
- Git-based deployments
- Automatic builds
- Environment variable management
- Built-in monitoring

### ✅ **Cost Effective**
- Pay only for what you use
- No server management required
- Automatic resource optimization

## Success Criteria

Your deployment is successful when:
- ✅ App status shows "Running"
- ✅ Web interface loads at your app URL
- ✅ All tests pass: `npm run test-suite`
- ✅ Audit passes: `npm run audit`
- ✅ Discord export works: `npm run test-export`
- ✅ Search functionality works
- ✅ Channel browsing works

---

**Ready to deploy?** 🚀

Follow the steps above to deploy your Discord Archive to DigitalOcean App Platform. The managed platform will handle all the infrastructure details, letting you focus on your application!
