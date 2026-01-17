# Deploy Quick Start 🚀

Guía rápida para desplegar la aplicación Fuse Angular.

## 📋 Opciones de Deploy Disponibles

### 1. 🔵 Firebase Hosting (Hosting Estático)
- ✅ Gratis hasta cierto límite
- ✅ SSL automático
- ✅ CDN global
- ✅ Deploy en 2 comandos

### 2. 🟦 Digital Ocean Droplet (VPS)
- ✅ Control total del servidor
- ✅ Más económico a largo plazo
- ✅ Personalización completa
- ⚠️ Requiere configuración inicial

---

## 🔵 Firebase Hosting

### Requisitos
- Cuenta de Firebase
- Firebase CLI instalado

### Pasos

**1. Instalar Firebase CLI** (si no está instalado)
```bash
npm install -g firebase-tools
```

**2. Login**
```bash
firebase login
```

**3. Deploy**
```bash
npm run deploy:firebase
```

**URL final:** `https://proto-c51d8.web.app`

📖 **Documentación completa:** [DEPLOY.md](DEPLOY.md)

---

## 🟦 Digital Ocean Droplet

### Requisitos
- Droplet de Digital Ocean
- Acceso SSH al droplet

### Configuración Inicial del Droplet

**1. Conectarse al droplet**
```bash
ssh root@YOUR_DROPLET_IP
```

**2. Instalar Nginx**
```bash
apt update && apt upgrade -y
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**3. Configurar Nginx**

Crear archivo: `/etc/nginx/sites-available/fuse-app`

```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP;

    root /var/www/fuse-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**4. Habilitar sitio**
```bash
ln -s /etc/nginx/sites-available/fuse-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
mkdir -p /var/www/fuse-app
```

### Deploy desde tu Máquina Local

**1. Configurar el script**

Edita `deploy-do.ps1` (Windows) o `deploy-do.sh` (Linux/Mac):

```powershell
$DROPLET_IP = "123.456.789.012"  # Tu IP aquí
```

**2. Ejecutar deploy**

**Windows:**
```bash
npm run deploy:do
```

**Linux/Mac:**
```bash
chmod +x deploy-do.sh
npm run deploy:do:linux
```

**URL final:** `http://YOUR_DROPLET_IP`

📖 **Documentación completa:** [DEPLOY_DIGITAL_OCEAN.md](DEPLOY_DIGITAL_OCEAN.md)

---

## 🛠️ Scripts Disponibles

### Build
```bash
npm run build:prod          # Build de producción local
```

### Firebase
```bash
npm run deploy:firebase           # Deploy a Firebase Hosting
npm run deploy:firebase:preview   # Deploy a canal preview
npm run firebase:serve            # Testing local con Firebase
```

### Digital Ocean
```bash
npm run deploy:do         # Deploy a Digital Ocean (Windows)
npm run deploy:do:linux   # Deploy a Digital Ocean (Linux/Mac)
```

---

## 🔄 Flujo Típico de Deploy

### Primera Vez (Firebase)
```bash
# 1. Instalar CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Deploy
npm run deploy:firebase
```

### Primera Vez (Digital Ocean)
```bash
# 1. Configurar droplet (ver arriba)
# 2. Editar deploy-do.ps1
# 3. Deploy
npm run deploy:do
```

### Actualizaciones Posteriores

**Firebase:**
```bash
npm run deploy:firebase
```

**Digital Ocean:**
```bash
npm run deploy:do
```

---

## 📊 Comparación Rápida

| Característica | Firebase | Digital Ocean |
|----------------|----------|---------------|
| **Costo inicial** | Gratis | $5-10/mes |
| **Setup** | 5 minutos | 30 minutos |
| **SSL** | Automático | Manual (Let's Encrypt) |
| **CDN** | Global | No (opcional) |
| **Control** | Limitado | Total |
| **Escalabilidad** | Automática | Manual |
| **Dominio personalizado** | Fácil | Requiere DNS |

---

## ⚡ Deploy Rápido (Ya configurado)

### Firebase (Recomendado para empezar)
```bash
firebase login
npm run deploy:firebase
```
⏱️ **Tiempo:** 3-5 minutos

### Digital Ocean (Más control)
```bash
# 1. Editar deploy-do.ps1 con tu IP
# 2. Ejecutar:
npm run deploy:do
```
⏱️ **Tiempo:** ~5 minutos (después de setup inicial)

---

## 🐛 Problemas Comunes

### Firebase: "Not authorized"
```bash
firebase login --reauth
```

### Firebase: "Project not found"
```bash
firebase use proto-c51d8
```

### Digital Ocean: "Connection refused"
```bash
# Verificar que SSH esté abierto
ssh root@YOUR_IP "echo 'OK'"
```

### Digital Ocean: "Permission denied"
```bash
# Configurar SSH key
ssh-copy-id root@YOUR_IP
```

---

## 📚 Documentación Completa

- **[DEPLOY.md](DEPLOY.md)** - Firebase Hosting detallado
- **[DEPLOY_DIGITAL_OCEAN.md](DEPLOY_DIGITAL_OCEAN.md)** - Digital Ocean completo
- **[DEPLOY_MANUAL.md](DEPLOY_MANUAL.md)** - Instrucciones paso a paso

---

## 💡 Recomendación

**Para desarrollo/testing rápido:**
→ Usa **Firebase Hosting**

**Para producción con control total:**
→ Usa **Digital Ocean** + SSL (Let's Encrypt)

**Para máxima performance:**
→ **Digital Ocean** + Cloudflare CDN

---

## 🎯 Siguiente Paso

**¿Tienes 5 minutos?**
```bash
firebase login && npm run deploy:firebase
```

**¿Tienes un droplet configurado?**
```bash
# Edita deploy-do.ps1 con tu IP
npm run deploy:do
```

---

**¿Preguntas?**
- Lee la documentación completa en los archivos DEPLOY_*.md
- Verifica los logs de Nginx o Firebase
- Revisa la consola del navegador (F12)
