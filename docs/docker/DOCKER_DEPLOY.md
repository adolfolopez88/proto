# Docker Deployment Guide

## Quick Start

### Local Testing
```bash
# Build and run
docker-compose up --build

# Access app at http://localhost:8080
```

### Production Server Deployment

#### Option 1: Using docker-compose (Recommended)
```bash
# 1. Upload files to server
scp -r . user@server:/path/to/app

# 2. SSH into server
ssh user@server

# 3. Navigate to app directory
cd /path/to/app

# 4. Build and run
docker-compose up -d --build

# 5. Check status
docker-compose ps
docker-compose logs -f fuse-app
```

#### Option 2: Manual Docker Commands
```bash
# Build image
docker build -t fuse-app:latest .

# Run container
docker run -d \
  --name fuse-app \
  -p 8080:80 \
  --restart unless-stopped \
  fuse-app:latest

# Check status
docker ps
docker logs -f fuse-app
```

## Port Configuration

**Default Setup:**
- Container internal port: `80` (Nginx)
- Host external port: `8080` (configurable)

**To change external port:**

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 3000 to any available port
```

Or with docker run:
```bash
docker run -d -p 3000:80 --name fuse-app fuse-app:latest
```

## Troubleshooting

### Container not starting
```bash
# Check logs
docker-compose logs fuse-app

# Or
docker logs fuse-app
```

### Build failing
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port not accessible
```bash
# Check if port is actually mapped
docker ps

# Should show: 0.0.0.0:8080->80/tcp

# Check if container is healthy
docker inspect fuse-app | grep -A 5 Health
```

### No ports showing in Docker Desktop
This usually means:
1. Container crashed immediately after start
2. Build failed but container started anyway
3. Nginx configuration issue

**Solution:**
```bash
# Stop everything
docker-compose down

# Rebuild from scratch
docker-compose build --no-cache

# Run and watch logs
docker-compose up
```

## Server Firewall Configuration

If deploying to a remote server, ensure firewall allows the port:

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 8080/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables-save
```

## Production Checklist

- [ ] Build completes successfully (`docker-compose build`)
- [ ] Container starts (`docker-compose up -d`)
- [ ] Port is mapped (`docker ps` shows `0.0.0.0:8080->80/tcp`)
- [ ] Health check passes (`docker inspect fuse-app | grep Health`)
- [ ] App accessible at `http://server-ip:8080`
- [ ] Firewall allows port 8080
- [ ] Container auto-restarts on crash (`restart: unless-stopped`)

## Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Clean everything
docker-compose down -v
docker system prune -a
```
