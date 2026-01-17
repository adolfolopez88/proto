# Script de Diagnóstico para Deploy
# Identifica problemas comunes antes del despliegue

$SERVER_IP = "206.189.163.147"
$SERVER_USER = "root"
$SERVER_PORT = 22
$DEPLOY_PATH = "/var/www/fuse-app"

Write-Host "`n=== DIAGNÓSTICO DE DEPLOY ===" -ForegroundColor Cyan
Write-Host "Servidor: ${SERVER_USER}@${SERVER_IP}`n" -ForegroundColor Yellow

# 1. Test SSH básico
Write-Host "[1/8] Probando conexión SSH..." -ForegroundColor Yellow
$sshTest = ssh -o ConnectTimeout=10 -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "echo 'SSH_OK'" 2>&1

if ($sshTest -match "SSH_OK") {
    Write-Host "   ✓ SSH funciona correctamente" -ForegroundColor Green
} else {
    Write-Host "   ✗ SSH falló" -ForegroundColor Red
    Write-Host "   Error: $sshTest" -ForegroundColor Red
    exit 1
}

# 2. Verificar Docker en servidor
Write-Host "`n[2/8] Verificando Docker en servidor..." -ForegroundColor Yellow
$dockerVersion = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "docker --version 2>&1"

if ($dockerVersion -match "Docker version") {
    Write-Host "   ✓ Docker instalado: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ Docker NO instalado" -ForegroundColor Red
    Write-Host "   Ejecuta: curl -fsSL https://get.docker.com | sh" -ForegroundColor Yellow
}

# 3. Verificar docker-compose
Write-Host "`n[3/8] Verificando docker-compose..." -ForegroundColor Yellow
$composeVersion = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "docker-compose --version 2>&1 || docker compose version 2>&1"

if ($composeVersion -match "version") {
    Write-Host "   ✓ docker-compose instalado: $composeVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ docker-compose NO instalado" -ForegroundColor Red
}

# 4. Verificar permisos en directorio
Write-Host "`n[4/8] Verificando permisos de directorio..." -ForegroundColor Yellow
$permCheck = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" @"
    mkdir -p $DEPLOY_PATH 2>&1
    if [ -w "$DEPLOY_PATH" ]; then
        echo "WRITABLE"
    else
        echo "NOT_WRITABLE"
    fi
"@

if ($permCheck -match "WRITABLE") {
    Write-Host "   ✓ Directorio tiene permisos de escritura" -ForegroundColor Green
} else {
    Write-Host "   ✗ Sin permisos de escritura en $DEPLOY_PATH" -ForegroundColor Red
}

# 5. Test de SCP simple
Write-Host "`n[5/8] Probando SCP con archivo pequeño..." -ForegroundColor Yellow
"test" | Out-File -FilePath "test.txt" -Encoding UTF8
$scpTest = scp -P $SERVER_PORT test.txt "${SERVER_USER}@${SERVER_IP}:/tmp/test.txt" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ SCP funciona correctamente" -ForegroundColor Green
    ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "rm /tmp/test.txt"
} else {
    Write-Host "   ✗ SCP falló" -ForegroundColor Red
    Write-Host "   Error: $scpTest" -ForegroundColor Red
}
Remove-Item test.txt -Force

# 6. Verificar espacio en disco
Write-Host "`n[6/8] Verificando espacio en disco..." -ForegroundColor Yellow
$diskSpace = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "df -h / | tail -1 | awk '{print \`$5}'"

if ($diskSpace) {
    Write-Host "   Uso de disco: $diskSpace" -ForegroundColor Gray
    if ($diskSpace -replace '%','' -as [int] -gt 90) {
        Write-Host "   ⚠ Poco espacio disponible" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ Espacio suficiente" -ForegroundColor Green
    }
}

# 7. Verificar puerto disponible
Write-Host "`n[7/8] Verificando si puerto 8080 está disponible..." -ForegroundColor Yellow
$portCheck = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "netstat -tuln | grep ':8080 ' || echo 'PORT_FREE'"

if ($portCheck -match "PORT_FREE") {
    Write-Host "   ✓ Puerto 8080 disponible" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Puerto 8080 en uso" -ForegroundColor Yellow
    Write-Host "   Proceso: $portCheck" -ForegroundColor Gray
}

# 8. Verificar archivos locales necesarios
Write-Host "`n[8/8] Verificando archivos locales..." -ForegroundColor Yellow
$requiredFiles = @("Dockerfile", "docker-compose.yml", "nginx.conf", "package.json", "package-lock.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file FALTANTE" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Resumen
Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan

if ($missingFiles.Count -eq 0 -and $sshTest -match "SSH_OK" -and $dockerVersion -match "Docker version") {
    Write-Host "✓ Sistema listo para despliegue" -ForegroundColor Green
    Write-Host "`nEjecuta: .\deploy-docker-simple.ps1" -ForegroundColor Yellow
} else {
    Write-Host "✗ Hay problemas que resolver antes de desplegar" -ForegroundColor Red

    if ($missingFiles.Count -gt 0) {
        Write-Host "`nArchivos faltantes:" -ForegroundColor Yellow
        $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    }

    if ($dockerVersion -notmatch "Docker version") {
        Write-Host "`nInstalar Docker en servidor:" -ForegroundColor Yellow
        Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Gray
        Write-Host "   curl -fsSL https://get.docker.com | sh" -ForegroundColor Gray
    }
}

Write-Host ""
