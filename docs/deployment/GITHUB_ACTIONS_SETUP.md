# GitHub Actions CI/CD Setup Guide

Complete guide for setting up continuous integration and deployment to Digital Ocean using GitHub Actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Digital Ocean Droplet Setup](#digital-ocean-droplet-setup)
- [Workflow Details](#workflow-details)
- [Deployment Strategies](#deployment-strategies)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🎯 Overview

This project includes three GitHub Actions workflows:

1. **CI Workflow** (`ci.yml`) - Build, test, and lint on every PR
2. **Production Deployment** (`cd-production.yml`) - Deploy to production on main branch
3. **Staging Deployment** (`cd-staging.yml`) - Deploy to staging on develop branch

### Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ├─── Push to develop ──> Staging Deploy (port 8080)
       │
       └─── Push to main ────> Production Deploy (port 80)
```

## ✅ Prerequisites

### Local Requirements
- Git installed
- SSH access to your Digital Ocean droplet
- GitHub account with repository access

### Digital Ocean Requirements
- Ubuntu 20.04+ droplet (recommended: 2GB RAM minimum)
- Docker and Docker Compose installed
- SSH access configured
- Ports 80 (production) and 8080 (staging) open in firewall

## 🚀 Quick Start

### 1. Prepare Your Digital Ocean Droplet

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Create deployment directories
mkdir -p /opt/fuse-app
mkdir -p /opt/fuse-app-staging
mkdir -p /opt/fuse-app/logs

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose

# Configure firewall
ufw allow 80/tcp
ufw allow 8080/tcp
ufw allow 22/tcp
ufw enable
```

### 2. Generate SSH Key for GitHub Actions

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key

# Copy public key to Digital Ocean droplet
ssh-copy-id -i github-actions-key.pub root@YOUR_DROPLET_IP
ssh-copy-id -i github-actions-key.pub root@206.189.163.147

# Keep the private key for GitHub Secrets (next step)
cat github-actions-key
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DO_SSH_PRIVATE_KEY` | SSH private key for droplet access | Content of `github-actions-key` from step 2 |
| `DO_DROPLET_IP` | Your droplet IP address | From Digital Ocean dashboard |

**DO_SSH_PRIVATE_KEY example:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
...
(full private key content)
...
-----END OPENSSH PRIVATE KEY-----
```

**DO_DROPLET_IP example:**
```
165.227.123.45
```

### 4. Enable GitHub Actions

1. Go to your repository → Actions tab
2. Click "I understand my workflows, go ahead and enable them"
3. The workflows will now run automatically on push/PR

### 5. Test Your Setup

```bash
# Create a test commit on develop branch
git checkout -b develop
git push origin develop

# This should trigger the staging deployment
# Check Actions tab to see progress

# Merge to main for production deployment
git checkout main
git merge develop
git push origin main
```

## 🔐 GitHub Secrets Configuration

### Required Secrets

#### DO_SSH_PRIVATE_KEY
The SSH private key used to connect to your droplet.

**Security Best Practices:**
- Use a dedicated key pair only for GitHub Actions
- Never commit private keys to repository
- Rotate keys periodically
- Use ed25519 encryption (more secure than RSA)

#### DO_DROPLET_IP
Your Digital Ocean droplet's public IP address.

**Format:** `123.45.67.89`

### Optional Secrets (for advanced features)

#### DO_CONTAINER_REGISTRY (Optional)
If using Digital Ocean Container Registry:
```
registry.digitalocean.com/your-registry-name
```

#### DO_API_TOKEN (Optional)
For API-based operations:
- Go to Digital Ocean → API → Generate New Token
- Select "Read and Write" access
- Copy token to GitHub Secret

## 🖥️ Digital Ocean Droplet Setup

### Recommended Specifications

| Environment | vCPUs | RAM | Storage | Monthly Cost |
|-------------|-------|-----|---------|--------------|
| Development/Staging | 1 | 1GB | 25GB | $6 |
| Small Production | 1 | 2GB | 50GB | $12 |
| Medium Production | 2 | 4GB | 80GB | $24 |
| Large Production | 4 | 8GB | 160GB | $48 |

### Initial Droplet Configuration

```bash
#!/bin/bash

# Run this script on fresh Ubuntu droplet

set -e

echo "🚀 Setting up Fuse App deployment environment..."

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose

# Install essential tools
apt-get install -y curl wget git vim ufw bc

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 8080/tcp
ufw --force enable

# Create directories
mkdir -p /opt/fuse-app/{logs,backups}
mkdir -p /opt/fuse-app-staging

# Set permissions
chmod 755 /opt/fuse-app
chmod 755 /opt/fuse-app-staging

# Configure Docker to start on boot
systemctl enable docker
systemctl start docker

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Add GitHub Actions SSH public key to ~/.ssh/authorized_keys"
echo "2. Configure GitHub Secrets in repository"
echo "3. Push to trigger first deployment"
```

### SSH Configuration

Add this to `/root/.ssh/config` on droplet:

```ssh
Host *
    StrictHostKeyChecking accept-new
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## 📊 Workflow Details

### CI Workflow (ci.yml)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Jobs:**
1. **Build** - Build Angular app with Node 18.x and 20.x
2. **Test** - Run unit tests with coverage
3. **Lint** - Run ESLint
4. **Docker Build** - Validate Dockerfile builds successfully

**Duration:** ~5-8 minutes

### Production Deployment (cd-production.yml)

**Triggers:**
- Push to `main` branch
- Manual dispatch via Actions tab

**Jobs:**
1. **Build and Push** - Build Docker image and upload as artifact
2. **Deploy** - Deploy to production droplet
3. **Monitor** - Monitor deployment for 2 minutes

**Features:**
- Automatic backup before deployment
- Health checks after deployment
- Automatic rollback on failure
- Deployment monitoring

**Duration:** ~8-12 minutes

### Staging Deployment (cd-staging.yml)

**Triggers:**
- Push to `develop` branch
- Manual dispatch via Actions tab

**Jobs:**
1. **Build and Deploy** - Build and deploy to staging environment

**Features:**
- Faster deployment (fewer safety checks)
- Runs on port 8080
- Automatic PR comments with staging URL

**Duration:** ~5-8 minutes

## 🔄 Deployment Strategies

### Strategy 1: Docker Image Transfer (Current Implementation)

**How it works:**
1. Build Docker image in GitHub Actions runner
2. Export image as tar file
3. Transfer tar to droplet via SCP
4. Load image on droplet
5. Deploy with docker-compose

**Pros:**
- Build happens in GitHub infrastructure (faster)
- Consistent builds
- Easy rollback

**Cons:**
- Large file transfers
- Requires image artifact handling

### Strategy 2: Build on Server (Alternative)

Modify workflows to clone repository on droplet and build there.

**Pros:**
- No large file transfers
- Simpler workflow

**Cons:**
- Slower (build on droplet)
- Requires more resources on droplet

### Strategy 3: Container Registry (Advanced)

Use Digital Ocean Container Registry.

**Setup:**
```bash
# Create registry in Digital Ocean
# Configure authentication
doctl registry login

# Update workflows to push to registry
# Update droplet to pull from registry
```

**Pros:**
- Professional deployment pattern
- Version history
- Multiple environments easy

**Cons:**
- Additional cost (~$5/month)
- More complex setup

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSH Connection Failed

**Error:**
```
Permission denied (publickey)
```

**Solution:**
```bash
# Verify public key is in droplet's authorized_keys
ssh root@YOUR_DROPLET_IP "cat ~/.ssh/authorized_keys"

# Test SSH connection locally first
ssh -i github-actions-key root@YOUR_DROPLET_IP
```

#### 2. Docker Image Load Failed

**Error:**
```
Error loading image: file not found
```

**Solution:**
```bash
# Check disk space on droplet
ssh root@YOUR_DROPLET_IP "df -h"

# Clean up old Docker images
ssh root@YOUR_DROPLET_IP "docker system prune -af"
```

#### 3. Health Check Failed

**Error:**
```
Health check failed after 5 attempts
```

**Solution:**
```bash
# Check container logs
ssh root@YOUR_DROPLET_IP "docker logs fuse-app"

# Check container status
ssh root@YOUR_DROPLET_IP "docker ps -a"

# Check nginx logs
ssh root@YOUR_DROPLET_IP "docker exec fuse-app cat /var/log/nginx/error.log"
```

#### 4. Port Already in Use

**Error:**
```
Bind for 0.0.0.0:80 failed: port is already allocated
```

**Solution:**
```bash
# Find what's using the port
ssh root@YOUR_DROPLET_IP "lsof -i :80"

# Stop conflicting service
ssh root@YOUR_DROPLET_IP "systemctl stop apache2"  # or nginx

# Or use different port in docker-compose.yml
```

### Debug Mode

Enable verbose logging in workflows:

```yaml
# Add to any job
- name: Debug deployment
  run: |
    set -x  # Enable verbose mode
    # your commands here
```

### Manual Deployment

If automated deployment fails, deploy manually:

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Navigate to deployment directory
cd /opt/fuse-app

# Pull latest code (if using git-based approach)
# Or transfer files manually

# Run deployment script
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh

# Or use docker-compose directly
docker-compose down
docker-compose up -d
```

## ⚙️ Advanced Configuration

### Environment-Specific Builds

Create different environment files:

```typescript
// src/environments/environment.staging.ts
export const environment = {
  production: false,
  staging: true,
  apiUrl: 'https://staging-api.example.com'
};
```

Update `angular.json`:

```json
"configurations": {
  "staging": {
    "fileReplacements": [{
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.staging.ts"
    }]
  }
}
```

### Custom Domains

Configure nginx for custom domains:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Rest of nginx configuration
}
```

Enable HTTPS with Let's Encrypt:

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### Monitoring and Alerts

Add monitoring to workflow:

```yaml
- name: Send Slack notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Database Migrations

If you add a database later:

```yaml
- name: Run migrations
  run: |
    ssh root@${{ secrets.DO_DROPLET_IP }} << 'ENDSSH'
      cd /opt/fuse-app
      docker-compose exec -T app npm run migrate
    ENDSSH
```

### Blue-Green Deployment

For zero-downtime deployments:

```yaml
# Run new container on different port
# Test new container
# Switch traffic with nginx reload
# Stop old container
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Digital Ocean Docker Guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://www.nginx.com/resources/wiki/start/)

## 🔒 Security Best Practices

1. **SSH Keys**
   - Use ed25519 keys (not RSA)
   - Separate keys for different purposes
   - Rotate keys every 6 months

2. **GitHub Secrets**
   - Never commit secrets to repository
   - Use environment-specific secrets
   - Audit secret access regularly

3. **Droplet Security**
   - Keep system updated
   - Configure firewall properly
   - Use SSH keys, disable password auth
   - Enable automatic security updates

4. **Docker Security**
   - Don't run as root inside containers
   - Scan images for vulnerabilities
   - Keep base images updated
   - Limit container resources

## 🎯 Next Steps

After successful setup:

1. ✅ Configure custom domain
2. ✅ Enable HTTPS with Let's Encrypt
3. ✅ Set up monitoring and alerts
4. ✅ Configure backup strategy
5. ✅ Set up staging environment
6. ✅ Add integration tests
7. ✅ Configure CDN (optional)
8. ✅ Set up log aggregation

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check droplet logs via SSH
4. Review Digital Ocean documentation
5. Create issue in repository

---

**Last Updated:** 2025-01-02
**Version:** 1.0.0
