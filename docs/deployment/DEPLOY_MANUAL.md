# Deploy Manual - Pasos a Seguir

## ⚠️ Estado Actual

La configuración de Firebase Hosting está **COMPLETA**. Solo necesitas ejecutar los comandos manualmente.

## ✅ Archivos Configurados

- ✅ `firebase.json` - Configuración de hosting
- ✅ `.firebaserc` - Proyecto: proto-c51d8
- ✅ `package.json` - Scripts de deploy agregados
- ✅ `.gitignore` - Actualizado

## 🚀 Pasos para Deploy (Ejecutar Manualmente)

### 1. Verificar Firebase CLI

Abre una nueva terminal PowerShell/CMD y ejecuta:

```bash
firebase --version
```

**Si no está instalado:**
```bash
npm install -g firebase-tools
```

### 2. Login en Firebase

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte.

### 3. Build de Producción

```bash
npm run build:prod
```

O directamente:
```bash
ng build --configuration production
```

**⏱️ Tiempo estimado:** 2-5 minutos

**✅ Verificar:** Debería crear la carpeta `dist/fuse/` con los archivos compilados.

### 4. Deploy a Firebase

```bash
firebase deploy --only hosting
```

**⏱️ Tiempo estimado:** 1-2 minutos

**✅ Resultado esperado:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/proto-c51d8/overview
Hosting URL: https://proto-c51d8.web.app
```

## 🎯 Comando Todo-en-Uno

Si prefieres hacer todo en un comando:

```bash
npm run deploy
```

Este comando ejecuta:
1. `ng build --configuration production`
2. `firebase deploy --only hosting`

## 📱 Testing Antes del Deploy (Opcional)

Para probar el build localmente:

```bash
# Build de producción
npm run build:prod

# Servir localmente con Firebase
firebase serve
```

Luego abre: http://localhost:5000

## 🔍 Verificar el Deploy

### Ver en Firebase Console

1. Ve a: https://console.firebase.google.com/project/proto-c51d8
2. Click en "Hosting" en el menú lateral
3. Verás el historial de deploys

### Probar la Aplicación

Abre en tu navegador:
- https://proto-c51d8.web.app
- https://proto-c51d8.firebaseapp.com

## ⚙️ Scripts Disponibles

```bash
# Build de producción solamente
npm run build:prod

# Build + Deploy completo
npm run deploy

# Deploy a canal preview (testing)
npm run deploy:preview

# Servir build localmente
npm run firebase:serve
```

## 🐛 Solución de Problemas

### Problema: "No se encuentra firebase"

**Solución:**
```bash
npm install -g firebase-tools
```

### Problema: "Not logged in"

**Solución:**
```bash
firebase login --reauth
```

### Problema: "Build failed"

**Solución 1:** Limpiar cache
```bash
rm -rf .angular/cache
rm -rf node_modules
npm install
```

**Solución 2:** Verificar espacio en disco
```bash
# Debe haber al menos 1GB libre
```

### Problema: "Permission denied"

**Solución:** Ejecuta la terminal como Administrador (Windows)

## 📊 Post-Deploy Checklist

Después del deploy, verifica:

- [ ] La aplicación carga en https://proto-c51d8.web.app
- [ ] El routing funciona (navegar entre páginas)
- [ ] Los assets (imágenes, iconos) cargan correctamente
- [ ] Firebase Authentication funciona
- [ ] Firestore lee/escribe datos correctamente
- [ ] No hay errores en la consola del navegador (F12)

## 🔄 Re-Deploy (Actualizaciones)

Para actualizar la aplicación desplegada:

```bash
# 1. Hacer cambios en el código
# 2. Ejecutar deploy
npm run deploy
```

Firebase mantiene un historial de versiones que puedes ver en la consola.

## 📈 Monitoreo

### Firebase Console

Ve a: https://console.firebase.google.com/project/proto-c51d8

**Hosting Dashboard:**
- Tráfico y bandwidth usage
- Número de requests
- Latencia promedio
- Versiones desplegadas

**Performance Monitoring:**
- Tiempo de carga de la app
- Network requests performance
- Firebase services performance

## 🌐 Configurar Dominio Personalizado (Opcional)

1. Ve a Firebase Console > Hosting
2. Click en "Add custom domain"
3. Sigue las instrucciones para configurar DNS
4. Firebase provee SSL gratuito automáticamente

## 💡 Tips

1. **Desarrollo rápido:** Usa `ng serve` para desarrollo local
2. **Testing:** Usa `npm run deploy:preview` para probar antes de producción
3. **Rollback:** Puedes revertir a versiones anteriores desde Firebase Console
4. **Cache:** Los archivos están configurados para cache de 1 año (con hash)
5. **Performance:** El build de producción es ~70% más pequeño que desarrollo

## 📚 Documentación Completa

Para más detalles, lee: [DEPLOY.md](DEPLOY.md)

---

**¿Necesitas ayuda?**
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Angular Deploy: https://angular.io/guide/deployment
- Firebase CLI: https://firebase.google.com/docs/cli

## 🎉 ¡Listo!

Tu proyecto está **100% configurado** para Firebase Hosting.

Solo ejecuta:
```bash
npm run deploy
```

Y tu aplicación estará en línea en: **https://proto-c51d8.web.app**
