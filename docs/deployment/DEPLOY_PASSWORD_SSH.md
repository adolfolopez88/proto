# Deploy con Password SSH en Digital Ocean

Guía para usar password en lugar de SSH keys para el deploy.

## ✅ Sí, puedes usar password

Windows y PowerShell soportan autenticación con password SSH. El sistema te pedirá la contraseña cada vez que te conectes.

## 🔐 Opción 1: Password Interactivo (Recomendado)

### Configuración

Edita `deploy-do.ps1`:

```powershell
$DROPLET_IP = "123.456.789.012"           # Tu IP del droplet
$DROPLET_USER = "root"                     # Usuario (generalmente root)
$DROPLET_PASSWORD = ""                     # Dejar VACÍO para password interactivo
```

### Deploy

```bash
npm run deploy:do
```

**El sistema te pedirá el password en cada paso:**
1. Al verificar conexión
2. Al crear backup
3. Al subir archivos
4. Al configurar permisos
5. Al verificar Nginx

**Total:** ~5 veces (cada comando SSH/SCP)

## 🔑 Opción 2: Guardar Password en Script (NO Recomendado)

⚠️ **ADVERTENCIA:** Esto NO es seguro. El password estará en texto plano en el archivo.

Si aún así lo prefieres:

### Instalar sshpass (Windows)

```powershell
# Opción A: Con Chocolatey
choco install sshpass

# Opción B: Con WSL
wsl sudo apt install sshpass
```

### Modificar Script

NO recomendado - es mejor usar password interactivo.

## 🚀 Opción 3: SSH Key (Mejor Experiencia)

Configurar una vez, no más passwords.

### Paso 1: Generar SSH Key en Windows

```powershell
# Abrir PowerShell
ssh-keygen -t rsa -b 4096

# Presiona Enter 3 veces (sin passphrase para deploy automático)
```

Esto crea dos archivos:
- `C:\Users\TU_USUARIO\.ssh\id_rsa` (privada)
- `C:\Users\TU_USUARIO\.ssh\id_rsa.pub` (pública)

### Paso 2: Copiar Key al Droplet

**Método A: Manual (más simple)**

1. Ver tu clave pública:
```powershell
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
```

2. Copiar TODO el texto que aparece

3. Conectarte al droplet con password:
```bash
ssh root@TU_IP_DROPLET
```

4. En el droplet, ejecutar:
```bash
mkdir -p ~/.ssh
echo "PEGA_AQUI_LA_CLAVE_PUBLICA" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Método B: Con comando (Windows 10+)**

```powershell
# Desde PowerShell
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@TU_IP_DROPLET "cat >> ~/.ssh/authorized_keys"
```

### Paso 3: Probar

```bash
ssh root@TU_IP_DROPLET
```

Si NO te pide password, ¡funciona! 🎉

### Paso 4: Deploy sin Password

```bash
npm run deploy:do
```

Ahora se ejecuta completamente automático, sin pedir password.

## 📋 Comparación de Opciones

| Método | Setup | Seguridad | Experiencia |
|--------|-------|-----------|-------------|
| **Password Interactivo** | ✅ Ninguno | ⚠️ Media | ⚠️ Pide password 5 veces |
| **Password en Script** | ⚠️ Instalar sshpass | ❌ Baja | ✅ Automático |
| **SSH Key** | 🔧 5 minutos | ✅ Alta | ✅ Automático |

## 🎯 Recomendación

### Para Empezar AHORA
→ Usa **Password Interactivo** (Opción 1)
- No requiere setup
- Solo edita la IP en `deploy-do.ps1`
- Ejecuta `npm run deploy:do`

### Para Uso Regular
→ Configura **SSH Key** (Opción 3)
- Setup de 5 minutos una sola vez
- Deploys automáticos sin pedir password
- Mucho más seguro

## 🔧 Setup Paso a Paso con Password

### 1. Editar Script

```powershell
# deploy-do.ps1
$DROPLET_IP = "164.90.XXX.XXX"    # Tu IP aquí
$DROPLET_USER = "root"             # Tu usuario
$DROPLET_PASSWORD = ""             # Dejar vacío
```

### 2. Preparar Droplet (primera vez)

Conectarte con password:
```bash
ssh root@TU_IP_DROPLET
```

Instalar Nginx:
```bash
apt update && apt upgrade -y
apt install nginx -y
systemctl start nginx
systemctl enable nginx
mkdir -p /var/www/fuse-app
```

Configurar Nginx (ver [DEPLOY_DIGITAL_OCEAN.md](DEPLOY_DIGITAL_OCEAN.md) para la configuración completa).

Salir del droplet:
```bash
exit
```

### 3. Deploy

```bash
npm run deploy:do
```

Te pedirá el password ~5 veces. Ingrésalo cada vez.

### 4. Acceder

```
http://TU_IP_DROPLET
```

## 🐛 Troubleshooting

### "Password authentication failed"

**Verifica:**
1. Password correcto
2. Usuario correcto (¿es `root` o otro?)
3. SSH habilitado con password en el droplet

**Habilitar password SSH en droplet:**
```bash
# En el droplet
nano /etc/ssh/sshd_config

# Buscar y cambiar:
PasswordAuthentication yes

# Reiniciar SSH
systemctl restart sshd
```

### "Permission denied (publickey)"

El droplet está configurado SOLO para SSH keys, no permite passwords.

**Solución A:** Habilitar password authentication (ver arriba)

**Solución B:** Configurar SSH key (Opción 3)

### "ssh: connect to host X.X.X.X port 22: Connection refused"

**Verifica:**
1. IP correcta del droplet
2. Firewall del droplet permite puerto 22
3. Droplet está encendido

**En Digital Ocean console:**
- Ve a tu droplet
- Click en "Access"
- Usa "Launch Droplet Console" para acceso web

### Password muy largo o complejo

Si el password tiene caracteres especiales y causa problemas:

**Solución:** Cambiarlo temporalmente:
```bash
# En el droplet
passwd root
# Ingresa un password más simple para deploy
```

## 💡 Tips para Password Deploy

1. **Copia el password** en el clipboard antes de ejecutar deploy
2. **Paste rápido** (Ctrl+V) cuando pida password
3. **Considera SSH key** si vas a hacer muchos deploys
4. **No guardes el password** en archivos de texto

## 🔄 Flujo Típico

```bash
# 1. Editar deploy-do.ps1 con tu IP
# 2. Build y deploy
npm run deploy:do

# Te pedirá password ~5 veces:
# Password:  [ingresar]
# Password:  [ingresar]
# Password:  [ingresar]
# Password:  [ingresar]
# Password:  [ingresar]

# ✅ Deploy completado!
# 🌐 URL: http://TU_IP
```

## 📚 Próximo Paso

Una vez que funcione con password, **considera migrar a SSH keys** para:
- ✅ Deploy en 1 comando (sin pedir password)
- ✅ Mayor seguridad
- ✅ Automatización completa
- ✅ Scripts de CI/CD

Toma solo 5 minutos (ver Opción 3 arriba).

---

**¿Listo para deploy?**

1. Edita `deploy-do.ps1` con tu IP
2. Ejecuta: `npm run deploy:do`
3. Ingresa password cuando lo pida

¡Simple! 🚀
