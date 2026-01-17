# Script de Deploy Manual - Método más básico y confiable
# Usa comandos uno por uno con pausas para debug

$SERVER = "root@206.189.163.147"
$DEPLOY_PATH = "/var/www/fuse-app"

Write-Host "`n=== DEPLOY MANUAL PASO A PASO ===" -ForegroundColor Cyan
Write-Host "Servidor: $SERVER`n" -ForegroundColor Yellow

# Paso 1: Crear directorio en servidor
Write-Host "[1/6] Creando directorio en servidor..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p $DEPLOY_PATH && chmod 755 $DEPLOY_PATH && ls -la /var/www/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear directorio" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Directorio creado`n" -ForegroundColor Green

# Paso 2: Subir Dockerfile
Write-Host "[2/6] Subiendo Dockerfile..." -ForegroundColor Yellow
scp Dockerfile "${SERVER}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló subida de Dockerfile" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Dockerfile subido`n" -ForegroundColor Green

# Paso 3: Subir docker-compose.yml
Write-Host "[3/6] Subiendo docker-compose.yml..." -ForegroundColor Yellow
scp docker-compose.yml "${SERVER}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló subida de docker-compose.yml" -ForegroundColor Red
    exit 1
}
Write-Host "OK - docker-compose.yml subido`n" -ForegroundColor Green

# Paso 4: Subir nginx.conf
Write-Host "[4/6] Subiendo nginx.conf..." -ForegroundColor Yellow
scp nginx.conf "${SERVER}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló subida de nginx.conf" -ForegroundColor Red
    exit 1
}
Write-Host "OK - nginx.conf subido`n" -ForegroundColor Green

# Paso 5: Subir archivos de configuración
Write-Host "[5/6] Subiendo archivos de configuración..." -ForegroundColor Yellow
scp package.json package-lock.json angular.json tsconfig.json tsconfig.app.json tailwind.config.js "${SERVER}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló subida de archivos de config" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Archivos de config subidos`n" -ForegroundColor Green

# Paso 6: Subir código fuente (src/)
Write-Host "[6/6] Subiendo código fuente (esto puede tardar)..." -ForegroundColor Yellow
scp -r src "${SERVER}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló subida de src/" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Código fuente subido`n" -ForegroundColor Green

# Verificar archivos en servidor
Write-Host "[VERIFICACION] Verificando archivos en servidor..." -ForegroundColor Yellow
ssh $SERVER "ls -lh $DEPLOY_PATH"
Write-Host ""

# Construir e iniciar
Write-Host "[BUILD] Iniciando construcción de imagen Docker..." -ForegroundColor Cyan
Write-Host "Esto tomará 5-10 minutos. Mantente conectado...`n" -ForegroundColor Yellow

# Construir
Write-Host "=== Construyendo imagen ===" -ForegroundColor Yellow
ssh $SERVER "cd $DEPLOY_PATH && docker-compose build --no-cache"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Build falló" -ForegroundColor Red
    exit 1
}

# Iniciar
Write-Host "`n=== Iniciando contenedores ===" -ForegroundColor Yellow
ssh $SERVER "cd $DEPLOY_PATH && docker-compose up -d"

# Verificar estado
Write-Host "`n=== Estado de contenedores ===" -ForegroundColor Yellow
ssh $SERVER "docker ps"

# Ver logs
Write-Host "`n=== Logs (últimas 20 líneas) ===" -ForegroundColor Yellow
ssh $SERVER "docker logs --tail 20 fuse-app"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "     DEPLOY COMPLETADO                  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`n[URL] http://206.189.163.147:8080`n" -ForegroundColor Cyan

    Write-Host "[COMANDOS ÚTILES]" -ForegroundColor Yellow
    Write-Host "   Ver logs completos:" -ForegroundColor Gray
    Write-Host "      ssh $SERVER 'docker logs -f fuse-app'`n" -ForegroundColor White
} else {
    Write-Host "`nERROR: Build o inicio falló. Revisa los logs arriba." -ForegroundColor Red
    Write-Host "Para ver logs completos:" -ForegroundColor Yellow
    Write-Host "   ssh $SERVER 'docker logs fuse-app'" -ForegroundColor White
}
