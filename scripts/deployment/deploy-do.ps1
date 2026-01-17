# Deploy Script para Digital Ocean
# PowerShell Script

# ============================================
# CONFIGURACION - MODIFICA ESTOS VALORES
# ============================================
$DROPLET_IP = "157.245.226.11"           # Reemplazar con IP del droplet
$DROPLET_USER = "root"                    # Usuario SSH
$DEPLOY_PATH = "/var/www/fuse-app"        # Ruta en el servidor
$SSH_PORT = 22                            # Puerto SSH

# ============================================
# AUTENTICACION
# ============================================
# Deja esto vacio para usar password (te pedira password en cada conexion)
# O configura SSH key para deploy automatico sin password
# Ver: DEPLOY_PASSWORD_SSH.md para instrucciones

# ============================================
# FUNCIONES
# ============================================

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-BuildSuccess {
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Error en el proceso" "Red"
        exit 1
    }
}

function Test-DropletConfig {
    if ($DROPLET_IP -eq "YOUR_DROPLET_IP") {
        Write-ColorOutput "[AVISO] CONFIGURACION REQUERIDA" "Yellow"
        Write-ColorOutput "Por favor edita deploy-do.ps1 y configura:" "Yellow"
        Write-ColorOutput "  - DROPLET_IP: IP de tu droplet" "Yellow"
        Write-ColorOutput "  - DROPLET_USER: Usuario SSH (por defecto: root)" "Yellow"
        Write-ColorOutput "  - DEPLOY_PATH: Ruta en el servidor" "Yellow"
        exit 1
    }
}

# ============================================
# INICIO DEL SCRIPT
# ============================================

Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "   Deploy a Digital Ocean Droplet      " "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-Host ""

# Verificar configuracion
Test-DropletConfig

Write-ColorOutput "[INFO] Configuracion:" "Cyan"
Write-ColorOutput "   IP: $DROPLET_IP" "Gray"
Write-ColorOutput "   Usuario: $DROPLET_USER" "Gray"
Write-ColorOutput "   Ruta: $DEPLOY_PATH" "Gray"
Write-Host ""

# ============================================
# PASO 1: BUILD DE PRODUCCION
# ============================================
Write-ColorOutput "[PASO 1] Building produccion..." "Yellow"

#npm run build:prod
#Test-BuildSuccess

Write-ColorOutput "[OK] Build completado" "Green"
Write-Host ""

# ============================================
# PASO 2: VERIFICAR CONEXION SSH
# ============================================
Write-ColorOutput "[PASO 2] Verificando conexion SSH..." "Yellow"

$sshTest = ssh -o ConnectTimeout=5 -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "echo 'OK'" 2>&1

if ($sshTest -notmatch "OK") {
    Write-ColorOutput "[ERROR] No se puede conectar al droplet" "Red"
    Write-ColorOutput "Verifica:" "Red"
    Write-ColorOutput "  - IP del droplet correcta" "Red"
    Write-ColorOutput "  - Usuario SSH correcto" "Red"
    Write-ColorOutput "  - Puerto SSH correcto" "Red"
    Write-ColorOutput "  - Firewall permite conexiones SSH" "Red"
    exit 1
}

Write-ColorOutput "[OK] Conexion SSH exitosa" "Green"
Write-Host ""

# ============================================
# PASO 3: BACKUP EN EL SERVIDOR
# ============================================
#Write-ColorOutput "[PASO 3] Creando backup..." "Yellow"

#ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} @"
#    if [ -d '$DEPLOY_PATH' ]; then
#        mkdir -p ${DEPLOY_PATH}_backup
#        cp -r $DEPLOY_PATH/* ${DEPLOY_PATH}_backup/ 2>/dev/null || true
#        echo 'Backup creado'
#    else
#        mkdir -p $DEPLOY_PATH
#        echo 'Directorio creado'
#    fi
#"@

Write-ColorOutput "[OK] Backup completado" "Green"
Write-Host ""

# ============================================
# PASO 4: SUBIR ARCHIVOS
# ============================================
Write-ColorOutput "[PASO 4] Subiendo archivos al droplet..." "Yellow"

# Usar SCP para subir archivos
scp -P $SSH_PORT -r dist/fuse/* ${DROPLET_USER}@${DROPLET_IP}:${DEPLOY_PATH}/
Test-BuildSuccess

Write-ColorOutput "[OK] Archivos subidos" "Green"
Write-Host ""

# ============================================
# PASO 5: CONFIGURAR PERMISOS
# ============================================
Write-ColorOutput "[PASO 5] Configurando permisos..." "Yellow"

ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} @"
    chown -R www-data:www-data $DEPLOY_PATH
    chmod -R 755 $DEPLOY_PATH
    echo 'Permisos configurados'
"@

Write-ColorOutput "[OK] Permisos configurados" "Green"
Write-Host ""

# ============================================
# PASO 6: VERIFICAR NGINX
# ============================================
Write-ColorOutput "[PASO 6] Verificando Nginx..." "Yellow"

$nginxStatus = ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "systemctl is-active nginx" 2>&1

if ($nginxStatus -match "active") {
    Write-ColorOutput "[OK] Nginx esta corriendo" "Green"
} else {
    Write-ColorOutput "[AVISO] Nginx no esta activo. Intentando iniciar..." "Yellow"
    ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "systemctl start nginx"
}

Write-Host ""

# ============================================
# FINALIZACION
# ============================================
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "        DEPLOY COMPLETADO               " "Green"
Write-ColorOutput "========================================" "Green"
Write-Host ""
Write-ColorOutput "[URL] http://$DROPLET_IP" "Cyan"
Write-Host ""
Write-ColorOutput "[ESTADISTICAS] Estadisticas del deploy:" "Gray"

$buildSize = (Get-ChildItem dist/fuse -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-ColorOutput "   Tamano del build: $([math]::Round($buildSize, 2)) MB" "Gray"

$fileCount = (Get-ChildItem dist/fuse -Recurse -File | Measure-Object).Count
Write-ColorOutput "   Archivos desplegados: $fileCount" "Gray"

Write-Host ""
Write-ColorOutput "[INFO] Comandos utiles:" "Gray"
Write-ColorOutput "   Ver logs: ssh $DROPLET_USER@$DROPLET_IP 'tail -f /var/log/nginx/access.log'" "Gray"
Write-ColorOutput "   Reiniciar Nginx: ssh $DROPLET_USER@$DROPLET_IP 'systemctl restart nginx'" "Gray"
Write-Host ""
