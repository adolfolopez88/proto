#!/bin/bash
# Deploy Script para Docker Compose en Servidor
# Bash Script - Despliegue automatizado

# ============================================
# CONFIGURACION - MODIFICA ESTOS VALORES
# ============================================
SERVER_IP="157.245.226.11"
SERVER_USER="root"
SERVER_PORT=22
DEPLOY_PATH="/var/www/fuse-app"
CONTAINER_PORT=8080
APP_NAME="fuse-app"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES
# ============================================

print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}  Docker Compose Deploy to Server      ${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_config() {
    echo -e "${YELLOW}[CONFIG] Configuracion:${NC}"
    echo -e "${GRAY}   Servidor: ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}${NC}"
    echo -e "${GRAY}   Ruta: ${DEPLOY_PATH}${NC}"
    echo -e "${GRAY}   Puerto: ${CONTAINER_PORT}${NC}"
    echo -e "${GRAY}   App: ${APP_NAME}${NC}\n"
}

log_info() {
    echo -e "${YELLOW}$1${NC}"
}

log_success() {
    echo -e "${GREEN}$1${NC}"
}

log_error() {
    echo -e "${RED}$1${NC}"
}

log_gray() {
    echo -e "${GRAY}$1${NC}"
}

# ============================================
# VALIDACIONES
# ============================================

validate_local_files() {
    log_info "\n[VALIDACION] Verificando archivos locales..."

    local files=(
        "Dockerfile"
        "docker-compose.yml"
        "nginx.conf"
        "package.json"
        "package-lock.json"
    )

    local missing_files=()

    for file in "${files[@]}"; do
        if [ ! -e "$file" ]; then
            missing_files+=("$file")
        fi
    done

    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "[ERROR] Archivos faltantes:"
        printf '%s\n' "${missing_files[@]}" | sed 's/^/   - /'
        return 1
    fi

    log_success "[OK] Todos los archivos necesarios existen"
    return 0
}

validate_ssh_connection() {
    log_info "\n[VALIDACION] Verificando conexion SSH..."

    if ssh -o ConnectTimeout=5 -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "echo 'OK'" &>/dev/null; then
        log_success "[OK] Conexion SSH exitosa"
        return 0
    else
        log_error "[ERROR] No se puede conectar al servidor"
        log_error "Verifica:"
        log_error "   - IP del servidor correcta"
        log_error "   - Usuario SSH correcto"
        log_error "   - Puerto SSH abierto"
        return 1
    fi
}

validate_docker_installed() {
    log_info "\n[VALIDACION] Verificando Docker en servidor..."

    local docker_version=$(ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "docker --version 2>&1")

    if [[ $docker_version != *"Docker version"* ]]; then
        log_error "[ERROR] Docker no esta instalado en el servidor"
        log_info "Instala Docker con:"
        log_gray "   curl -fsSL https://get.docker.com -o get-docker.sh"
        log_gray "   sudo sh get-docker.sh"
        return 1
    fi

    log_success "[OK] Docker instalado: $docker_version"
    return 0
}

# ============================================
# PROCESO DE DESPLIEGUE
# ============================================

stop_remote_containers() {
    log_info "\n[PASO 1] Deteniendo contenedores existentes..."

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << EOF
        cd $DEPLOY_PATH 2>/dev/null
        docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
        docker stop $APP_NAME 2>/dev/null || true
        docker rm $APP_NAME 2>/dev/null || true
EOF

    log_success "[OK] Contenedores detenidos"
}

create_remote_directory() {
    log_info "\n[PASO 2] Preparando directorio en servidor..."

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << EOF
        # Backup si existe
        if [ -d "$DEPLOY_PATH" ]; then
            BACKUP_DIR="${DEPLOY_PATH}_backup_\$(date +%Y%m%d_%H%M%S)"
            cp -r $DEPLOY_PATH \$BACKUP_DIR 2>/dev/null || true
            echo "Backup creado en \$BACKUP_DIR"
        fi

        # Crear directorio limpio
        mkdir -p $DEPLOY_PATH
        echo "Directorio preparado"
EOF

    log_success "[OK] Directorio preparado"
}

upload_files() {
    log_info "\n[PASO 3] Subiendo archivos al servidor..."
    log_gray "   Esto puede tomar varios minutos..."

    # Usar rsync si esta disponible, sino scp
    if command -v rsync &> /dev/null; then
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude 'dist' \
            --exclude '.angular' \
            --exclude '.git' \
            --exclude '*.log' \
            -e "ssh -p $SERVER_PORT" \
            ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/
    else
        scp -P $SERVER_PORT -r \
            Dockerfile docker-compose.yml nginx.conf package*.json \
            angular.json tsconfig*.json tailwind.config.js src \
            ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/
    fi

    if [ $? -eq 0 ]; then
        log_success "[OK] Archivos subidos exitosamente"
        return 0
    else
        log_error "[ERROR] Fallo al subir archivos"
        return 1
    fi
}

build_docker_image() {
    log_info "\n[PASO 4] Construyendo imagen Docker..."
    log_gray "   Esto puede tomar 5-10 minutos..."

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << EOF
        cd $DEPLOY_PATH
        docker-compose build --no-cache 2>&1 || docker compose build --no-cache 2>&1
EOF

    if [ $? -eq 0 ]; then
        log_success "[OK] Imagen construida exitosamente"
        return 0
    else
        log_error "[ERROR] Build fallido"
        return 1
    fi
}

start_containers() {
    log_info "\n[PASO 5] Iniciando contenedores..."

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << EOF
        cd $DEPLOY_PATH
        docker-compose up -d 2>&1 || docker compose up -d 2>&1
EOF

    if [ $? -eq 0 ]; then
        log_success "[OK] Contenedores iniciados"
        return 0
    else
        log_error "[ERROR] Fallo al iniciar contenedores"
        return 1
    fi
}

verify_deployment() {
    log_info "\n[PASO 6] Verificando despliegue..."

    sleep 5

    local container_status=$(ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} \
        "docker ps --filter name=$APP_NAME --format '{{.Status}}'")

    if [[ $container_status == *"Up"* ]]; then
        log_success "[OK] Contenedor corriendo: $container_status"
    else
        log_error "[ERROR] Contenedor no esta corriendo"
        log_info "\n[LOGS] Ultimas lineas del log:"
        ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} "docker logs --tail 50 $APP_NAME"
        return 1
    fi

    local port_check=$(ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} \
        "docker ps --filter name=$APP_NAME --format '{{.Ports}}'")

    if [[ $port_check == *"$CONTAINER_PORT"* ]]; then
        log_success "[OK] Puerto mapeado: $port_check"
    else
        log_error "[WARN] Puerto no visible: $port_check"
    fi

    return 0
}

configure_firewall() {
    log_info "\n[PASO 7] Configurando firewall..."

    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << EOF
        # UFW
        if command -v ufw >/dev/null 2>&1; then
            ufw allow $CONTAINER_PORT/tcp 2>/dev/null || true
            echo "UFW: Puerto $CONTAINER_PORT abierto"
        fi

        # firewalld
        if command -v firewall-cmd >/dev/null 2>&1; then
            firewall-cmd --permanent --add-port=$CONTAINER_PORT/tcp 2>/dev/null || true
            firewall-cmd --reload 2>/dev/null || true
            echo "firewalld: Puerto $CONTAINER_PORT abierto"
        fi
EOF

    log_success "[OK] Firewall configurado (si estaba disponible)"
}

# ============================================
# SCRIPT PRINCIPAL
# ============================================

print_header
print_config

# Validaciones
validate_local_files || exit 1
validate_ssh_connection || exit 1
validate_docker_installed || exit 1

# Confirmacion
echo ""
log_info "[CONFIRMACION] Listo para desplegar a $SERVER_IP"
read -p "Continuar? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_error "Despliegue cancelado"
    exit 0
fi

# Proceso de despliegue
stop_remote_containers
create_remote_directory
upload_files || exit 1
build_docker_image || exit 1
start_containers || exit 1
verify_deployment || exit 1
configure_firewall

# ============================================
# RESUMEN FINAL
# ============================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}     DESPLIEGUE COMPLETADO              ${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}[URL] http://${SERVER_IP}:${CONTAINER_PORT}${NC}\n"

log_info "[COMANDOS UTILES]"
log_gray "   Ver logs:"
log_gray "      ssh $SERVER_USER@$SERVER_IP 'docker logs -f $APP_NAME'"
echo ""
log_gray "   Reiniciar app:"
log_gray "      ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose restart'"
echo ""
log_gray "   Detener app:"
log_gray "      ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose down'"
echo ""
log_gray "   Ver estado:"
log_gray "      ssh $SERVER_USER@$SERVER_IP 'docker ps'"
echo ""
