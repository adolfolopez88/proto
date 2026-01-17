# Deploy Script Simplificado para Docker Compose
# PowerShell Script - Más robusto y con mejor manejo de errores

# ============================================
# CONFIGURACION
# ============================================
$SERVER_IP = "206.189.163.147"
$SERVER_USER = "root"
$SERVER_PORT = 22
$DEPLOY_PATH = "/var/www/fuse-app"
$CONTAINER_PORT = 8080
$APP_NAME = "fuse-app"

# ============================================
# FUNCIONES
# ============================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n[PASO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "   $Message" -ForegroundColor Gray
}
<# 
# ============================================
# INICIO
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Docker Deploy - Método Simplificado  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[CONFIG] Servidor: ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Yellow
Write-Host "[CONFIG] Ruta: ${DEPLOY_PATH}" -ForegroundColor Yellow
Write-Host "[CONFIG] Puerto: ${CONTAINER_PORT}" -ForegroundColor Yellow

# ============================================
# PASO 1: Verificar conexión SSH
# ============================================

Write-Step "Verificando conexión SSH..."

$sshTest = ssh -o ConnectTimeout=10 -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "echo OK" 2>&1

if ($sshTest -notmatch "OK") {
    Write-Error-Message "No se puede conectar al servidor"
    Write-Host $sshTest -ForegroundColor Red
    exit 1
}

Write-Success "Conexión SSH establecida"

# ============================================
# PASO 2: Preparar servidor PRIMERO
# ============================================

Write-Step "Preparando directorio en servidor..."

# Ejecutar comandos por separado para evitar problemas de sintaxis
Write-Info "Deteniendo contenedores existentes..."
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "cd $DEPLOY_PATH 2>/dev/null && docker-compose down 2>/dev/null || true; docker stop $APP_NAME 2>/dev/null || true; docker rm $APP_NAME 2>/dev/null || true"

Write-Info "Creando backup si existe..."
$backupCmd = 'if [ -d ' + $DEPLOY_PATH + ' ]; then BACKUP_DIR=' + $DEPLOY_PATH + '_backup_$(date +%Y%m%d_%H%M%S); cp -r ' + $DEPLOY_PATH + ' $BACKUP_DIR 2>/dev/null || true; echo Backup creado en $BACKUP_DIR; fi'
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" $backupCmd

Write-Info "Creando directorio con permisos..."
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "mkdir -p $DEPLOY_PATH && chmod 755 $DEPLOY_PATH && echo Directorio preparado: $DEPLOY_PATH"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "No se pudo preparar el directorio en el servidor"
    exit 1
}

Write-Success "Directorio en servidor listo"

# ============================================
# PASO 3: Crear paquete de archivos
# ============================================

Write-Step "Creando paquete de archivos..."

$packageFile = "deploy-package.tar.gz"

# Eliminar paquete anterior si existe
if (Test-Path $packageFile) {
    Remove-Item $packageFile -Force
}

# Verificar que tar está disponible
if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
    Write-Error-Message "tar no está disponible. Usando método alternativo..."

    # Método alternativo: usar 7-Zip o Compress-Archive
    if (Get-Command 7z -ErrorAction SilentlyContinue) {
        Write-Info "Usando 7-Zip para empaquetar..."
        7z a -ttar $packageFile Dockerfile docker-compose.yml nginx.conf package.json package-lock.json angular.json tsconfig.json tsconfig.app.json tailwind.config.js src 2>&1 | Out-Null
    } else {
        Write-Info "Usando Compress-Archive..."
        $packageFile = "deploy-package.zip"
        Compress-Archive -Path Dockerfile,docker-compose.yml,nginx.conf,package.json,package-lock.json,angular.json,tsconfig.json,tsconfig.app.json,tailwind.config.js,src -DestinationPath $packageFile -Force
    }
} else {
    Write-Info "Usando tar para empaquetar..."
    tar -czf $packageFile Dockerfile docker-compose.yml nginx.conf package.json package-lock.json angular.json tsconfig.json tsconfig.app.json tailwind.config.js src 2>&1
}

if (-not (Test-Path $packageFile)) {
    Write-Error-Message "No se pudo crear el paquete"
    exit 1
}

$packageSize = [math]::Round((Get-Item $packageFile).Length / 1MB, 2)
Write-Success "Paquete creado: $packageFile ($packageSize MB)"

# ============================================
# PASO 4: Subir paquete
# ============================================

Write-Step "Subiendo paquete al servidor..."

Write-Info "Esto puede tomar varios minutos dependiendo de tu conexión..."

# Usar scp con barra de progreso
scp -P $SERVER_PORT $packageFile "${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Falló la subida del paquete"
    Remove-Item $packageFile -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Success "Paquete subido exitosamente"

# Limpiar paquete local
Remove-Item $packageFile -Force

# ============================================
# PASO 5: Descomprimir en servidor
# ============================================

Write-Step "Descomprimiendo archivos en servidor..."

$extractCmd = if ($packageFile -match ".zip") {
    "cd $DEPLOY_PATH && unzip -o $packageFile && rm $packageFile"
} else {
    "cd $DEPLOY_PATH && tar -xzf $packageFile && rm $packageFile"
}

ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" $extractCmd

Write-Success "Archivos descomprimidos" #>

# ============================================
# PASO 6: Construir imagen Docker
# ============================================

Write-Step "Construyendo imagen Docker..."
Write-Info "Esto tomará 5-10 minutos la primera vez..."

# Verificar Docker en servidor
$dockerCheck = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "command -v docker"
if (-not $dockerCheck) {
    Write-Error-Message "Docker no está instalado en el servidor"
    Write-Info "Instala Docker con: curl -fsSL https://get.docker.com | sh"
    exit 1
}

# Construir imagen
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "cd ${DEPLOY_PATH} && docker-compose build --no-cache"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Build falló. Revisando logs..."
    ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "cd ${DEPLOY_PATH} && docker-compose logs"
    exit 1
}

Write-Success "Imagen construida"

# ============================================
# PASO 7: Iniciar contenedores
# ============================================

Write-Step "Iniciando contenedores..."

ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "cd $DEPLOY_PATH && docker-compose up -d"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Falló el inicio de contenedores"
    exit 1
}

Start-Sleep -Seconds 5

Write-Success "Contenedores iniciados"

# ============================================
# PASO 8: Verificar despliegue
# ============================================

Write-Step "Verificando despliegue..."

$status = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "docker ps --filter name=$APP_NAME --format '{{.Status}}'"

if ($status -match "Up") {
    Write-Success "Contenedor corriendo: $status"
} else {
    Write-Error-Message "Contenedor no está corriendo"
    Write-Info "Mostrando logs..."
    ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "docker logs $APP_NAME"
    exit 1
}

# Verificar puerto
$ports = ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "docker ps --filter name=$APP_NAME --format '{{.Ports}}'"
Write-Success "Puertos: $ports"

# ============================================
# PASO 9: Configurar firewall
# ============================================

Write-Step "Configurando firewall..."

# Configurar UFW si está disponible
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "if command -v ufw &>/dev/null; then ufw allow ${CONTAINER_PORT}/tcp 2>/dev/null || true; echo UFW configurado; fi"

# Configurar firewalld si está disponible
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "if command -v firewall-cmd &>/dev/null; then firewall-cmd --permanent --add-port=${CONTAINER_PORT}/tcp 2>/dev/null || true; firewall-cmd --reload 2>/dev/null || true; echo firewalld configurado; fi"

Write-Success "Firewall configurado"

# ============================================
# RESUMEN
# ============================================

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "     DESPLIEGUE COMPLETADO              " -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "[URL] http://${SERVER_IP}:${CONTAINER_PORT}`n" -ForegroundColor Cyan

Write-Host "[COMANDOS ÚTILES]" -ForegroundColor Yellow
Write-Info "Ver logs:"
Write-Info "   ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f $APP_NAME'"
Write-Host ""
Write-Info "Reiniciar:"
Write-Info "   ssh ${SERVER_USER}@${SERVER_IP} 'cd $DEPLOY_PATH && docker-compose restart'"
Write-Host ""
Write-Info "Ver estado:"
Write-Info "   ssh ${SERVER_USER}@${SERVER_IP} 'docker ps'"
Write-Host ""
