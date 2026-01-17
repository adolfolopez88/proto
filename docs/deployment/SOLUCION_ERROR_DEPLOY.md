# Solución al Error de Deploy

## 🔴 Problema Identificado

El error ocurre al subir archivos con SCP:
```
[PASO 3] Subiendo archivos al servidor...
root@206.189.163.147's password:
[ERROR] Comando fallido
```

## ✅ Soluciones Disponibles

### **Solución 1: Usar Script Simplificado (RECOMENDADO)**

He creado un script mejorado que:
- Empaqueta todos los archivos en un solo archivo `.tar.gz`
- Sube un solo archivo (más rápido y confiable)
- Muestra errores detallados

**Pasos:**

1. **Ejecutar diagnóstico primero:**
```powershell
.\diagnostico-deploy.ps1
```

2. **Si todo está OK, ejecutar deploy:**
```powershell
.\deploy-docker-simple.ps1
```

### **Solución 2: Configurar SSH sin contraseña**

El problema puede ser que SSH pide contraseña múltiples veces. Solución:

```powershell
# 1. Generar clave SSH (si no tienes)
ssh-keygen -t rsa -b 4096

# 2. Copiar clave al servidor
# En PowerShell, necesitarás hacerlo manualmente:
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@206.189.163.147 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 3. Probar conexión sin contraseña
ssh root@206.189.163.147
# Ya no debería pedir contraseña
```

### **Solución 3: Despliegue Manual Paso a Paso**

Si los scripts automáticos fallan, hazlo manualmente:

#### Paso 1: Crear paquete local
```powershell
# Crear archivo tar (si tienes tar en Windows)
tar -czf deploy.tar.gz Dockerfile docker-compose.yml nginx.conf package.json package-lock.json angular.json tsconfig.json tsconfig.app.json tailwind.config.js src

# O usar Compress-Archive (nativo PowerShell)
Compress-Archive -Path Dockerfile,docker-compose.yml,nginx.conf,package.json,package-lock.json,angular.json,tsconfig.json,tsconfig.app.json,tailwind.config.js,src -DestinationPath deploy.zip -Force
```

#### Paso 2: Subir paquete
```powershell
scp deploy.tar.gz root@206.189.163.147:/var/www/fuse-app/
# O si usaste zip:
scp deploy.zip root@206.189.163.147:/var/www/fuse-app/
```

#### Paso 3: Conectarse al servidor
```powershell
ssh root@206.189.163.147
```

#### Paso 4: En el servidor, descomprimir y desplegar
```bash
cd /var/www/fuse-app

# Si es tar.gz:
tar -xzf deploy.tar.gz
rm deploy.tar.gz

# Si es zip:
unzip deploy.zip
rm deploy.zip

# Construir y ejecutar
docker-compose build
docker-compose up -d

# Verificar
docker ps
docker logs fuse-app
```

## 🔍 Diagnóstico del Error Específico

Si SCP falla, puede ser por:

### 1. **Permisos del directorio**
```bash
# Conectarse al servidor
ssh root@206.189.163.147

# Verificar y crear directorio con permisos
mkdir -p /var/www/fuse-app
chmod 755 /var/www/fuse-app
```

### 2. **Ruta no existe**
El directorio `/var/www/fuse-app` podría no existir. El script simplificado lo crea automáticamente.

### 3. **Problemas con wildcards**
El comando `scp ... /*` puede fallar. Por eso el script nuevo empaqueta todo primero.

### 4. **Timeout de SSH**
Si la conexión es lenta, SSH puede hacer timeout. Solución:

```powershell
# En tu archivo SSH config (~/.ssh/config o C:\Users\TU_USUARIO\.ssh\config)
Host 206.189.163.147
    ServerAliveInterval 60
    ServerAliveCountMax 10
```

## 🚀 Método Recomendado (Más Fácil)

**Usa el script simplificado:**

```powershell
# 1. Diagnóstico
.\diagnostico-deploy.ps1

# 2. Si todo OK, deploy
.\deploy-docker-simple.ps1
```

**Ventajas:**
- ✅ Un solo archivo para subir (más rápido)
- ✅ Errores detallados y visibles
- ✅ Más robusto con conexiones lentas
- ✅ Manejo automático de backups
- ✅ Validaciones en cada paso

## 🐛 Si el Error Persiste

Ejecuta paso a paso para ver dónde falla:

```powershell
# Test 1: SSH básico
ssh root@206.189.163.147 "echo OK"

# Test 2: SCP archivo pequeño
"test" | Out-File test.txt
scp test.txt root@206.189.163.147:/tmp/
Remove-Item test.txt

# Test 3: Crear directorio remoto
ssh root@206.189.163.147 "mkdir -p /var/www/fuse-app && chmod 755 /var/www/fuse-app"

# Test 4: SCP al directorio de deploy
"test" | Out-File test.txt
scp test.txt root@206.189.163.147:/var/www/fuse-app/
Remove-Item test.txt
```

Si alguno de estos falla, comparte el error específico.

## 📞 Información para Soporte

Si necesitas ayuda adicional, ejecuta y comparte:

```powershell
.\diagnostico-deploy.ps1 > diagnostico.txt
type diagnostico.txt
```

Este archivo mostrará exactamente qué está fallando.
