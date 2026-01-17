# Deploy en Easypanel - Guía Completa

Guía paso a paso para desplegar tu aplicación Angular Fuse en Easypanel.

## 🎯 ¿Qué es Easypanel?

Easypanel es un panel de control moderno para gestionar aplicaciones Docker de forma visual, similar a Vercel o Netlify pero en tu propio servidor.

## 📋 Requisitos previos

- Servidor con Easypanel instalado
- IP del servidor: `157.245.226.11`
- Acceso SSH al servidor
- Docker instalado en el servidor
- Archivos del proyecto (ya creados):
  - `Dockerfile`
  - `docker-compose.yml`
  - `nginx.conf`
  - `.dockerignore`

## 🚀 Método 1: Deploy desde Interfaz Web de Easypanel

### Paso 1: Acceder a Easypanel

Abre tu navegador en:
```
http://157.245.226.11:3000
```
o
```
http://157.245.226.11:3001
```

Inicia sesión con tus credenciales.

### Paso 2: Crear nuevo proyecto

1. Click en **"+ New Project"** o **"Create Project"**
2. Nombre del proyecto: `fuse-app`
3. Click en **"Create"**

### Paso 3: Agregar servicio

1. Dentro del proyecto, click en **"+ Add Service"**
2. Selecciona **"Docker Compose"** o **"Custom Docker"**

### Paso 4: Configurar el servicio

**Opción A: Usando Docker Compose**

Pega el contenido de tu `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fuse-app:
    image: nginx:alpine
    container_name: fuse-app
    ports:
      - "8080:80"
    restart: unless-stopped
    volumes:
      - ./app:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
```

**Opción B: Usando configuración visual**

- **Image**: `nginx:alpine`
- **Port Mapping**: `8080:80`
- **Restart Policy**: `unless-stopped`
- **Volumes**: Agregar después de subir archivos

### Paso 5: Configurar puertos

En la sección **"Ports"**:
- **Container Port**: `80`
- **Host Port**: `8080` (o el que prefieras)
- **Protocol**: `TCP`

### Paso 6: Subir archivos de build

**Opción A: Via SSH**

```bash
# En tu máquina local, hacer build
npm run build:prod

# Subir al servidor
scp -r dist/fuse/* root@157.245.226.11:/var/easypanel/projects/fuse-app/app/
```

**Opción B: Via Git**

1. En Easypanel, configura **"Git Repository"**
2. URL del repo: `https://github.com/TU_USUARIO/TU_REPO.git`
3. Branch: `main`
4. Build command: `npm run build:prod`
5. Output directory: `dist/fuse`

### Paso 7: Deploy

1. Click en **"Deploy"** o **"Start"**
2. Espera a que el contenedor inicie (30-60 segundos)
3. Verifica el status: debería estar **"Running"** en verde

### Paso 8: Verificar acceso

Abre en tu navegador:
```
http://157.245.226.11:8080
```

## 🔧 Método 2: Deploy via SSH y Docker Compose

### Paso 1: Conectar al servidor

```bash
ssh root@157.245.226.11
```

### Paso 2: Crear directorio del proyecto

```bash
mkdir -p /var/easypanel/projects/fuse-app
cd /var/easypanel/projects/fuse-app
```

### Paso 3: Subir archivos necesarios

Desde tu máquina local:

```bash
# Subir archivos de configuración
scp Dockerfile root@157.245.226.11:/var/easypanel/projects/fuse-app/
scp nginx.conf root@157.245.226.11:/var/easypanel/projects/fuse-app/
scp docker-compose.yml root@157.245.226.11:/var/easypanel/projects/fuse-app/

# Hacer build local
npm run build:prod

# Subir build
scp -r dist/fuse root@157.245.226.11:/var/easypanel/projects/fuse-app/app
```

### Paso 4: En el servidor, iniciar contenedor

```bash
cd /var/easypanel/projects/fuse-app

# Iniciar con Docker Compose
docker-compose up -d

# Verificar que esté corriendo
docker-compose ps
docker-compose logs -f
```

### Paso 5: Abrir puerto en firewall

```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

## 🔄 Método 3: Build completo en el servidor

Si prefieres hacer el build directamente en el servidor:

### Paso 1: Subir código fuente

```bash
# Desde tu máquina local
scp -r . root@157.245.226.11:/var/easypanel/projects/fuse-app/
```

O usar Git:
```bash
# En el servidor
cd /var/easypanel/projects/fuse-app
git clone https://github.com/TU_USUARIO/TU_REPO.git .
```

### Paso 2: Build con Docker

```bash
# En el servidor
cd /var/easypanel/projects/fuse-app

# Build de la imagen
docker build -t fuse-app:latest .

# Ejecutar contenedor
docker run -d \
  --name fuse-app \
  -p 8080:80 \
  --restart unless-stopped \
  fuse-app:latest
```

## 🎛️ Configuraciones avanzadas

### Variables de entorno

En Easypanel → Settings → Environment Variables:

```env
NODE_ENV=production
API_URL=https://api.tudominio.com
FIREBASE_API_KEY=tu_api_key
```

### Dominios personalizados

1. En Easypanel → Domains
2. Agregar dominio: `app.tudominio.com`
3. Configurar DNS:
   ```
   Tipo: A
   Nombre: app
   Valor: 157.245.226.11
   ```

### SSL/HTTPS

Easypanel puede configurar SSL automáticamente:

1. Asegúrate de que el dominio apunte a tu servidor
2. En Easypanel → SSL
3. Click en **"Enable SSL"** o **"Auto SSL"**
4. Espera la emisión del certificado (Let's Encrypt)

### Backups automáticos

En Easypanel → Backups:
- Frecuencia: Diaria
- Retención: 7 días
- Destino: S3, Google Cloud, o local

## 📊 Monitoreo

### Ver logs en tiempo real

**En Easypanel:**
- Click en tu aplicación
- Ir a **"Logs"**
- Ver logs en tiempo real

**Via SSH:**
```bash
docker logs -f fuse-app
```

### Estadísticas de recursos

En Easypanel → Metrics verás:
- CPU usage
- Memory usage
- Network traffic
- Disk usage

### Health checks

El `Dockerfile` incluye un health check que verifica cada 30 segundos que la app responde.

## 🔄 Actualizar la aplicación

### Opción 1: Desde Easypanel

1. Ve a tu proyecto
2. Click en **"Rebuild"** o **"Redeploy"**
3. Easypanel pull los cambios y rebuildeará

### Opción 2: Manual

```bash
# En tu máquina local
npm run build:prod
scp -r dist/fuse/* root@157.245.226.11:/var/easypanel/projects/fuse-app/app/

# En el servidor
ssh root@157.245.226.11
cd /var/easypanel/projects/fuse-app
docker-compose restart
```

### Opción 3: Script automatizado

Crea `deploy-easypanel.sh`:

```bash
#!/bin/bash

echo "🔨 Building..."
npm run build:prod

echo "📤 Uploading to server..."
scp -r dist/fuse/* root@157.245.226.11:/var/easypanel/projects/fuse-app/app/

echo "🔄 Restarting container..."
ssh root@157.245.226.11 "cd /var/easypanel/projects/fuse-app && docker-compose restart"

echo "✅ Deploy complete!"
echo "🌐 URL: http://157.245.226.11:8080"
```

Hacer ejecutable y usar:
```bash
chmod +x deploy-easypanel.sh
./deploy-easypanel.sh
```

## 🐛 Troubleshooting

### Contenedor no inicia

**Ver logs:**
```bash
docker logs fuse-app
```

**Errores comunes:**
- Puerto ocupado → Cambiar puerto en `docker-compose.yml`
- Permisos → `chown -R www-data:www-data /var/easypanel/projects/fuse-app/app`
- Falta archivo → Verificar que `dist/fuse/index.html` existe

### "Connection refused"

**Verificar:**
```bash
# ¿Contenedor corriendo?
docker ps

# ¿Puerto abierto en firewall?
sudo ufw status

# ¿Nginx escuchando?
docker exec fuse-app netstat -tlnp | grep :80
```

**Solución:**
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
docker restart fuse-app
```

### Cambios no se reflejan

**Limpiar cache y rebuildar:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 404 en rutas de Angular

**Problema:** Nginx no está configurado para SPA.

**Verificar `nginx.conf`:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📋 Checklist post-deploy

- [ ] Contenedor está corriendo: `docker ps`
- [ ] Puerto accesible: `curl http://localhost:8080`
- [ ] Firewall configurado: `sudo ufw status`
- [ ] App accesible externamente: `http://157.245.226.11:8080`
- [ ] Routing de Angular funciona
- [ ] Assets cargan correctamente
- [ ] No hay errores en navegador (F12 → Console)
- [ ] Firebase funciona (si aplica)
- [ ] SSL configurado (si aplica)
- [ ] Backups configurados

## 💡 Tips y mejores prácticas

### 1. Usa .dockerignore

Ya incluido, asegura builds más rápidos.

### 2. Multi-stage builds

El `Dockerfile` usa multi-stage para reducir tamaño:
- Build stage: ~1GB (con Node)
- Final image: ~50MB (solo Nginx + archivos)

### 3. Health checks

Permiten a Easypanel detectar si la app está saludable.

### 4. Restart policy

`unless-stopped` asegura que el contenedor inicie automáticamente después de reinicios del servidor.

### 5. Separar configuración

Usa `.env` para configuraciones sensibles:
```env
API_URL=https://api.tudominio.com
FIREBASE_API_KEY=xxx
```

No commitear a Git.

## 🔗 Recursos útiles

- [Easypanel Docs](https://easypanel.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## 🎯 Resumen ejecutivo

```bash
# 1. Build local
npm run build:prod

# 2. Subir archivos
scp -r dist/fuse/* root@157.245.226.11:/var/easypanel/projects/fuse-app/app/
scp Dockerfile nginx.conf docker-compose.yml root@157.245.226.11:/var/easypanel/projects/fuse-app/

# 3. En servidor
ssh root@157.245.226.11
cd /var/easypanel/projects/fuse-app
docker-compose up -d

# 4. Abrir puerto
sudo ufw allow 8080/tcp

# 5. Acceder
# http://157.245.226.11:8080
```

¡Tu aplicación Angular Fuse ahora está desplegada en Easypanel! 🚀
