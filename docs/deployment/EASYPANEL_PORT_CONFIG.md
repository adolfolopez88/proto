# Configurar Puerto en Easypanel

Guía completa para cambiar el puerto de tu contenedor en Easypanel.

## 🎯 Objetivo

Cambiar el puerto en el que tu aplicación Angular es accesible desde el contenedor Docker gestionado por Easypanel.

## 📋 Información necesaria

- **URL de Easypanel**: Normalmente `http://TU_IP:3000` o `http://TU_IP:3001`
- **IP del servidor**: `157.245.226.11`
- **Nombre del proyecto/app**: (ej: `fuse-app`)
- **Puerto actual**: `80` (probablemente ocupado)
- **Puerto deseado**: `8080` o el que prefieras

## 🌐 Opción 1: Desde la Interfaz Web de Easypanel (MÁS FÁCIL)

### Paso 1: Acceder a Easypanel

Abre tu navegador en una de estas URLs:
```
http://157.245.226.11:3000
http://157.245.226.11:3001
https://panel.TU_DOMINIO.com
```

Inicia sesión con tus credenciales.

### Paso 2: Seleccionar tu aplicación

1. En el menú lateral izquierdo, busca **"Projects"** o **"Applications"**
2. Click en tu proyecto (ej: `fuse-app` o como lo hayas nombrado)

### Paso 3: Modificar configuración de puertos

**Opción A: Si usas el editor visual:**

1. Click en **"Settings"** o **"Configuration"**
2. Busca la sección **"Ports"** o **"Port Mapping"**
3. Verás algo como:
   ```
   Host Port: 80
   Container Port: 80
   Protocol: TCP
   ```
4. Cambia **Host Port** de `80` a `8080` (o el puerto que desees)
5. Deja **Container Port** en `80` (es el puerto interno de Nginx)

**Opción B: Si usas el editor de Docker Compose:**

1. Click en **"Advanced"** o **"Docker Compose"**
2. Busca la sección `ports:`
3. Cambia de:
   ```yaml
   ports:
     - "80:80"
   ```
   A:
   ```yaml
   ports:
     - "8080:80"  # o el puerto que prefieras
   ```

### Paso 4: Guardar y aplicar cambios

1. Click en **"Save"** o **"Update"**
2. Click en **"Deploy"** o **"Restart"** para reiniciar el contenedor
3. Espera unos segundos a que el contenedor se reinicie

### Paso 5: Actualizar firewall (si es necesario)

Si estás usando un nuevo puerto, asegúrate de abrirlo en el firewall:

```bash
ssh root@157.245.226.11
sudo ufw allow 8080/tcp
sudo ufw reload
```

### Paso 6: Verificar acceso

Abre tu navegador en:
```
http://157.245.226.11:8080
```

## 🔧 Opción 2: Desde SSH (Método Avanzado)

Si prefieres usar la línea de comandos:

### Paso 1: Conectarse al servidor

```bash
ssh root@157.245.226.11
```

### Paso 2: Encontrar tu proyecto en Easypanel

Los proyectos de Easypanel suelen estar en:
```bash
cd /etc/easypanel/projects
# o
cd ~/.easypanel/projects
# o
cd /opt/easypanel/projects
```

Listar proyectos:
```bash
ls -la
```

### Paso 3: Navegar a tu proyecto

```bash
cd TU_PROYECTO_NOMBRE
```

### Paso 4: Editar docker-compose.yml

```bash
nano docker-compose.yml
```

Busca la sección de puertos y modifícala:

**Antes:**
```yaml
services:
  app:
    image: tu-imagen
    ports:
      - "80:80"
    # resto de configuración...
```

**Después:**
```yaml
services:
  app:
    image: tu-imagen
    ports:
      - "8080:80"  # Puerto host:Puerto contenedor
    # resto de configuración...
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`

### Paso 5: Reiniciar el contenedor

```bash
docker-compose down
docker-compose up -d
```

### Paso 6: Verificar que está corriendo

```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME            STATE    PORTS
fuse-app        Up       0.0.0.0:8080->80/tcp
```

### Paso 7: Abrir puerto en firewall

```bash
sudo ufw allow 8080/tcp
sudo ufw reload
sudo ufw status
```

## 🐳 Opción 3: Comandos Docker Directos

Si no encuentras los archivos de Easypanel, puedes manipular directamente Docker:

### Ver contenedores activos

```bash
docker ps
```

Anota el `CONTAINER ID` o `NAME` de tu aplicación.

### Detener y eliminar el contenedor actual

```bash
docker stop NOMBRE_CONTENEDOR
docker rm NOMBRE_CONTENEDOR
```

### Recrear con nuevo puerto

```bash
docker run -d \
  --name fuse-app \
  -p 8080:80 \
  --restart unless-stopped \
  -v /var/www/fuse-app:/usr/share/nginx/html \
  nginx:alpine
```

Ajusta según tu configuración específica.

## 📊 Mapeo de Puertos: Entendiendo la sintaxis

```yaml
ports:
  - "HOST_PORT:CONTAINER_PORT"
```

- **HOST_PORT**: Puerto en el servidor (el que usas en la URL)
- **CONTAINER_PORT**: Puerto dentro del contenedor (usualmente 80 para Nginx)

### Ejemplos:

```yaml
# Accesible en http://IP (puerto 80, estándar HTTP)
- "80:80"

# Accesible en http://IP:8080
- "8080:80"

# Accesible en http://IP:3000
- "3000:80"

# Múltiples puertos
- "80:80"
- "443:443"  # Para HTTPS
```

## 🎯 Recomendaciones de puertos

### Para NO especificar puerto en URL:
- **80** - HTTP estándar
- **443** - HTTPS estándar

### Para especificar puerto en URL:
- **8080** - Común para aplicaciones web
- **3000** - Común para aplicaciones Node.js
- **4200** - Puerto de desarrollo de Angular
- **8000-9000** - Rango seguro para aplicaciones

## 🔍 Troubleshooting

### "Port is already allocated" o "Address already in use"

**Problema**: El puerto del host ya está siendo usado por otro proceso.

**Solución 1**: Usar un puerto diferente
```yaml
ports:
  - "8081:80"  # Prueba con 8081, 8082, etc.
```

**Solución 2**: Identificar y detener el proceso que usa el puerto
```bash
# Ver qué está usando el puerto 80
sudo netstat -tlnp | grep :80
sudo lsof -i :80

# Detener el proceso (si es Apache por ejemplo)
sudo systemctl stop apache2
```

### "Cannot connect to Docker daemon"

**Problema**: Docker no está corriendo o necesitas permisos.

**Solución**:
```bash
# Verificar estado de Docker
sudo systemctl status docker

# Iniciar Docker si está detenido
sudo systemctl start docker

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### El contenedor se inicia pero no es accesible

**Problema**: Firewall bloqueando el puerto.

**Solución**:
```bash
# Verificar firewall
sudo ufw status

# Abrir el puerto necesario
sudo ufw allow 8080/tcp
sudo ufw reload

# Verificar que el contenedor esté escuchando
docker logs NOMBRE_CONTENEDOR
```

### Cambios no se aplican en Easypanel

**Solución**:
1. Asegúrate de hacer click en **"Save"** y **"Deploy"**
2. Si persiste, reinicia Easypanel:
   ```bash
   sudo systemctl restart easypanel
   ```

## 📋 Checklist de verificación

Después de cambiar el puerto, verifica:

- [ ] Contenedor está corriendo: `docker ps`
- [ ] Puerto está mapeado correctamente en `docker ps` output
- [ ] Firewall permite el puerto: `sudo ufw status`
- [ ] Aplicación responde: `curl http://localhost:PUERTO`
- [ ] Aplicación accesible desde navegador: `http://IP:PUERTO`
- [ ] Logs no muestran errores: `docker logs CONTENEDOR`

## 🔄 Configuración recomendada para Easypanel

Si quieres la configuración más limpia:

### docker-compose.yml óptimo

```yaml
version: '3.8'

services:
  fuse-app:
    image: nginx:alpine
    container_name: fuse-app
    restart: unless-stopped

    ports:
      - "8080:80"  # Cambia 8080 por tu puerto preferido

    volumes:
      - ./app:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

    networks:
      - easypanel

    labels:
      - "easypanel.managed=true"

networks:
  easypanel:
    external: true
```

## 💡 Tips adicionales

### 1. Usar variables de entorno

En Easypanel puedes definir el puerto como variable:

```yaml
services:
  app:
    ports:
      - "${HOST_PORT:-8080}:80"
```

Luego en Easypanel → Environment Variables:
```
HOST_PORT=8080
```

### 2. Configurar dominio con puerto personalizado

Si tienes un dominio, puedes configurar un proxy reverso en Easypanel:
- Dominio apunta al servidor
- Nginx/Traefik redirige `app.tudominio.com` → `localhost:8080`
- Accedes sin especificar puerto: `http://app.tudominio.com`

### 3. Múltiples aplicaciones en el mismo servidor

Asigna puertos diferentes a cada una:
```yaml
# App 1
- "8080:80"

# App 2
- "8081:80"

# App 3
- "8082:80"
```

## 📞 Soporte

Si tienes problemas:

1. **Revisa logs de Easypanel**: Generalmente en la interfaz web → Logs
2. **Revisa logs del contenedor**: `docker logs NOMBRE_CONTENEDOR`
3. **Consulta documentación de Easypanel**: https://easypanel.io/docs

---

**Resumen rápido:**

```bash
# 1. Acceder a Easypanel web
http://157.245.226.11:3000

# 2. Ir a Settings → Ports
# 3. Cambiar "80" → "8080"
# 4. Click Save & Deploy
# 5. Abrir puerto en firewall
ssh root@157.245.226.11
sudo ufw allow 8080/tcp

# 6. Acceder a tu app
http://157.245.226.11:8080
```

¡Listo! 🚀
