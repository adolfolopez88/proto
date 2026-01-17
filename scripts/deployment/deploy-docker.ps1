# Deploy Script para Docker Compose en Servidor
# PowerShell Script - Despliegue automatizado

# ============================================
# CONFIGURACION - MODIFICA ESTOS VALORES
# ============================================
$SERVER_IP = "206.189.163.147"             # IP del servidor
$SERVER_USER = "root"                      # Usuario SSH
$SERVER_PORT = 22                          # Puerto SSH
$DEPLOY_PATH = "/var/www/fuse-app"         # Ruta en el servidor
$CONTAINER_PORT = 8080                     # Puerto externo (host)
$APP_NAME = "fuse-app"                     # Nombre del contenedor

# ============================================
# ARCHIVOS A TRANSFERIR
# ============================================
$FILES_TO_DEPLOY = @(
    "Dockerfile",
    "docker-compose.yml",
    "nginx.conf",
    "package.json",
    "package-lock.json",
    "angular.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "src",
    "tailwind.config.js"
)

# ============================================
# FUNCIONES
# ============================================

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-CommandSuccess {
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Comando fallido" "Red"
        return $false
    }
    return $true
}

function Show-Header {
    Write-ColorOutput "`n========================================" "Cyan"
    Write-ColorOutput "  Docker Compose Deploy to Server      " "Cyan"
    Write-ColorOutput "========================================" "Cyan"
    Write-Host ""
}

function Show-Config {
    Write-ColorOutput "[CONFIG] Configuracion:" "Yellow"
    Write-ColorOutput "   Servidor: ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}" "Gray"
    Write-ColorOutput "   Ruta: ${DEPLOY_PATH}" "Gray"
    Write-ColorOutput "   Puerto: ${CONTAINER_PORT}" "Gray"
    Write-ColorOutput "   App: ${APP_NAME}" "Gray"
    Write-Host ""
}

# ============================================
# VALIDACIONES PREVIAS
# ============================================

function Test-LocalFiles {
    Write-ColorOutput "[VALIDACION] Verificando archivos locales..." "Yellow"

    $missingFiles = @()
    foreach ($file in $FILES_TO_DEPLOY) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-ColorOutput "[ERROR] Archivos faltantes:" "Red"
        $missingFiles | ForEach-Object { Write-ColorOutput "   - $_" "Red" }
        return $false
    }

    Write-ColorOutput "[OK] Todos los archivos necesarios existen" "Green"
    return $true
}

function Test-SSHConnection {
    Write-ColorOutput "`n[VALIDACION] Verificando conexion SSH..." "Yellow"

    $sshTest = ssh -o ConnectTimeout=5 -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "echo 'OK'" 2>&1

    if ($sshTest -notmatch "OK") {
        Write-ColorOutput "[ERROR] No se puede conectar al servidor" "Red"
        Write-ColorOutput "Verifica:" "Red"
        Write-ColorOutput "   - IP del servidor correcta" "Red"
        Write-ColorOutput "   - Usuario SSH correcto" "Red"
        Write-ColorOutput "   - Puerto SSH abierto" "Red"
        return $false
    }

    Write-ColorOutput "[OK] Conexion SSH exitosa" "Green"
    return $true
}

function Test-DockerInstalled {
    Write-ColorOutput "`n[VALIDACION] Verificando Docker en servidor..." "Yellow"

    $dockerCheck = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "docker --version 2>&1"

    if ($dockerCheck -notmatch "Docker version") {
        Write-ColorOutput "[ERROR] Docker no esta instalado en el servidor" "Red"
        Write-ColorOutput "Instala Docker con:" "Yellow"
        Write-ColorOutput "   curl -fsSL https://get.docker.com -o get-docker.sh" "Gray"
        Write-ColorOutput "   sudo sh get-docker.sh" "Gray"
        return $false
    }

    Write-ColorOutput "[OK] Docker instalado: $dockerCheck" "Green"

    $composeCheck = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "docker-compose --version 2>&1"

    if ($composeCheck -notmatch "docker-compose version") {
        Write-ColorOutput "[WARN] docker-compose no encontrado, intentando 'docker compose'..." "Yellow"
    } else {
        Write-ColorOutput "[OK] docker-compose instalado: $composeCheck" "Green"
    }

    return $true
}

# ============================================
# PROCESO DE DESPLIEGUE
# ============================================

function Stop-RemoteContainers {
    Write-ColorOutput "`n[PASO 1] Deteniendo contenedores existentes..." "Yellow"

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        cd $DEPLOY_PATH 2>/dev/null
        docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
        docker stop $APP_NAME 2>/dev/null || true
        docker rm $APP_NAME 2>/dev/null || true
"@

    Write-ColorOutput "[OK] Contenedores detenidos" "Green"
}

function Create-RemoteDirectory {
    Write-ColorOutput "`n[PASO 2] Preparando directorio en servidor..." "Yellow"

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        # Backup si existe
        if [ -d '$DEPLOY_PATH' ]; then
            BACKUP_DIR="${DEPLOY_PATH}_backup_`$(date +%Y%m%d_%H%M%S)"
            cp -r $DEPLOY_PATH \$BACKUP_DIR 2>/dev/null || true
            echo "Backup creado en \$BACKUP_DIR"
        fi

        # Crear directorio limpio
        mkdir -p $DEPLOY_PATH
        echo "Directorio preparado"
"@

    Write-ColorOutput "[OK] Directorio preparado" "Green"
}

function Upload-Files {
    Write-ColorOutput "`n[PASO 3] Subiendo archivos al servidor..." "Yellow"
    Write-ColorOutput "   Esto puede tomar varios minutos..." "Gray"

    # Crear archivo temporal para evitar subir archivos innecesarios
    $tempDir = "temp_deploy_$(Get-Date -Format 'yyyyMMddHHmmss')"

    try {
        # Crear directorio temporal
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

        # Copiar solo los archivos necesarios
        foreach ($file in $FILES_TO_DEPLOY) {
            if (Test-Path $file) {
                Write-ColorOutput "   Preparando $file..." "Gray"
                Copy-Item -Path $file -Destination $tempDir -Recurse -Force
            } else {
                Write-ColorOutput "   [WARN] $file no encontrado, omitiendo..." "Yellow"
            }
        }

        # Subir todo el directorio de una sola vez
        Write-ColorOutput "   Subiendo archivos al servidor..." "Gray"
        $remotePath = "${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}"

        # Ejecutar SCP con output visible para depuración
        $scpOutput = scp -P $SERVER_PORT -r "${tempDir}/*" $remotePath 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "[ERROR] Fallo al subir archivos" "Red"
            Write-ColorOutput "Detalle del error:" "Red"
            Write-Host $scpOutput -ForegroundColor Red
            return $false
        }

        Write-ColorOutput "[OK] Archivos subidos exitosamente" "Green"
        return $true

    } finally {
        # Limpiar directorio temporal
        if (Test-Path $tempDir) {
            Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Build-DockerImage {
    Write-ColorOutput "`n[PASO 4] Construyendo imagen Docker..." "Yellow"
    Write-ColorOutput "   Esto puede tomar 5-10 minutos..." "Gray"

    $buildOutput = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        cd $DEPLOY_PATH
        docker-compose build --no-cache 2>&1 || docker compose build --no-cache 2>&1
"@

    if ($buildOutput -match "ERROR" -or $LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Build fallido" "Red"
        Write-ColorOutput "Output:" "Red"
        Write-Host $buildOutput
        return $false
    }

    Write-ColorOutput "[OK] Imagen construida exitosamente" "Green"
    return $true
}

function Start-Containers {
    Write-ColorOutput "`n[PASO 5] Iniciando contenedores..." "Yellow"

    $startOutput = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        cd $DEPLOY_PATH
        docker-compose up -d 2>&1 || docker compose up -d 2>&1
"@

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Fallo al iniciar contenedores" "Red"
        Write-Host $startOutput
        return $false
    }

    Write-ColorOutput "[OK] Contenedores iniciados" "Green"
    return $true
}

function Verify-Deployment {
    Write-ColorOutput "`n[PASO 6] Verificando despliegue..." "Yellow"

    Start-Sleep -Seconds 5

    # Verificar que el contenedor este corriendo
    $containerStatus = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        docker ps --filter name=$APP_NAME --format '{{.Status}}'
"@

    if ($containerStatus -match "Up") {
        Write-ColorOutput "[OK] Contenedor corriendo: $containerStatus" "Green"
    } else {
        Write-ColorOutput "[ERROR] Contenedor no esta corriendo" "Red"

        # Mostrar logs
        Write-ColorOutput "`n[LOGS] Ultimas lineas del log:" "Yellow"
        ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "docker logs --tail 50 $APP_NAME"
        return $false
    }

    # Verificar puerto
    $portCheck = ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        docker ps --filter name=$APP_NAME --format '{{.Ports}}'
"@

    if ($portCheck -match "$CONTAINER_PORT") {
        Write-ColorOutput "[OK] Puerto mapeado: $portCheck" "Green"
    } else {
        Write-ColorOutput "[WARN] Puerto no visible: $portCheck" "Yellow"
    }

    return $true
}

function Configure-Firewall {
    Write-ColorOutput "`n[PASO 7] Configurando firewall..." "Yellow"

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} @"
        # Intentar configurar UFW si esta disponible
        if command -v ufw >/dev/null 2>&1; then
            ufw allow $CONTAINER_PORT/tcp 2>/dev/null || true
            echo "UFW: Puerto $CONTAINER_PORT abierto"
        fi

        # Intentar configurar firewalld si esta disponible
        if command -v firewall-cmd >/dev/null 2>&1; then
            firewall-cmd --permanent --add-port=$CONTAINER_PORT/tcp 2>/dev/null || true
            firewall-cmd --reload 2>/dev/null || true
            echo "firewalld: Puerto $CONTAINER_PORT abierto"
        fi
"@

    Write-ColorOutput "[OK] Firewall configurado (si estaba disponible)" "Green"
}

# ============================================
# SCRIPT PRINCIPAL
# ============================================

Show-Header
Show-Config

# Validaciones
if (-not (Test-LocalFiles)) { exit 1 }
if (-not (Test-SSHConnection)) { exit 1 }
if (-not (Test-DockerInstalled)) { exit 1 }

# Confirmacion
Write-Host ""
Write-ColorOutput "[CONFIRMACION] Listo para desplegar a $SERVER_IP" "Yellow"
$confirm = Read-Host "Continuar? (y/n)"
if ($confirm -ne "y") {
    Write-ColorOutput "Despliegue cancelado" "Red"
    exit 0
}

# Proceso de despliegue
Stop-RemoteContainers
Create-RemoteDirectory

if (-not (Upload-Files)) { exit 1 }
if (-not (Build-DockerImage)) { exit 1 }
if (-not (Start-Containers)) { exit 1 }
if (-not (Verify-Deployment)) { exit 1 }

Configure-Firewall

# ============================================
# RESUMEN FINAL
# ============================================

Write-Host ""
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "     DESPLIEGUE COMPLETADO              " "Green"
Write-ColorOutput "========================================" "Green"
Write-Host ""

Write-ColorOutput "[URL] http://${SERVER_IP}:${CONTAINER_PORT}" "Cyan"
Write-Host ""

Write-ColorOutput "[COMANDOS UTILES]" "Yellow"
Write-ColorOutput "   Ver logs:" "Gray"
Write-ColorOutput "      ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f ${APP_NAME}'" "Gray"
Write-Host ""
Write-ColorOutput "   Reiniciar app:" "Gray"
Write-ColorOutput "      ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose restart'" "Gray"
Write-Host ""
Write-ColorOutput "   Detener app:" "Gray"
Write-ColorOutput "      ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose down'" "Gray"
Write-Host ""
Write-ColorOutput "   Ver estado:" "Gray"
Write-ColorOutput "      ssh ${SERVER_USER}@${SERVER_IP} 'docker ps'" "Gray"
Write-Host ""
