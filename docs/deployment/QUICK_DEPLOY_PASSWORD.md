# Deploy Rápido con Password

## ✅ Sí, puedes usar password - Es muy simple!

Windows SSH soporta autenticación con password. Te pedirá el password varias veces durante el deploy, pero funciona perfectamente.

## 🚀 3 Pasos para Deploy

### Paso 1: Configurar tu IP

Edita `deploy-do.ps1`, línea 7:

```powershell
$DROPLET_IP = "164.90.XXX.XXX"  # Pon tu IP aquí
```

### Paso 2: Preparar el Droplet (primera vez)

Conéctate a tu droplet:
```bash
ssh root@TU_IP_DROPLET
```
(Te pedirá el password - ingrésalo)

Ejecuta estos comandos:
```bash
# Instalar Nginx
apt update && apt upgrade -y
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Crear directorio
mkdir -p /var/www/fuse-app

# Configurar Nginx
cat > /etc/nginx/sites-available/fuse-app << 'EOF'
server {
    listen 80;
    server_name _;
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
EOF

# Habilitar sitio
ln -s /etc/nginx/sites-available/fuse-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Listo!
exit
```

### Paso 3: Deploy

En tu máquina Windows:
```bash
npm run deploy:do
```

**Te pedirá el password unas 5 veces** - ingrésalo cada vez.

¡Listo! Tu app estará en: `http://TU_IP_DROPLET`

---

## 💡 ¿El password es molesto?

Si vas a hacer deploys frecuentes, considera configurar SSH key (toma 5 minutos):

### Setup SSH Key (Opcional)

```powershell
# 1. Generar key
ssh-keygen -t rsa -b 4096
# Presiona Enter 3 veces

# 2. Ver tu clave pública
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
# Copia TODO el texto

# 3. Conectar al droplet
ssh root@TU_IP_DROPLET
# (Ingresa password por última vez)

# 4. En el droplet:
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Pega la clave pública, guarda (Ctrl+X, Y, Enter)

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit

# 5. Probar (no debería pedir password)
ssh root@TU_IP_DROPLET
```

¡Ahora `npm run deploy:do` funciona sin pedir password! 🎉

---

## 🐛 Si algo falla

### "Permission denied"
- Verifica que el password sea correcto
- Intenta conectarte manualmente: `ssh root@TU_IP`

### "Connection refused"
- Verifica que la IP sea correcta
- Verifica que el droplet esté encendido en Digital Ocean

### Nginx no muestra la app
```bash
# Conectarse al droplet
ssh root@TU_IP

# Ver logs
tail -f /var/log/nginx/error.log

# Ver archivos
ls -la /var/www/fuse-app/
```

---

## 📋 Resumen

✅ **Con Password:**
- Edita IP en `deploy-do.ps1`
- Ejecuta `npm run deploy:do`
- Ingresa password cuando lo pida (~5 veces)

✅ **Con SSH Key (recomendado):**
- Setup de 5 minutos (ver arriba)
- Deploy automático sin password
- Más seguro

---

**¿Listo?**

```bash
# 1. Edita deploy-do.ps1 con tu IP
# 2. Ejecuta:
npm run deploy:do
```

¡Así de simple! 🚀
