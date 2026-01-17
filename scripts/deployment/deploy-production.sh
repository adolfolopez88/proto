#!/bin/bash

###############################################################################
# Production Deployment Script for Fuse Angular App
# Usage: ./deploy-production.sh [OPTIONS]
#
# Options:
#   --skip-backup    Skip backup creation
#   --skip-health    Skip health checks
#   --rollback       Rollback to previous version
###############################################################################

set -euo pipefail

# Configuration
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-fuse-app}"
DOCKER_CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-fuse-app}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/fuse-app}"
BACKUP_DIR="${DEPLOY_PATH}/backups"
LOG_FILE="${DEPLOY_PATH}/logs/deploy.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
SKIP_BACKUP=false
SKIP_HEALTH=false
ROLLBACK=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-health)
            SKIP_HEALTH=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

# Info message
info() {
    echo -e "${BLUE}ℹ ${NC}$@"
    log "INFO" "$@"
}

# Success message
success() {
    echo -e "${GREEN}✅ ${NC}$@"
    log "SUCCESS" "$@"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  ${NC}$@"
    log "WARNING" "$@"
}

# Error message
error() {
    echo -e "${RED}❌ ${NC}$@"
    log "ERROR" "$@"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Create necessary directories
setup_directories() {
    info "Setting up directories..."

    mkdir -p "${DEPLOY_PATH}"
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${DEPLOY_PATH}/logs"

    success "Directories ready"
}

# Backup current deployment
backup_current() {
    if [[ "${SKIP_BACKUP}" == true ]]; then
        warning "Skipping backup as requested"
        return 0
    fi

    info "Creating backup of current deployment..."

    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"

    # Backup docker image
    if docker ps -q -f name="${DOCKER_CONTAINER_NAME}" > /dev/null 2>&1; then
        docker commit "${DOCKER_CONTAINER_NAME}" "${DOCKER_IMAGE_NAME}:${backup_name}"
        success "Container backed up as ${DOCKER_IMAGE_NAME}:${backup_name}"
    else
        warning "No running container to backup"
    fi

    # Backup docker-compose.yml
    if [[ -f "${DEPLOY_PATH}/docker-compose.yml" ]]; then
        cp "${DEPLOY_PATH}/docker-compose.yml" "${BACKUP_DIR}/docker-compose-${backup_name}.yml"
        success "Configuration backed up"
    fi

    # Keep only last 5 backups
    info "Cleaning old backups (keeping last 5)..."
    docker images "${DOCKER_IMAGE_NAME}" --format "{{.Repository}}:{{.Tag}}" | \
        grep "backup-" | \
        sort -r | \
        tail -n +6 | \
        xargs -r docker rmi -f || true

    ls -t "${BACKUP_DIR}"/docker-compose-backup-* 2>/dev/null | \
        tail -n +6 | \
        xargs -r rm -f || true
}

# Rollback to previous version
rollback_deployment() {
    info "Rolling back to previous version..."

    # Find latest backup
    local backup_image=$(docker images "${DOCKER_IMAGE_NAME}" --format "{{.Repository}}:{{.Tag}}" | \
        grep "backup-" | \
        head -n 1)

    if [[ -z "${backup_image}" ]]; then
        error "No backup image found for rollback!"
        exit 1
    fi

    info "Using backup: ${backup_image}"

    # Tag backup as latest
    docker tag "${backup_image}" "${DOCKER_IMAGE_NAME}:latest"

    # Restart containers
    cd "${DEPLOY_PATH}"
    docker-compose down
    docker-compose up -d

    success "Rollback completed using ${backup_image}"
}

# Deploy new version
deploy_new_version() {
    info "Deploying new version..."

    cd "${DEPLOY_PATH}"

    # Stop current containers
    info "Stopping current containers..."
    docker-compose down || true

    # Start new containers
    info "Starting new containers..."
    docker-compose up -d

    # Wait for containers to be ready
    info "Waiting for containers to be ready..."
    sleep 10

    success "Deployment completed"
}

# Health check
health_check() {
    if [[ "${SKIP_HEALTH}" == true ]]; then
        warning "Skipping health checks as requested"
        return 0
    fi

    info "Running health checks..."

    local max_attempts=5
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts..."

        # Check if container is running
        if ! docker ps -q -f name="${DOCKER_CONTAINER_NAME}" > /dev/null 2>&1; then
            error "Container is not running!"
            return 1
        fi

        # Check HTTP response
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")

        if [[ "${http_code}" == "200" ]]; then
            success "Health check passed! Application is responding"
            return 0
        fi

        warning "Got HTTP ${http_code}, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done

    error "Health checks failed after $max_attempts attempts"
    return 1
}

# Cleanup old Docker resources
cleanup() {
    info "Cleaning up old Docker resources..."

    # Remove old images (keep last 3)
    docker images "${DOCKER_IMAGE_NAME}" --format "{{.ID}} {{.CreatedAt}}" | \
        grep -v "backup-" | \
        sort -rk 2 | \
        awk 'NR>3 {print $1}' | \
        xargs -r docker rmi -f || true

    # Cleanup dangling images
    docker image prune -f

    # Cleanup stopped containers
    docker container prune -f

    success "Cleanup completed"
}

# Show deployment status
show_status() {
    echo ""
    echo "=================================================="
    echo "         Deployment Status"
    echo "=================================================="
    echo ""

    # Container status
    echo "Container Status:"
    docker ps -f name="${DOCKER_CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""

    # Recent logs
    echo "Recent Logs (last 10 lines):"
    docker logs --tail 10 "${DOCKER_CONTAINER_NAME}" 2>&1 || echo "No logs available"
    echo ""

    # Disk usage
    echo "Docker Disk Usage:"
    docker system df
    echo ""

    echo "=================================================="
}

# Main deployment flow
main() {
    echo ""
    echo "=================================================="
    echo "    Fuse App - Production Deployment"
    echo "=================================================="
    echo ""

    check_root
    setup_directories

    if [[ "${ROLLBACK}" == true ]]; then
        rollback_deployment
        health_check
        show_status
        success "Rollback completed successfully!"
        exit 0
    fi

    # Normal deployment flow
    backup_current
    deploy_new_version

    if ! health_check; then
        error "Deployment failed health checks!"
        warning "Consider running with --rollback flag to restore previous version"
        exit 1
    fi

    cleanup
    show_status

    success "Deployment completed successfully!"
    echo ""
    info "Access your application at: http://localhost"
    info "View logs with: docker logs -f ${DOCKER_CONTAINER_NAME}"
    info "Rollback with: $0 --rollback"
    echo ""
}

# Run main function
main "$@"
