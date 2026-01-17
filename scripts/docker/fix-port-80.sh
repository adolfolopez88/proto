#!/bin/bash
# Script para diagnosticar y solucionar conflicto en puerto 80

echo "🔍 Diagnóstico del puerto 80..."
echo ""

# Verificar qué está usando el puerto 80
echo "1️⃣ Verificando qué proceso usa el puerto 80:"
sudo netstat -tlnp | grep :80 || sudo lsof -i :80

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar servicios web comunes
echo "2️⃣ Verificando servicios web activos:"

if systemctl is-active --quiet apache2; then
    echo "⚠️  Apache2 está corriendo"
    APACHE_RUNNING=true
else
    echo "✅ Apache2 no está corriendo"
    APACHE_RUNNING=false
fi

if systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx está corriendo"
    NGINX_RUNNING=true
else
    echo "✅ Nginx no está corriendo"
    NGINX_RUNNING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ofrecer soluciones
echo "📋 SOLUCIONES DISPONIBLES:"
echo ""
echo "Opción 1: Detener Apache2 (si está instalado y no lo necesitas)"
echo "   sudo systemctl stop apache2"
echo "   sudo systemctl disable apache2"
echo ""
echo "Opción 2: Cambiar Nginx a otro puerto (8080)"
echo "   sudo sed -i 's/listen 80/listen 8080/g' /etc/nginx/sites-available/fuse-app"
echo "   sudo sed -i 's/listen \[::\]:80/listen [::]:8080/g' /etc/nginx/sites-available/fuse-app"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "   sudo ufw allow 8080/tcp"
echo ""
echo "Opción 3: Matar el proceso específico en el puerto 80"
echo "   sudo fuser -k 80/tcp"
echo ""

# Preguntar qué hacer
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Quieres ejecutar una solución automática? (1/2/3/n): " choice

case $choice in
    1)
        echo ""
        echo "🛑 Deteniendo Apache2..."
        sudo systemctl stop apache2
        sudo systemctl disable apache2
        echo "✅ Apache2 detenido"
        echo ""
        echo "🔄 Reiniciando Nginx..."
        sudo systemctl restart nginx
        echo "✅ Nginx reiniciado en puerto 80"
        echo "🌐 Accede en: http://$(hostname -I | awk '{print $1}')"
        ;;
    2)
        echo ""
        echo "🔧 Cambiando Nginx al puerto 8080..."
        sudo sed -i 's/listen 80/listen 8080/g' /etc/nginx/sites-available/fuse-app
        sudo sed -i 's/listen \[::\]:80/listen [::]:8080/g' /etc/nginx/sites-available/fuse-app
        sudo nginx -t && sudo systemctl reload nginx
        sudo ufw allow 8080/tcp
        echo "✅ Nginx configurado en puerto 8080"
        echo "🌐 Accede en: http://$(hostname -I | awk '{print $1}'):8080"
        ;;
    3)
        echo ""
        echo "💥 Matando proceso en puerto 80..."
        sudo fuser -k 80/tcp
        sleep 2
        echo "✅ Proceso eliminado"
        echo ""
        echo "🔄 Iniciando Nginx..."
        sudo systemctl start nginx
        echo "✅ Nginx iniciado en puerto 80"
        echo "🌐 Accede en: http://$(hostname -I | awk '{print $1}')"
        ;;
    *)
        echo ""
        echo "ℹ️  No se realizó ningún cambio"
        echo "Ejecuta manualmente los comandos que necesites"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Diagnóstico completado"
