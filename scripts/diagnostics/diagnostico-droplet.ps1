# Script de Diagnostico para Digital Ocean Droplet
# Verifica conectividad y estado del servidor

$DROPLET_IP = "157.245.226.11"
$SSH_PORT = 22
$HTTP_PORT = 80

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnostico de Droplet              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# TEST 1: PING
# ============================================
Write-Host "[TEST 1] Verificando conectividad (ping)..." -ForegroundColor Yellow

$pingResult = Test-Connection -ComputerName $DROPLET_IP -Count 4 -Quiet

if ($pingResult) {
    Write-Host "[OK] El droplet responde a ping" -ForegroundColor Green
} else {
    Write-Host "[ERROR] El droplet NO responde a ping" -ForegroundColor Red
    Write-Host "Posibles causas:" -ForegroundColor Red
    Write-Host "  - Droplet apagado" -ForegroundColor Red
    Write-Host "  - IP incorrecta" -ForegroundColor Red
    Write-Host "  - Firewall bloqueando ICMP" -ForegroundColor Red
}
Write-Host ""

# ============================================
# TEST 2: PUERTO SSH (22)
# ============================================
Write-Host "[TEST 2] Verificando puerto SSH (22)..." -ForegroundColor Yellow

$sshTest = Test-NetConnection -ComputerName $DROPLET_IP -Port $SSH_PORT -WarningAction SilentlyContinue

if ($sshTest.TcpTestSucceeded) {
    Write-Host "[OK] Puerto SSH (22) esta abierto" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Puerto SSH (22) esta CERRADO" -ForegroundColor Red
    Write-Host "Posibles causas:" -ForegroundColor Red
    Write-Host "  - SSH no esta instalado/corriendo" -ForegroundColor Red
    Write-Host "  - Firewall bloqueando puerto 22" -ForegroundColor Red
}
Write-Host ""

# ============================================
# TEST 3: PUERTO HTTP (80)
# ============================================
Write-Host "[TEST 3] Verificando puerto HTTP (80)..." -ForegroundColor Yellow

$httpTest = Test-NetConnection -ComputerName $DROPLET_IP -Port $HTTP_PORT -WarningAction SilentlyContinue

if ($httpTest.TcpTestSucceeded) {
    Write-Host "[OK] Puerto HTTP (80) esta abierto" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Puerto HTTP (80) esta CERRADO" -ForegroundColor Red
    Write-Host "Posibles causas:" -ForegroundColor Red
    Write-Host "  - Nginx no esta instalado/corriendo" -ForegroundColor Red
    Write-Host "  - Firewall bloqueando puerto 80" -ForegroundColor Red
    Write-Host "  - Nginx escuchando en puerto incorrecto" -ForegroundColor Red
}
Write-Host ""

# ============================================
# TEST 4: ACCESO SSH
# ============================================
Write-Host "[TEST 4] Intentando conexion SSH..." -ForegroundColor Yellow
Write-Host "Nota: Te pedira el password del droplet" -ForegroundColor Gray

$sshConnection = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$DROPLET_IP "echo 'SSH OK'" 2>&1

if ($sshConnection -match "SSH OK") {
    Write-Host "[OK] Conexion SSH exitosa" -ForegroundColor Green

    # Si SSH funciona, obtener informacion del servidor
    Write-Host ""
    Write-Host "[INFO] Obteniendo informacion del servidor..." -ForegroundColor Cyan

    ssh root@$DROPLET_IP @"
        echo ""
        echo "=== SISTEMA ==="
        uname -a
        echo ""
        echo "=== NGINX STATUS ==="
        systemctl is-active nginx || echo "Nginx NO esta corriendo"
        echo ""
        echo "=== NGINX ESCUCHANDO EN ==="
        netstat -tlnp | grep nginx || echo "Nginx no encontrado"
        echo ""
        echo "=== ARCHIVOS EN /var/www/fuse-app ==="
        ls -lh /var/www/fuse-app 2>/dev/null || echo "Directorio no existe"
        echo ""
        echo "=== FIREWALL (UFW) ==="
        ufw status || echo "UFW no configurado"
"@

} else {
    Write-Host "[ERROR] No se pudo conectar via SSH" -ForegroundColor Red
    Write-Host "Error: $sshConnection" -ForegroundColor Red
}
Write-Host ""

# ============================================
# TEST 5: ACCESO WEB
# ============================================
Write-Host "[TEST 5] Verificando respuesta HTTP..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://$DROPLET_IP" -TimeoutSec 10 -UseBasicParsing
    Write-Host "[OK] El servidor web responde" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "Content Length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] El servidor web NO responde" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# RESUMEN Y RECOMENDACIONES
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMEN Y RECOMENDACIONES           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $pingResult) {
    Write-Host "[ACCION] El droplet no responde. Verifica en Digital Ocean console:" -ForegroundColor Yellow
    Write-Host "  1. Ve a https://cloud.digitalocean.com/droplets" -ForegroundColor White
    Write-Host "  2. Verifica que el droplet este 'ON'" -ForegroundColor White
    Write-Host "  3. Verifica la IP correcta" -ForegroundColor White
    Write-Host ""
}

if (-not $httpTest.TcpTestSucceeded) {
    Write-Host "[ACCION] Puerto 80 cerrado. Necesitas:" -ForegroundColor Yellow
    Write-Host "  1. Conectarte via SSH: ssh root@$DROPLET_IP" -ForegroundColor White
    Write-Host "  2. Instalar Nginx: apt install nginx -y" -ForegroundColor White
    Write-Host "  3. Iniciar Nginx: systemctl start nginx" -ForegroundColor White
    Write-Host "  4. Abrir firewall: ufw allow 80/tcp" -ForegroundColor White
    Write-Host ""
}

if (-not $sshTest.TcpTestSucceeded) {
    Write-Host "[ACCION] Puerto SSH cerrado. Verifica:" -ForegroundColor Yellow
    Write-Host "  1. Usa Digital Ocean Console (Access > Launch Droplet Console)" -ForegroundColor White
    Write-Host "  2. Verifica firewall en Digital Ocean dashboard" -ForegroundColor White
    Write-Host ""
}

Write-Host "[INFO] Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Si los puertos estan cerrados, conectate via Digital Ocean Console" -ForegroundColor White
Write-Host "  2. Ejecuta el setup de Nginx (ver QUICK_DEPLOY_PASSWORD.md)" -ForegroundColor White
Write-Host "  3. Ejecuta nuevamente: npm run deploy:do" -ForegroundColor White
Write-Host ""
