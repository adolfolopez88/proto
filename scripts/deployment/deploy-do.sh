#!/bin/bash
# Deploy Script para Digital Ocean
# Bash Script (Linux/Mac)

# ============================================
# CONFIGURACIÓN - MODIFICA ESTOS VALORES
# ============================================
DROPLET_IP="157.245.226.11"              # Reemplazar con IP del droplet
DROPLET_USER="root"                       # Usuario SSH
DEPLOY_PATH="/var/www/fuse-app"           # Ruta en el servidor
SSH_PORT=22                               # Puerto SSH

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES
# ============================================

print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

check_error() {
    if [ $? -ne 0 ]; then
        print_color $RED "❌ Error en el proceso"
        exit 1
    fi
}

check_config() {
    if [ "$DROPLET_IP" == "YOUR_DROPLET_IP" ]; then
        print_color $YELLOW "⚠️  CONFIGURACIÓN REQUERIDA"
        print_color $YELLOW "Por favor edita deploy-do.sh y configura:"
        print_color $YELLOW "  - DROPLET_IP: IP de tu droplet"
        print_color $YELLOW "  - DROPLET_USER: Usuario SSH (por defecto: root)"
        print_color $YELLOW "  - DEPLOY_PATH: Ruta en el servidor"
        exit 1
    fi
}

# ============================================
# INICIO DEL SCRIPT
# ============================================

print_color $CYAN "╔════════════════════════════════════════╗"
print_color $CYAN "║   Deploy a Digital Ocean Droplet       ║"
print_color $CYAN "╚════════════════════════════════════════╝"
echo ""

# Verificar configuración
check_config

print_color $CYAN "📋 Configuración:"
print_color $GRAY "   IP: $DROPLET_IP"
print_color $GRAY "   Usuario: $DROPLET_USER"
print_color $GRAY "   Ruta: $DEPLOY_PATH"
echo ""

# ============================================
# PASO 1: BUILD DE PRODUCCIÓN
# ============================================
print_color $YELLOW "🔨 Paso 1: Building producción..."

npm run build:prod
check_error

print_color $GREEN "✅ Build completado"
echo ""

# ============================================
# PASO 2: VERIFICAR CONEXIÓN SSH
# ============================================
print_color $YELLOW "🔐 Paso 2: Verificando conexión SSH..."

ssh -o ConnectTimeout=5 -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "echo 'OK'" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    print_color $RED "❌ No se puede conectar al droplet"
    print_color $RED "Verifica:"
    print_color $RED "  - IP del droplet correcta"
    print_color $RED "  - Usuario SSH correcto"
    print_color $RED "  - Puerto SSH correcto"
    print_color $RED "  - Firewall permite conexiones SSH"
    exit 1
fi

print_color $GREEN "✅ Conexión SSH exitosa"
echo ""

# ============================================
# PASO 3: BACKUP EN EL SERVIDOR
# ============================================
print_color $YELLOW "💾 Paso 3: Creando backup..."

ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} << EOF
    if [ -d '$DEPLOY_PATH' ]; then
        mkdir -p ${DEPLOY_PATH}_backup
        cp -r $DEPLOY_PATH/* ${DEPLOY_PATH}_backup/ 2>/dev/null || true
        echo 'Backup creado'
    else
        mkdir -p $DEPLOY_PATH
        echo 'Directorio creado'
    fi
EOF

print_color $GREEN "✅ Backup completado"
echo ""

# ============================================
# PASO 4: SUBIR ARCHIVOS
# ============================================
print_color $YELLOW "📤 Paso 4: Subiendo archivos al droplet..."

# Usar rsync si está disponible, sino SCP
if command -v rsync &> /dev/null; then
    rsync -avz --delete -e "ssh -p $SSH_PORT" dist/fuse/ ${DROPLET_USER}@${DROPLET_IP}:${DEPLOY_PATH}/
else
    scp -P $SSH_PORT -r dist/fuse/* ${DROPLET_USER}@${DROPLET_IP}:${DEPLOY_PATH}/
fi

check_error

print_color $GREEN "✅ Archivos subidos"
echo ""

# ============================================
# PASO 5: CONFIGURAR PERMISOS
# ============================================
print_color $YELLOW "🔒 Paso 5: Configurando permisos..."

ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} << EOF
    chown -R www-data:www-data $DEPLOY_PATH
    chmod -R 755 $DEPLOY_PATH
    echo 'Permisos configurados'
EOF

print_color $GREEN "✅ Permisos configurados"
echo ""

# ============================================
# PASO 6: VERIFICAR NGINX
# ============================================
print_color $YELLOW "🌐 Paso 6: Verificando Nginx..."

NGINX_STATUS=$(ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "systemctl is-active nginx" 2>&1)

if [ "$NGINX_STATUS" == "active" ]; then
    print_color $GREEN "✅ Nginx está corriendo"
else
    print_color $YELLOW "⚠️  Nginx no está activo. Intentando iniciar..."
    ssh -p $SSH_PORT ${DROPLET_USER}@${DROPLET_IP} "systemctl start nginx"
fi

echo ""

# ============================================
# FINALIZACIÓN
# ============================================
print_color $GREEN "╔════════════════════════════════════════╗"
print_color $GREEN "║         ✅ DEPLOY COMPLETADO           ║"
print_color $GREEN "╚════════════════════════════════════════╝"
echo ""
print_color $CYAN "🌐 URL: http://$DROPLET_IP"
echo ""
print_color $GRAY "📊 Estadísticas del deploy:"

BUILD_SIZE=$(du -sh dist/fuse | cut -f1)
print_color $GRAY "   Tamaño del build: $BUILD_SIZE"

FILE_COUNT=$(find dist/fuse -type f | wc -l)
print_color $GRAY "   Archivos desplegados: $FILE_COUNT"

echo ""
print_color $GRAY "💡 Comandos útiles:"
print_color $GRAY "   Ver logs: ssh $DROPLET_USER@$DROPLET_IP 'tail -f /var/log/nginx/access.log'"
print_color $GRAY "   Reiniciar Nginx: ssh $DROPLET_USER@$DROPLET_IP 'systemctl restart nginx'"
echo ""
