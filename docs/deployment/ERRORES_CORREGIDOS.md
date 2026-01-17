# Errores Corregidos en Scripts de Deploy

## 📋 Resumen de Errores y Soluciones

### ✅ Error 1: Directorio no existe
**Error:**
```
C:\WINDOWS\System32\OpenSSH\scp.exe: remote mkdir "/var/www/fuse-app": No such file or directory
```

**Causa:** Intentaba subir archivos a un directorio que no existía.

**Solución:** El script ahora crea el directorio ANTES de subir archivos.

---

### ✅ Error 2: Sintaxis de bash
**Error:**
```
bash: -c: line 18: syntax error: unexpected end of file
```

**Causa:** PowerShell here-strings (`@"..."@`) causaban problemas con comandos bash multi-línea.

**Solución:** Reemplazados con comandos SSH individuales usando comillas dobles.

---

### ✅ Error 3: Interpretación de `date` por PowerShell
**Error:**
```
Get-Date : No se puede enlazar el parámetro 'Date'. No se puede convertir el valor "+%Y%m%d_%H%M%S"
```

**Causa:** PowerShell interpreta `date` como alias de `Get-Date` dentro de comillas dobles con interpolación de variables.

**Solución:** Usar concatenación de strings con comillas simples para evitar interpretación de PowerShell.

**ANTES (causaba error):**
```powershell
ssh $SERVER "BACKUP_DIR=${DEPLOY_PATH}_backup_\$(date +%Y%m%d_%H%M%S)"
```

**AHORA (funciona):**
```powershell
$backupCmd = 'if [ -d ' + $DEPLOY_PATH + ' ]; then BACKUP_DIR=' + $DEPLOY_PATH + '_backup_$(date +%Y%m%d_%H%M%S); cp -r ' + $DEPLOY_PATH + ' $BACKUP_DIR 2>/dev/null || true; fi'
ssh $SERVER $backupCmd
```

---

## 🔧 Archivos Corregidos

| Archivo | Errores Corregidos |
|---------|-------------------|
| `deploy-docker-simple.ps1` | ✅ Los 3 errores |
| `deploy-manual.ps1` | ✅ Error 2 (sintaxis bash) |
| `deploy-docker.ps1` | ✅ Error 1 (variables PowerShell) |

---

## 🎯 Scripts Disponibles Ahora

### 1. **deploy-docker-simple.ps1** ⭐ RECOMENDADO
```powershell
.\deploy-docker-simple.ps1
```
- ✅ Todos los errores corregidos
- ✅ Empaqueta archivos en .tar.gz
- ✅ Subida única y rápida
- ✅ Backups automáticos
- ✅ Manejo robusto de errores

### 2. **deploy-manual.ps1** 🔧 Alternativa
```powershell
.\deploy-manual.ps1
```
- ✅ Sube archivos uno por uno
- ✅ Fácil de depurar
- ✅ Sin dependencias

### 3. **test-ssh-commands.ps1** 🧪 Pruebas
```powershell
.\test-ssh-commands.ps1
```
- ✅ Prueba comandos SSH antes del deploy
- ✅ Verifica Docker/docker-compose
- ✅ Valida sintaxis de comandos

### 4. **diagnostico-deploy.ps1** 🔍 Diagnóstico
```powershell
.\diagnostico-deploy.ps1
```
- ✅ Verifica requisitos previos
- ✅ Identifica problemas antes de desplegar

---

## 📊 Flujo de Deploy Correcto

```
1. Diagnóstico (opcional)
   └─> .\diagnostico-deploy.ps1

2. Pruebas SSH (opcional)
   └─> .\test-ssh-commands.ps1

3. Deploy
   └─> .\deploy-docker-simple.ps1

4. Verificar
   └─> http://206.189.163.147:8080
```

---

## 🐛 Detalles Técnicos de las Correcciones

### Corrección 1: Orden de Operaciones
```powershell
# ANTES (MALO)
[Crear paquete] → [Subir archivos] → [Crear directorio]
                                      ↑ ERROR: directorio no existe

# AHORA (BUENO)
[Crear directorio] → [Crear paquete] → [Subir archivos]
                                        ↑ OK: directorio existe
```

### Corrección 2: Sintaxis de Comandos SSH
```powershell
# ANTES (MALO - here-string)
ssh $SERVER @"
    cd $DEPLOY_PATH
    docker-compose build
"@
# ERROR: bash no puede parsear correctamente

# AHORA (BUENO - comando directo)
ssh $SERVER "cd $DEPLOY_PATH && docker-compose build"
# OK: comando bash válido
```

### Corrección 3: Escape de Variables
```powershell
# ANTES (MALO - PowerShell interpreta $(...))
ssh $SERVER "BACKUP=path_$(date +%Y)"
# ERROR: PowerShell trata 'date' como Get-Date

# AHORA (BUENO - comillas simples)
$cmd = 'BACKUP=path_$(date +%Y)'
ssh $SERVER $cmd
# OK: string literal, no interpretado por PowerShell
```

---

## ✅ Verificación de Correcciones

Para verificar que todo funciona:

```powershell
# 1. Prueba SSH básico
ssh root@206.189.163.147 "echo OK"

# 2. Prueba comandos complejos
.\test-ssh-commands.ps1

# 3. Deploy real
.\deploy-docker-simple.ps1
```

---

## 🆘 Si Aún Hay Problemas

### Error: "Permission denied"
```bash
ssh root@206.189.163.147 "chmod 755 /var/www/fuse-app"
```

### Error: "Docker not found"
```bash
ssh root@206.189.163.147
curl -fsSL https://get.docker.com | sh
```

### Error: "Port 8080 in use"
```bash
ssh root@206.189.163.147 "netstat -tuln | grep :8080"
```

### Ver logs de deploy
```powershell
ssh root@206.189.163.147 "docker logs -f fuse-app"
```

---

## 📚 Archivos de Referencia

- [README_DEPLOY.md](README_DEPLOY.md) - Guía completa de deploy
- [SOLUCION_ERROR_DEPLOY.md](SOLUCION_ERROR_DEPLOY.md) - Troubleshooting
- [DOCKER_DEPLOY_GUIDE.md](DOCKER_DEPLOY_GUIDE.md) - Guía original
- [DEPLOY_DOCKER_GUIDE.md](DEPLOY_DOCKER_GUIDE.md) - Instrucciones detalladas

---

## 🎉 Estado Actual

| Componente | Estado |
|------------|--------|
| Scripts PowerShell | ✅ Corregidos |
| Sintaxis Bash | ✅ Validada |
| Comandos SSH | ✅ Probados |
| Docker Build | ✅ Funcionando |
| Documentación | ✅ Actualizada |

**Todo listo para desplegar!** 🚀
