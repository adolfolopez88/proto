#!/bin/bash

###############################################################################
# Health Check Script for Fuse Angular App
# Usage: ./health-check.sh [OPTIONS]
#
# Options:
#   --url URL           URL to check (default: http://localhost)
#   --timeout SECONDS   Timeout for each check (default: 5)
#   --retries NUM       Number of retries (default: 5)
#   --interval SECONDS  Interval between retries (default: 10)
#   --verbose           Show detailed output
###############################################################################

set -euo pipefail

# Default configuration
URL="${URL:-http://localhost}"
TIMEOUT=5
RETRIES=5
INTERVAL=10
VERBOSE=false
DOCKER_CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-fuse-app}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            URL="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging functions
info() {
    echo -e "${BLUE}ℹ ${NC}$@"
}

success() {
    echo -e "${GREEN}✅ ${NC}$@"
}

warning() {
    echo -e "${YELLOW}⚠️  ${NC}$@"
}

error() {
    echo -e "${RED}❌ ${NC}$@"
}

verbose() {
    if [[ "${VERBOSE}" == true ]]; then
        echo -e "${BLUE}  → ${NC}$@"
    fi
}

# Check if required tools are installed
check_dependencies() {
    local missing_deps=()

    command -v curl >/dev/null 2>&1 || missing_deps+=("curl")
    command -v docker >/dev/null 2>&1 || missing_deps+=("docker")

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi
}

# Check Docker container status
check_container() {
    verbose "Checking Docker container status..."

    if ! docker ps -q -f name="${DOCKER_CONTAINER_NAME}" > /dev/null 2>&1; then
        error "Container '${DOCKER_CONTAINER_NAME}' is not running"
        return 1
    fi

    local container_status=$(docker inspect -f '{{.State.Status}}' "${DOCKER_CONTAINER_NAME}")
    local container_health=$(docker inspect -f '{{.State.Health.Status}}' "${DOCKER_CONTAINER_NAME}" 2>/dev/null || echo "no-healthcheck")

    verbose "Container status: ${container_status}"
    verbose "Container health: ${container_health}"

    if [[ "${container_status}" != "running" ]]; then
        error "Container is ${container_status}, expected 'running'"
        return 1
    fi

    if [[ "${container_health}" == "unhealthy" ]]; then
        error "Container health check reports: unhealthy"
        return 1
    fi

    success "Container is running properly"
    return 0
}

# Check HTTP endpoint
check_http() {
    local url="$1"
    local timeout="$2"

    verbose "Checking HTTP endpoint: ${url}"

    local response
    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" \
        --max-time "${timeout}" \
        "${url}" 2>&1 || echo "000|0|0")

    local http_code=$(echo "${response}" | cut -d'|' -f1)
    local time_total=$(echo "${response}" | cut -d'|' -f2)
    local size=$(echo "${response}" | cut -d'|' -f3)

    verbose "HTTP Code: ${http_code}"
    verbose "Response Time: ${time_total}s"
    verbose "Response Size: ${size} bytes"

    if [[ "${http_code}" == "200" ]]; then
        success "HTTP check passed (${http_code}) - Response time: ${time_total}s"
        return 0
    else
        error "HTTP check failed with code: ${http_code}"
        return 1
    fi
}

# Check application performance
check_performance() {
    verbose "Checking application performance..."

    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "${URL}" || echo "999")

    verbose "Total response time: ${response_time}s"

    # Warning if response time > 3 seconds
    if (( $(echo "${response_time} > 3.0" | bc -l) )); then
        warning "Response time is high: ${response_time}s (expected < 3s)"
        return 1
    fi

    success "Performance check passed - Response time: ${response_time}s"
    return 0
}

# Check Docker container resources
check_resources() {
    verbose "Checking container resource usage..."

    local stats=$(docker stats --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}" "${DOCKER_CONTAINER_NAME}" 2>/dev/null || echo "N/A|N/A")

    local cpu=$(echo "${stats}" | cut -d'|' -f1)
    local memory=$(echo "${stats}" | cut -d'|' -f2)

    verbose "CPU Usage: ${cpu}"
    verbose "Memory Usage: ${memory}"

    success "Resource usage checked"
    return 0
}

# Check container logs for errors
check_logs() {
    verbose "Checking recent container logs for errors..."

    local error_count=$(docker logs --tail 100 "${DOCKER_CONTAINER_NAME}" 2>&1 | \
        grep -i -E "(error|exception|fatal|critical)" | \
        wc -l)

    if [[ "${error_count}" -gt 0 ]]; then
        warning "Found ${error_count} error-like messages in recent logs"

        if [[ "${VERBOSE}" == true ]]; then
            echo ""
            echo "Recent errors:"
            docker logs --tail 100 "${DOCKER_CONTAINER_NAME}" 2>&1 | \
                grep -i -E "(error|exception|fatal|critical)" | \
                tail -n 5
            echo ""
        fi

        return 1
    fi

    success "No errors found in recent logs"
    return 0
}

# Comprehensive health check
run_health_checks() {
    local checks_passed=0
    local checks_failed=0

    info "Running comprehensive health checks..."
    echo ""

    # Container check
    if check_container; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    echo ""

    # HTTP check with retries
    local http_success=false
    for attempt in $(seq 1 "${RETRIES}"); do
        info "HTTP check attempt ${attempt}/${RETRIES}..."

        if check_http "${URL}" "${TIMEOUT}"; then
            http_success=true
            ((checks_passed++))
            break
        fi

        if [[ $attempt -lt ${RETRIES} ]]; then
            verbose "Retrying in ${INTERVAL} seconds..."
            sleep "${INTERVAL}"
        fi
    done

    if [[ "${http_success}" == false ]]; then
        ((checks_failed++))
    fi
    echo ""

    # Performance check
    if check_performance; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    echo ""

    # Resource check
    if check_resources; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    echo ""

    # Log check
    if check_logs; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    echo ""

    # Summary
    echo "=================================================="
    echo "         Health Check Summary"
    echo "=================================================="
    echo ""
    echo "Checks passed: ${checks_passed}"
    echo "Checks failed: ${checks_failed}"
    echo "Total checks:  $((checks_passed + checks_failed))"
    echo ""

    if [[ ${checks_failed} -eq 0 ]]; then
        success "All health checks passed! ✨"
        echo ""
        return 0
    else
        error "Some health checks failed!"
        echo ""
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "=================================================="
    echo "    Fuse App - Health Check"
    echo "=================================================="
    echo ""
    echo "Target URL: ${URL}"
    echo "Container:  ${DOCKER_CONTAINER_NAME}"
    echo "Timeout:    ${TIMEOUT}s"
    echo "Retries:    ${RETRIES}"
    echo "Interval:   ${INTERVAL}s"
    echo ""

    check_dependencies

    if run_health_checks; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
