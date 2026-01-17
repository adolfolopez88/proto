# 🚀 Guía de Despliegue - Fuse Angular App

## 📌 Problema Resuelto

**Error original:**
```
[ERROR] Fallo al subir archivos
C:\WINDOWS\System32\OpenSSH\scp.exe: remote mkdir "/var/www/fuse-app": No such file or directory
```

**Causa:** El directorio `/var/www/fuse-app` no existía en el servidor antes de intentar subir archivos.

**Solución:** Scripts actualizados que crean el directorio automáticamente.

---

## 🎯 Métodos de Despliegue (3 opciones)

### **Opción 1: Script Simplificado (RECOMENDADO) ⭐**

**Ventajas:**
- ✅ Crea directorio automáticamente
- ✅ Empaqueta archivos en un solo .tar.gz
- ✅ Más rápido (1 archivo vs múltiples)
- ✅ Muestra errores detallados
- ✅ Backups automáticos

**Uso:**
```powershell
.\deploy-docker-simple.ps1
```

**Qué hace:**
1. Verifica conexión SSH
2. Crea directorio en servidor
3. Empaqueta archivos localmente
4. Sube 1 archivo comprimido
5. Descomprime en servidor
6. Construye imagen Docker
7. Inicia contenedores
8. Verifica funcionamiento

---

### **Opción 2: Script Manual (MÁS BÁSICO) 🔧**

**Cuándo usar:**
- Cuando el script simplificado falla
- Para debug paso a paso
- Conexiones SSH lentas

**Ventajas:**
- ✅ Comando por comando
- ✅ Fácil de depurar
- ✅ Sin dependencias (no necesita tar)

**Uso:**
```powershell
.\deploy-manual.ps1
```

**Qué hace:**
1. Crea directorio
2. Sube Dockerfile
3. Sube docker-compose.yml
4. Sube nginx.conf
5. Sube archivos de config
6. Sube código fuente (src/)
7. Construye e inicia

---

### **Opción 3: Despliegue 100% Manual 📝**

**Para máximo control:**

#### Paso 1: Crear directorio en servidor
```powershell
ssh root@206.189.163.147 "mkdir -p /var/www/fuse-app && chmod 755 /var/www/fuse-app"
```

#### Paso 2: Subir archivos
```powershell
# Archivos de Docker
scp Dockerfile root@206.189.163.147:/var/www/fuse-app/
scp docker-compose.yml root@206.189.163.147:/var/www/fuse-app/
scp nginx.conf root@206.189.163.147:/var/www/fuse-app/

# Configuración
scp package*.json angular.json tsconfig*.json tailwind.config.js root@206.189.163.147:/var/www/fuse-app/

# Código fuente
scp -r src root@206.189.163.147:/var/www/fuse-app/
```

#### Paso 3: Conectarse y construir
```powershell
ssh root@206.189.163.147
```

Luego en el servidor:
```bash
cd /var/www/fuse-app
docker-compose build
docker-compose up -d
docker ps
docker logs fuse-app
```

---

## 🔍 Herramienta de Diagnóstico

**Antes de desplegar, ejecuta:**
```powershell
.\diagnostico-deploy.ps1
```

Verifica:
- ✓ Conexión SSH
- ✓ Docker instalado
- ✓ Permisos de directorio
- ✓ SCP funcionando
- ✓ Espacio en disco
- ✓ Puerto 8080 disponible
- ✓ Archivos locales presentes

---

## 📊 Comparación de Métodos

| Característica | Simplificado | Manual | 100% Manual |
|----------------|--------------|--------|-------------|
| Velocidad | ⚡⚡⚡ | ⚡⚡ | ⚡ |
| Facilidad | 🟢 Fácil | 🟡 Media | 🔴 Complejo |
| Debug | Medio | Fácil | Muy fácil |
| Automatización | Alta | Media | Ninguna |
| Errores visibles | Sí | Sí | Sí |
| Backups auto | ✅ | ✅ | ❌ |

---

## ⚙️ Configuración SSH sin Contraseña (Opcional)

**Para evitar escribir contraseña múltiples veces:**

```powershell
# 1. Generar clave SSH
ssh-keygen -t rsa -b 4096

# 2. Copiar al servidor
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@206.189.163.147 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 3. Configurar permisos
ssh root@206.189.163.147 "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

# 4. Probar
ssh root@206.189.163.147
# Ya no pedirá contraseña
```

---

## 🎯 Flujo Recomendado

### Primera vez:
```powershell
# 1. Diagnóstico
.\diagnostico-deploy.ps1

# 2. Deploy
.\deploy-docker-simple.ps1

# 3. Verificar
# Abrir http://206.189.163.147:8080
```

### Si falla el script simplificado:
```powershell
# Usar método manual
.\deploy-manual.ps1
```

### Para updates posteriores:
```powershell
# Mismo script simplificado
.\deploy-docker-simple.ps1
# Hace backup automático antes de actualizar
```

---

## 🐛 Solución de Problemas Comunes

### Error: "No such file or directory"
**Solución:** ✅ RESUELTO - Los nuevos scripts crean el directorio automáticamente

### Error: "Permission denied"
```bash
ssh root@206.189.163.147 "chmod 755 /var/www/fuse-app"
```

### Error: "Docker not installed"
```bash
ssh root@206.189.163.147
curl -fsSL https://get.docker.com | sh
```

### Error: Build muy lento
**Normal.** Primera vez: 10-15 min. Siguientes: 5-7 min (por caché)

### Error: Puerto 8080 en uso
```bash
# Ver qué está usando el puerto
ssh root@206.189.163.147 "netstat -tuln | grep :8080"

# Detener aplicación anterior
ssh root@206.189.163.147 "cd /var/www/fuse-app && docker-compose down"
```

### Ver logs en tiempo real:
```powershell
ssh root@206.189.163.147 "docker logs -f fuse-app"
```

---

## 📦 Archivos de Deploy Disponibles

```
deploy-docker-simple.ps1     ← RECOMENDADO (empaquetado)
deploy-manual.ps1            ← Alternativa básica
diagnostico-deploy.ps1       ← Herramienta de diagnóstico
deploy-docker.ps1            ← Original (complejo)
deploy-docker.sh             ← Para Linux/Mac
README_DEPLOY.md             ← Este archivo
SOLUCION_ERROR_DEPLOY.md     ← Guía de problemas
```

---

## 🎉 Después del Deploy

**URL de tu aplicación:**
```
http://206.189.163.147:8080
```

**Comandos útiles:**

```powershell
# Ver estado
ssh root@206.189.163.147 "docker ps"

# Ver logs
ssh root@206.189.163.147 "docker logs -f fuse-app"

# Reiniciar app
ssh root@206.189.163.147 "cd /var/www/fuse-app && docker-compose restart"

# Detener app
ssh root@206.189.163.147 "cd /var/www/fuse-app && docker-compose down"

# Reconstruir desde cero
ssh root@206.189.163.147 "cd /var/www/fuse-app && docker-compose down && docker-compose build --no-cache && docker-compose up -d"
```

---

## 🆘 ¿Necesitas Ayuda?

1. Ejecuta diagnóstico:
   ```powershell
   .\diagnostico-deploy.ps1 > diagnostico.txt
   ```

2. Comparte el contenido de `diagnostico.txt`

3. Revisa [SOLUCION_ERROR_DEPLOY.md](SOLUCION_ERROR_DEPLOY.md)
