# Docker Build and Deployment Verification Script
# Run this before deploying to server

Write-Host "🔍 Docker Deployment Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "1. Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "   ✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker is not running or installed" -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
Write-Host "2. Checking docker-compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "   ✅ docker-compose is available" -ForegroundColor Green
} catch {
    Write-Host "   ❌ docker-compose is not available" -ForegroundColor Red
    exit 1
}

# Check required files
Write-Host "3. Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "Dockerfile",
    "docker-compose.yml",
    "nginx.conf",
    "package.json",
    "package-lock.json"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file MISSING" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n   Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "`n4. Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "   ✅ Cleaned up" -ForegroundColor Green

# Build the image
Write-Host "`n5. Building Docker image..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray
$buildResult = docker-compose build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed" -ForegroundColor Red
    Write-Host "`n   Build output:" -ForegroundColor Yellow
    Write-Host $buildResult
    exit 1
}

# Start the container
Write-Host "`n6. Starting container..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 3

# Check if container is running
Write-Host "`n7. Checking container status..." -ForegroundColor Yellow
$containerStatus = docker-compose ps --format json | ConvertFrom-Json 2>$null

if ($containerStatus.State -eq "running") {
    Write-Host "   ✅ Container is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Container is not running" -ForegroundColor Red
    Write-Host "`n   Logs:" -ForegroundColor Yellow
    docker-compose logs
    exit 1
}

# Check port mapping
Write-Host "`n8. Checking port mapping..." -ForegroundColor Yellow
$portCheck = docker ps --format "{{.Ports}}" --filter "name=fuse-app"

if ($portCheck -match "0.0.0.0:8080->80/tcp") {
    Write-Host "   ✅ Port 8080 is mapped to container port 80" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Port mapping: $portCheck" -ForegroundColor Yellow
}

# Health check
Write-Host "`n9. Waiting for health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ App is responding on port 8080" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  App not responding yet (this is normal, wait 30s)" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "✅ VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Access app at: http://localhost:8080" -ForegroundColor White
Write-Host "   2. View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   3. Stop app: docker-compose down" -ForegroundColor White
Write-Host "`n   For server deployment, see DOCKER_DEPLOY.md" -ForegroundColor Gray
Write-Host "=================================" -ForegroundColor Cyan
