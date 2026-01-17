# Deploy a Firebase Hosting

Esta guía explica cómo hacer deploy de la aplicación Fuse Angular en Firebase Hosting.

## ✅ Configuración Completada

Los siguientes archivos de configuración ya están creados:

- **firebase.json** - Configuración de hosting con:
  - Public directory: `dist/fuse`
  - SPA rewrites para Angular routing
  - Headers de caché optimizados

- **.firebaserc** - Proyecto Firebase configurado: `proto-c51d8`

- **.gitignore** - Actualizado con archivos de Firebase

## 📋 Requisitos Previos

### 1. Instalar Firebase CLI (si no está instalado)

```bash
npm install -g firebase-tools
```

Verificar instalación:
```bash
firebase --version
```

### 2. Login en Firebase

```bash
firebase login
```

Esto abrirá una ventana del navegador para autenticarte con tu cuenta de Google.

## 🚀 Proceso de Deploy

### Opción 1: Deploy Completo (Recomendado)

```bash
# 1. Build de producción
npm run build

# 2. Deploy a Firebase Hosting
firebase deploy --only hosting
```

### Opción 2: Deploy con un solo comando

Puedes agregar un script en `package.json`:

```json
"scripts": {
  "deploy": "ng build --configuration production && firebase deploy --only hosting",
  "deploy:preview": "ng build --configuration production && firebase hosting:channel:deploy preview"
}
```

Luego ejecutar:
```bash
npm run deploy
```

## 🌐 URLs de la Aplicación

Después del deploy, tu aplicación estará disponible en:

- **URL Principal**: https://proto-c51d8.web.app
- **URL Alternativa**: https://proto-c51d8.firebaseapp.com

## 📦 Contenido del Build

El comando `ng build --configuration production` genera:

- **Ubicación**: `dist/fuse/`
- **Optimizaciones aplicadas**:
  - Minificación de JavaScript y CSS
  - Tree-shaking (eliminación de código no usado)
  - Ahead-of-Time (AOT) compilation
  - Hashing de archivos para cache busting
  - Lazy loading de módulos

## 🔧 Configuración Avanzada

### Deploy Preview (Testing)

Para crear un canal de preview antes del deploy principal:

```bash
firebase hosting:channel:deploy preview
```

Esto crea una URL temporal para testing sin afectar la producción.

### Rollback a Versión Anterior

Si necesitas volver a una versión anterior:

```bash
# Ver historial de deploys
firebase hosting:clone

# Restaurar versión específica desde la consola de Firebase
```

### Variables de Entorno

Para diferentes entornos, usa archivos de configuración Angular:

- `environment.ts` - Desarrollo
- `environment.prod.ts` - Producción

Firebase automáticamente usa `environment.prod.ts` en builds de producción.

## 🛡️ Security Headers

El archivo `firebase.json` incluye headers de seguridad optimizados:

- Cache de imágenes: 1 año
- Cache de JS/CSS: 1 año (con hash para cache busting)
- SPA rewrites para Angular routing

## 📊 Monitoreo Post-Deploy

### 1. Performance Monitoring

En la consola de Firebase, activa Performance Monitoring:
- Tiempo de carga
- Métricas de red
- Rendimiento de Firebase services

### 2. Analytics

Firebase Analytics ya está configurado en `firebase.config.ts`:
```typescript
measurementId: "G-E53VHXMSPP"
```

### 3. Hosting Metrics

En Firebase Console > Hosting:
- Tráfico y bandwidth
- Requests por segundo
- Latencia de respuesta

## ⚙️ Comandos Útiles

```bash
# Build de producción local
ng build --configuration production

# Servir build localmente para testing
firebase serve

# Deploy solo hosting
firebase deploy --only hosting

# Ver logs de deploy
firebase hosting:channel:list

# Eliminar canal de preview
firebase hosting:channel:delete preview
```

## 🐛 Troubleshooting

### Error: "No Firebase project found"

```bash
firebase use proto-c51d8
```

### Error: "Build failed"

1. Limpiar cache de Angular:
```bash
rm -rf .angular/cache
```

2. Reinstalar dependencias:
```bash
rm -rf node_modules
npm install
```

3. Build nuevamente:
```bash
ng build --configuration production
```

### Error: "Permission denied"

Verifica que estés logueado en Firebase:
```bash
firebase login --reauth
```

### Warning: "Budget exceeded"

Si el build supera los límites de tamaño definidos en `angular.json`:

1. Analizar bundle:
```bash
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/fuse/stats.json
```

2. Optimizar:
   - Lazy load más módulos
   - Eliminar dependencias no usadas
   - Comprimir assets

## 🔄 CI/CD Automático (Opcional)

### GitHub Actions

Crear `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: proto-c51d8
```

## 📝 Checklist Pre-Deploy

- [ ] Tests pasando: `npm test`
- [ ] Lint sin errores: `npm run lint`
- [ ] Build de producción exitoso: `ng build --configuration production`
- [ ] Verificar Firebase login: `firebase login`
- [ ] Probar localmente: `firebase serve`
- [ ] Backup de base de datos (si aplica)
- [ ] Verificar variables de entorno en `environment.prod.ts`
- [ ] Comprobar que firebase.json apunta a `dist/fuse`

## 🎯 Próximos Pasos

1. Configurar dominio personalizado en Firebase Console
2. Habilitar SSL (automático en Firebase)
3. Configurar Firebase Performance Monitoring
4. Setup de CI/CD pipeline
5. Configurar alertas de error en Cloud Functions (si aplica)

## 📚 Recursos

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Angular Production Build](https://angular.io/guide/deployment)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Proyecto**: proto-c51d8
**Framework**: Angular 14
**Hosting**: Firebase Hosting
**Build Output**: dist/fuse/
