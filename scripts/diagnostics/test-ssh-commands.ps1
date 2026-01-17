# Script de prueba para verificar comandos SSH
# Prueba cada comando individual antes del deploy completo

$SERVER = "root@206.189.163.147"
$DEPLOY_PATH = "/var/www/fuse-app"

Write-Host "`n=== PRUEBA DE COMANDOS SSH ===" -ForegroundColor Cyan
Write-Host "Servidor: $SERVER`n" -ForegroundColor Yellow

# Test 1: Comando simple
Write-Host "[Test 1] Comando simple 'echo'..." -ForegroundColor Yellow
ssh $SERVER "echo 'Test OK'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
    exit 1
}

# Test 2: Crear directorio
Write-Host "[Test 2] Crear directorio..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p $DEPLOY_PATH && chmod 755 $DEPLOY_PATH && echo 'Directorio creado'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
    exit 1
}

# Test 3: Comando con date (usando comillas simples)
Write-Host "[Test 3] Comando con date..." -ForegroundColor Yellow
$dateCmd = 'echo $(date +%Y%m%d_%H%M%S)'
ssh $SERVER $dateCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
    exit 1
}

# Test 4: Comando con if
Write-Host "[Test 4] Comando condicional if..." -ForegroundColor Yellow
$ifCmd = 'if [ -d ' + $DEPLOY_PATH + ' ]; then echo "Directorio existe"; else echo "No existe"; fi'
ssh $SERVER $ifCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
    exit 1
}

# Test 5: Comando con variables y date
Write-Host "[Test 5] Comando complejo con backup..." -ForegroundColor Yellow
$backupTestCmd = 'BACKUP_DIR=' + $DEPLOY_PATH + '_backup_$(date +%Y%m%d_%H%M%S); echo "Backup seria: $BACKUP_DIR"'
ssh $SERVER $backupTestCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
    exit 1
}

# Test 6: Listar directorio
Write-Host "[Test 6] Listar archivos en directorio..." -ForegroundColor Yellow
ssh $SERVER "ls -la $DEPLOY_PATH 2>/dev/null || echo 'Directorio vacio'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ OK`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ FALLO`n" -ForegroundColor Red
}

# Test 7: Verificar Docker
Write-Host "[Test 7] Verificar Docker instalado..." -ForegroundColor Yellow
$dockerCheck = ssh $SERVER "command -v docker"
if ($dockerCheck) {
    Write-Host "   ✓ Docker instalado: $dockerCheck`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ Docker NO instalado`n" -ForegroundColor Red
    Write-Host "   Instala con: curl -fsSL https://get.docker.com | sh`n" -ForegroundColor Yellow
}

# Test 8: Verificar docker-compose
Write-Host "[Test 8] Verificar docker-compose..." -ForegroundColor Yellow
$composeCheck = ssh $SERVER "docker-compose --version 2>&1 || docker compose version 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ docker-compose: $composeCheck`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠ docker-compose puede no estar disponible`n" -ForegroundColor Yellow
}

# Resumen
Write-Host "========================================" -ForegroundColor Green
Write-Host "   TODAS LAS PRUEBAS COMPLETADAS       " -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Sistema listo para deploy. Ejecuta:" -ForegroundColor Cyan
Write-Host "   .\deploy-docker-simple.ps1`n" -ForegroundColor White
