# Guía de Despliegue con Docker Compose

## 📋 Requisitos Previos

### En tu máquina local:
- Docker Desktop instalado
- SSH configurado
- Acceso al servidor (IP, usuario, contraseña/clave SSH)

### En el servidor:
- Docker instalado
- Docker Compose instalado
- Acceso SSH habilitado
- Puerto 8080 disponible (o el que configures)

## 🚀 Despliegue Rápido

### 1. Configurar el Script

Edita el archivo de despliegue según tu sistema operativo:

**Windows (PowerShell):** `deploy-docker.ps1`
**Linux/Mac (Bash):** `deploy-docker.sh`

Modifica estas líneas:

```powershell
# En deploy-docker.ps1 o deploy-docker.sh
$SERVER_IP = "157.245.226.11"        # ← CAMBIAR a la IP de tu servidor
$SERVER_USER = "root"                # ← CAMBIAR si usas otro usuario
$SERVER_PORT = 22                    # ← Dejar en 22 (SSH estándar)
$DEPLOY_PATH = "/var/www/fuse-app"   # ← Ruta donde se instalará
$CONTAINER_PORT = 8080               # ← Puerto externo de la app
```

### 2. Ejecutar el Despliegue

#### Windows (PowerShell):
```powershell
# Dar permisos de ejecución
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Ejecutar despliegue
.\deploy-docker.ps1
```

#### Linux/Mac (Bash):
```bash
# Dar permisos de ejecución
chmod +x deploy-docker.sh

# Ejecutar despliegue
./deploy-docker.sh
```

### 3. Proceso Automático

El script ejecutará automáticamente:

1. ✅ Validar archivos locales
2. ✅ Verificar conexión SSH al servidor
3. ✅ Comprobar Docker en servidor
4. ✅ Detener contenedores previos
5. ✅ Hacer backup del despliegue anterior
6. ✅ Subir archivos al servidor
7. ✅ Construir imagen Docker
8. ✅ Iniciar contenedores
9. ✅ Verificar que todo funcione
10. ✅ Configurar firewall

### 4. Acceder a la Aplicación

Una vez completado:

```
http://TU_IP_SERVIDOR:8080
```

Por ejemplo: `http://157.245.226.11:8080`

## 🔧 Instalación de Docker en Servidor (si no lo tienes)

Si el servidor no tiene Docker instalado:

```bash
# Conectarse al servidor
ssh root@TU_IP_SERVIDOR

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar instalación
docker --version
docker-compose --version
```

## 📊 Comandos Útiles Post-Despliegue

### Ver logs en tiempo real:
```bash
ssh root@TU_IP_SERVIDOR 'docker logs -f fuse-app'
```

### Ver estado de contenedores:
```bash
ssh root@TU_IP_SERVIDOR 'docker ps'
```

### Reiniciar la aplicación:
```bash
ssh root@TU_IP_SERVIDOR 'cd /var/www/fuse-app && docker-compose restart'
```

### Detener la aplicación:
```bash
ssh root@TU_IP_SERVIDOR 'cd /var/www/fuse-app && docker-compose down'
```

### Iniciar la aplicación:
```bash
ssh root@TU_IP_SERVIDOR 'cd /var/www/fuse-app && docker-compose up -d'
```

### Reconstruir desde cero:
```bash
ssh root@TU_IP_SERVIDOR 'cd /var/www/fuse-app && docker-compose down && docker-compose build --no-cache && docker-compose up -d'
```

## 🔥 Firewall

El script intenta configurar el firewall automáticamente, pero si no funciona:

### Ubuntu/Debian (UFW):
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
sudo ufw status
```

### CentOS/RHEL (firewalld):
```bash
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### iptables:
```bash
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables-save
```

## 🐛 Troubleshooting

### Problema: "No se puede conectar al servidor"

**Solución:**
```bash
# Verificar que puedes conectarte por SSH
ssh root@TU_IP_SERVIDOR

# Si falla, verifica:
# - IP correcta
# - Puerto SSH (22)
# - Credenciales correctas
# - Firewall del servidor permite SSH
```

### Problema: "Build fallido"

**Solución:**
```bash
# Conectarse al servidor y ver logs
ssh root@TU_IP_SERVIDOR
cd /var/www/fuse-app
docker-compose build

# Ver el error específico y solucionarlo
```

### Problema: "Contenedor no inicia"

**Solución:**
```bash
# Ver logs del contenedor
ssh root@TU_IP_SERVIDOR 'docker logs fuse-app'

# Ver estado
ssh root@TU_IP_SERVIDOR 'docker ps -a'
```

### Problema: "No puedo acceder desde navegador"

**Solución:**
```bash
# 1. Verificar que el contenedor está corriendo
ssh root@TU_IP_SERVIDOR 'docker ps | grep fuse-app'

# 2. Verificar puerto
ssh root@TU_IP_SERVIDOR 'docker ps --format "{{.Ports}}"'
# Debe mostrar: 0.0.0.0:8080->80/tcp

# 3. Verificar firewall
ssh root@TU_IP_SERVIDOR 'sudo ufw status'
# Debe mostrar: 8080/tcp ALLOW

# 4. Verificar desde el servidor
ssh root@TU_IP_SERVIDOR 'curl http://localhost:8080'
# Si funciona, el problema es el firewall externo
```

### Problema: "Puerto ya en uso"

**Solución:**
```bash
# Cambiar el puerto en docker-compose.yml
# Editar línea 19:
ports:
  - "3000:80"  # Cambiar 8080 por otro puerto disponible

# Re-desplegar
```

## 📝 Cambiar Puerto de la Aplicación

1. Editar `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Cambia 3000 por el puerto que quieras
```

2. Editar `deploy-docker.ps1` o `deploy-docker.sh`:
```powershell
$CONTAINER_PORT = 3000  # Cambiar al mismo puerto
```

3. Re-desplegar:
```powershell
.\deploy-docker.ps1
```

4. Abrir puerto en firewall:
```bash
sudo ufw allow 3000/tcp
```

## 🔐 Uso con SSH Key (sin contraseña)

Para despliegues automáticos sin pedir contraseña:

```bash
# En tu máquina local, generar clave SSH si no tienes
ssh-keygen -t rsa -b 4096

# Copiar clave al servidor
ssh-copy-id root@TU_IP_SERVIDOR

# Probar conexión
ssh root@TU_IP_SERVIDOR
# No debería pedir contraseña
```

## 🎯 Checklist de Despliegue

- [ ] Docker instalado en servidor
- [ ] SSH configurado y funcionando
- [ ] Script de despliegue configurado (IP, usuario, rutas)
- [ ] Firewall del servidor permite puerto 8080
- [ ] Script ejecutado sin errores
- [ ] Contenedor corriendo (`docker ps`)
- [ ] Puerto mapeado correctamente
- [ ] Aplicación accesible desde navegador
- [ ] Logs sin errores críticos

## 📚 Estructura de Archivos en el Servidor

```
/var/www/fuse-app/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── package-lock.json
├── angular.json
├── tsconfig.json
├── tailwind.config.js
└── src/
    └── (código fuente de la app)
```

## 🔄 Actualizar Aplicación

Para actualizar la app después de hacer cambios:

```powershell
# Ejecutar nuevamente el script de despliegue
.\deploy-docker.ps1

# El script automáticamente:
# - Hará backup del despliegue anterior
# - Subirá los nuevos archivos
# - Reconstruirá la imagen
# - Reiniciará los contenedores
```

## 💡 Tips

1. **Primera vez:** El build puede tomar 10-15 minutos
2. **Actualizaciones:** Los builds subsecuentes son más rápidos (5-7 min) gracias al caché
3. **Backups:** Cada despliegue crea un backup automático en `/var/www/fuse-app_backup_FECHA`
4. **Logs:** Siempre revisa los logs si algo falla: `docker logs -f fuse-app`
5. **Monitoreo:** Usa `docker stats fuse-app` para ver uso de recursos

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker logs fuse-app`
2. Verifica el estado: `docker ps -a`
3. Comprueba el firewall: `sudo ufw status`
4. Prueba acceso local en el servidor: `curl http://localhost:80`
5. Reconstruye desde cero: `docker-compose down && docker-compose build --no-cache && docker-compose up -d`
