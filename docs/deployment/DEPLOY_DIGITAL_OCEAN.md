# Deploy a Digital Ocean Droplet

Guía para desplegar la aplicación Angular Fuse en un Droplet de Digital Ocean.

## 📋 Información del Droplet Necesaria

Antes de comenzar, necesitas:

- **IP del Droplet**: `___.___.___.___`
- **Usuario SSH**: `root` o tu usuario personalizado
- **Puerto SSH**: `22` (por defecto)
- **Dominio** (opcional): `tudominio.com`

## 🏗️ Arquitectura del Deploy

### Opción 1: Nginx + Build Estático (Recomendado)
- Build de producción localmente
- Subir archivos estáticos al droplet
- Servir con Nginx
- ✅ Mejor performance
- ✅ Más simple

### Opción 2: Node.js + PM2
- Subir código fuente
- Build en el servidor
- Servir con un servidor Node
- ⚠️ Requiere más recursos

## 🚀 Setup Rápido (Opción 1 - Nginx)

### Paso 1: Preparar el Droplet

Conéctate a tu droplet:

```bash
ssh root@TU_IP_DROPLET
```

Instala Nginx:

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Nginx
apt install nginx -y

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar
systemctl status nginx
```

### Paso 2: Configurar Nginx

Crea el archivo de configuración:

```bash
nano /etc/nginx/sites-available/fuse-app
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name TU_IP_DROPLET;  # O tu dominio.com

    root /var/www/fuse-app;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Habilitar el sitio:

```bash
# Crear enlace simbólico
ln -s /etc/nginx/sites-available/fuse-app /etc/nginx/sites-enabled/

# Eliminar sitio por defecto (opcional)
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
```

### Paso 3: Crear Directorio de Deploy

```bash
# Crear directorio
mkdir -p /var/www/fuse-app

# Permisos
chown -R www-data:www-data /var/www/fuse-app
chmod -R 755 /var/www/fuse-app
```

### Paso 4: Build Local y Deploy

En tu máquina local (Windows), ejecuta:

```bash
# Build de producción
npm run build:prod
```

Esto genera los archivos en `dist/fuse/`

### Paso 5: Subir Archivos al Droplet

**Opción A: Usando SCP (Windows PowerShell)**

```powershell
# Desde la carpeta del proyecto
scp -r dist/fuse/* root@TU_IP_DROPLET:/var/www/fuse-app/
```

**Opción B: Usando Git**

En el droplet:
```bash
cd /var/www
git clone TU_REPOSITORIO_GIT fuse-app-source
cd fuse-app-source
# Copiar build
cp -r dist/fuse/* /var/www/fuse-app/
```

**Opción C: Usando rsync (recomendado)**

```bash
rsync -avz --delete dist/fuse/ root@TU_IP_DROPLET:/var/www/fuse-app/
```

### Paso 6: Verificar Deploy

Abre en tu navegador:
```
http://TU_IP_DROPLET
```

## 🔒 Configurar SSL con Let's Encrypt (HTTPS)

### Requisitos:
- Dominio apuntando a tu IP del droplet
- Puerto 80 y 443 abiertos

### Instalación:

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado (reemplaza con tu dominio)
certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática (ya está configurada)
certbot renew --dry-run
```

Certbot modificará automáticamente la configuración de Nginx para usar HTTPS.

## 🔄 Script de Deploy Automatizado

Crea un script en tu proyecto local:

### Windows: `deploy-do.ps1`

```powershell
# Script de Deploy a Digital Ocean
$DROPLET_IP = "TU_IP_DROPLET"
$DROPLET_USER = "root"
$DEPLOY_PATH = "/var/www/fuse-app"

Write-Host "🔨 Building production..."
npm run build:prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "📤 Deploying to Digital Ocean..."

    # Backup anterior (en el droplet)
    ssh ${DROPLET_USER}@${DROPLET_IP} "mkdir -p ${DEPLOY_PATH}_backup && cp -r ${DEPLOY_PATH}/* ${DEPLOY_PATH}_backup/ 2>/dev/null || true"

    # Subir nuevos archivos
    scp -r dist/fuse/* ${DROPLET_USER}@${DROPLET_IP}:${DEPLOY_PATH}/

    # Verificar permisos
    ssh ${DROPLET_USER}@${DROPLET_IP} "chown -R www-data:www-data ${DEPLOY_PATH} && chmod -R 755 ${DEPLOY_PATH}"

    Write-Host "✅ Deploy completado!"
    Write-Host "🌐 URL: http://${DROPLET_IP}"
} else {
    Write-Host "❌ Build failed"
}
```

### Linux/Mac: `deploy-do.sh`

```bash
#!/bin/bash
# Script de Deploy a Digital Ocean

DROPLET_IP="TU_IP_DROPLET"
DROPLET_USER="root"
DEPLOY_PATH="/var/www/fuse-app"

echo "🔨 Building production..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo "📤 Deploying to Digital Ocean..."

    # Backup anterior
    ssh ${DROPLET_USER}@${DROPLET_IP} "mkdir -p ${DEPLOY_PATH}_backup && cp -r ${DEPLOY_PATH}/* ${DEPLOY_PATH}_backup/ 2>/dev/null || true"

    # Subir nuevos archivos
    rsync -avz --delete dist/fuse/ ${DROPLET_USER}@${DROPLET_IP}:${DEPLOY_PATH}/

    # Verificar permisos
    ssh ${DROPLET_USER}@${DROPLET_IP} "chown -R www-data:www-data ${DEPLOY_PATH} && chmod -R 755 ${DEPLOY_PATH}"

    echo "✅ Deploy completado!"
    echo "🌐 URL: http://${DROPLET_IP}"
else
    echo "❌ Build failed"
fi
```

Hacer el script ejecutable:
```bash
chmod +x deploy-do.sh
```

Uso:
```bash
./deploy-do.sh
```

## 🔧 Configuración SSH Sin Contraseña (Opcional)

Para evitar escribir contraseña cada vez:

```bash
# En tu máquina local
ssh-keygen -t rsa -b 4096

# Copiar clave pública al droplet
ssh-copy-id root@TU_IP_DROPLET
```

## 📊 Monitoreo y Logs

### Ver logs de Nginx:

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log

# Logs específicos del sitio
tail -f /var/log/nginx/fuse-app.access.log
tail -f /var/log/nginx/fuse-app.error.log
```

### Estadísticas del servidor:

```bash
# Uso de recursos
htop

# Espacio en disco
df -h

# Memoria
free -h

# Procesos de Nginx
ps aux | grep nginx
```

## 🛡️ Firewall (UFW)

Configurar firewall básico:

```bash
# Habilitar UFW
ufw enable

# Permitir SSH (IMPORTANTE!)
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Ver estado
ufw status
```

## 🔄 Actualizar la Aplicación

Para actualizar después del deploy inicial:

```bash
# Opción 1: Script automatizado
./deploy-do.sh

# Opción 2: Manual
npm run build:prod
scp -r dist/fuse/* root@TU_IP_DROPLET:/var/www/fuse-app/
```

## 🐛 Troubleshooting

### Problema: "Connection refused"

**Solución:**
```bash
# Verificar que Nginx esté corriendo
systemctl status nginx

# Reiniciar Nginx
systemctl restart nginx
```

### Problema: "403 Forbidden"

**Solución:**
```bash
# Verificar permisos
ls -la /var/www/fuse-app

# Corregir permisos
chown -R www-data:www-data /var/www/fuse-app
chmod -R 755 /var/www/fuse-app
```

### Problema: "502 Bad Gateway"

**Solución:**
```bash
# Ver logs de error
tail -f /var/log/nginx/error.log

# Verificar configuración
nginx -t

# Recargar
systemctl reload nginx
```

### Problema: Rutas de Angular no funcionan (404)

**Verificar** que la configuración de Nginx tenga:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📝 Checklist Post-Deploy

- [ ] Aplicación accesible en http://TU_IP_DROPLET
- [ ] Routing de Angular funciona correctamente
- [ ] Assets (imágenes, CSS, JS) cargan correctamente
- [ ] Firebase funciona (Auth, Firestore)
- [ ] No hay errores en la consola del navegador
- [ ] SSL configurado (si aplica)
- [ ] Firewall configurado
- [ ] Backups configurados

## 🎯 Optimizaciones Adicionales

### Caché de Nginx

Ya incluido en la configuración, pero puedes ajustar:

```nginx
# Caché más agresivo
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Compresión Gzip

Ya incluido, pero puedes aumentar nivel:

```nginx
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 💡 Tips

1. **Usa rsync** en lugar de scp para deploys más rápidos
2. **Configura SSL** desde el inicio con Let's Encrypt (gratis)
3. **Haz backups** antes de cada deploy
4. **Monitorea recursos** con htop o similar
5. **Configura un dominio** para mejor experiencia de usuario

## 📚 Recursos

- [Digital Ocean Nginx Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Estado:** ✅ Configuración lista
**Siguiente paso:** Configurar tu droplet con los pasos anteriores
