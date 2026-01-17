# Solución: No se puede acceder al sitio web

## 🔴 Problema: El browser dice "No se puede acceder al sitio web"

Esto significa que el puerto 80 (HTTP) está cerrado o Nginx no está configurado.

## 🔍 Diagnóstico Rápido

### Test 1: ¿El droplet está encendido?

Ve a: https://cloud.digitalocean.com/droplets

Verifica que tu droplet muestre **"ON"** en verde.

### Test 2: ¿Puedes conectarte por SSH?

Abre PowerShell y ejecuta:
```powershell
ssh root@157.245.226.11
```

**Si funciona:**
- ✅ Droplet está encendido
- ✅ Tienes acceso
- ⚠️ Falta configurar Nginx

**Si NO funciona:**
- ❌ Problema de conectividad
- Ver solución abajo

## ✅ Solución Paso a Paso

### Opción A: Conectar via SSH y configurar

**1. Conectarse al droplet:**
```bash
ssh root@157.245.226.11
```

**2. Instalar y configurar Nginx (copia TODO esto):**

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Nginx
apt install nginx -y

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar que esté corriendo
systemctl status nginx

# Abrir firewall para HTTP
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable

# Crear directorio para la app
mkdir -p /var/www/fuse-app

# Crear página de prueba
echo "<h1>Funciona!</h1>" > /var/www/fuse-app/index.html

# Configurar Nginx
cat > /etc/nginx/sites-available/fuse-app << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;
    root /var/www/fuse-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Habilitar el sitio
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fuse-app /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Si todo está OK, recargar
systemctl reload nginx

# Verificar que esté escuchando en puerto 80
netstat -tlnp | grep :80

echo ""
echo "==================================="
echo "CONFIGURACION COMPLETADA"
echo "==================================="
echo "Abre tu browser en: http://157.245.226.11"
echo ""
```

**3. Salir del droplet:**
```bash
exit
```

**4. Verificar en el browser:**
```
http://157.245.226.11
```

Deberías ver "Funciona!"

**5. Hacer deploy de la app real:**
```bash
npm run deploy:do
```

### Opción B: Si no puedes conectar via SSH

**Usar Digital Ocean Console (Web terminal):**

1. Ve a: https://cloud.digitalocean.com/droplets
2. Click en tu droplet
3. Click en "Access" en el menú izquierdo
4. Click en "Launch Droplet Console"
5. Ejecuta los comandos de la Opción A

## 🐛 Troubleshooting Específico

### "Connection refused" o "Connection timeout"

**Causa:** Firewall bloqueando puerto 80

**Solución:**
```bash
# En el droplet
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
ufw status
```

### "Nginx is not running"

**Solución:**
```bash
# Iniciar Nginx
systemctl start nginx

# Verificar errores
journalctl -u nginx -n 50

# Ver logs
tail -f /var/log/nginx/error.log
```

### Puerto 80 ocupado por otro proceso

**Verificar qué está usando el puerto:**
```bash
netstat -tlnp | grep :80
lsof -i :80
```

**Si Apache está instalado:**
```bash
systemctl stop apache2
systemctl disable apache2
```

### Nginx instalado pero no responde

**Verificar configuración:**
```bash
nginx -t
cat /etc/nginx/sites-enabled/fuse-app
```

**Reiniciar completamente:**
```bash
systemctl restart nginx
systemctl status nginx
```

## 📋 Checklist de Verificación

Ejecuta estos comandos EN EL DROPLET para verificar:

```bash
# 1. ¿Nginx está instalado?
which nginx

# 2. ¿Nginx está corriendo?
systemctl status nginx

# 3. ¿Está escuchando en puerto 80?
netstat -tlnp | grep :80

# 4. ¿Firewall permite tráfico?
ufw status

# 5. ¿El directorio existe?
ls -la /var/www/fuse-app

# 6. ¿La configuración es correcta?
nginx -t

# 7. ¿Hay errores en los logs?
tail -20 /var/log/nginx/error.log
```

## 🎯 Test Rápido desde Windows

**Test de conectividad (PowerShell):**
```powershell
# Ping
Test-Connection -ComputerName 157.245.226.11 -Count 4

# Puerto 80
Test-NetConnection -ComputerName 157.245.226.11 -Port 80

# Puerto 22 (SSH)
Test-NetConnection -ComputerName 157.245.226.11 -Port 22

# Web request
Invoke-WebRequest -Uri http://157.245.226.11 -UseBasicParsing
```

## 🔄 Flujo Completo de Setup

```bash
# 1. Conectar
ssh root@157.245.226.11

# 2. Setup completo (copia todo)
apt update && apt upgrade -y && \
apt install nginx ufw -y && \
systemctl start nginx && \
systemctl enable nginx && \
ufw allow 22/tcp && \
ufw allow 80/tcp && \
ufw --force enable && \
mkdir -p /var/www/fuse-app && \
echo "<h1>Ready!</h1>" > /var/www/fuse-app/index.html && \
cat > /etc/nginx/sites-available/fuse-app << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    root /var/www/fuse-app;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
EOF
rm -f /etc/nginx/sites-enabled/default && \
ln -sf /etc/nginx/sites-available/fuse-app /etc/nginx/sites-enabled/ && \
nginx -t && systemctl reload nginx && \
echo "" && \
echo "Setup complete! Test: http://157.245.226.11"

# 3. Salir
exit

# 4. Deploy (en Windows)
npm run deploy:do
```

## 💡 Causa Más Común

**El puerto 80 no está abierto en el firewall del droplet.**

**Solución más rápida:**
```bash
ssh root@157.245.226.11
ufw allow 80/tcp
ufw reload
```

## 📞 Si nada funciona

1. **Verifica en Digital Ocean Dashboard:**
   - Droplet está ON
   - IP es la correcta: 157.245.226.11
   - No hay firewalls en el nivel de Digital Ocean bloqueando

2. **Recrea el droplet:**
   - A veces es más rápido crear uno nuevo
   - Asegúrate de abrir puertos 22 y 80 durante la creación

3. **Usa la opción de Firebase Hosting:**
   - Si el droplet sigue dando problemas
   - Firebase es más simple de configurar
   - `firebase login && npm run deploy:firebase`

---

**¿Listo para intentar?**

```bash
ssh root@157.245.226.11
# Luego ejecuta el setup completo de arriba
```
