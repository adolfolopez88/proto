# Fix: Production Error - addEventListener undefined

## 🔴 Error
```
High severity error: Cannot read properties of undefined (reading 'addEventListener')
```

## 🎯 Causas Comunes

1. **Optimización agresiva del build** - Angular minifica y optimiza el código, causando que referencias al DOM se pierdan
2. **Acceso temprano al DOM** - Código ejecutándose antes de que el DOM esté listo
3. **Missing polyfills** - Navegadores antiguos sin soporte para addEventListener
4. **Firebase Messaging** - Problemas con service workers o VAPID keys

## ✅ Soluciones

### Solución 1: Deshabilitar Optimización Temporalmente (Testing)

Edita `angular.json`, en la configuración de producción:

```json
"production": {
    "optimization": false,  // Cambiar de true a false
    "buildOptimizer": false,  // Agregar esta línea
    "budgets": [...],
    "fileReplacements": [...],
    "outputHashing": "all"
}
```

**Rebuild:**
```bash
npm run build:prod
```

Si esto soluciona el error, el problema es la optimización.

### Solución 2: Agregar Verificación de DOM

Edita `src/main.ts`:

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'environments/environment';
import { AppModule } from 'app/app.module';

if (environment.production) {
    enableProdMode();
}

// Esperar a que el DOM esté listo
const bootstrap = () => platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));

// Asegurar que el document existe
if (typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        bootstrap();
    } else {
        document.addEventListener('DOMContentLoaded', bootstrap);
    }
} else {
    bootstrap();
}
```

### Solución 3: Actualizar angular.json - Build Optimizado

Reemplaza la configuración de producción en `angular.json`:

```json
"production": {
    "budgets": [
        {
            "type": "initial",
            "maximumWarning": "3mb",
            "maximumError": "5mb"
        },
        {
            "type": "anyComponentStyle",
            "maximumWarning": "75kb",
            "maximumError": "90kb"
        }
    ],
    "fileReplacements": [
        {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.prod.ts"
        }
    ],
    "outputHashing": "all",
    "optimization": {
        "scripts": true,
        "styles": true,
        "fonts": true
    },
    "buildOptimizer": true,
    "sourceMap": false,
    "namedChunks": false,
    "aot": true,
    "extractLicenses": true,
    "vendorChunk": false,
    "commonChunk": false
}
```

### Solución 4: Polyfills Adicionales

Edita `src/polyfills.ts`, agregar al final:

```typescript
/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Polyfill para addEventListener si no existe
if (typeof window !== 'undefined' && !window.addEventListener) {
    (window as any).addEventListener = function() {};
    (window as any).removeEventListener = function() {};
}

if (typeof document !== 'undefined' && !document.addEventListener) {
    (document as any).addEventListener = function() {};
    (document as any).removeEventListener = function() {};
}
```

### Solución 5: Desactivar Firebase Messaging (Temporal)

Si el error está relacionado con Firebase Messaging:

**Opción A: Comentar imports de messaging**

Busca en tu código imports de Firebase Messaging y coméntalos temporalmente.

**Opción B: Verificar Service Worker**

Verifica que `firebase-messaging-sw.js` existe y está correctamente configurado.

## 🔧 Fix Completo Recomendado

### Paso 1: Actualizar main.ts

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'environments/environment';
import { AppModule } from 'app/app.module';

if (environment.production) {
    enableProdMode();
}

// Error handler global
const handleBootstrapError = (err: any) => {
    console.error('Bootstrap error:', err);
    // Mostrar mensaje de error al usuario
    if (typeof document !== 'undefined') {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="padding: 20px; background: #f44336; color: white; text-align: center;">
                <h2>Error al cargar la aplicación</h2>
                <p>Por favor, recarga la página. Si el problema persiste, limpia el cache del navegador.</p>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
};

// Bootstrap function
const bootstrap = () => {
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch(handleBootstrapError);
};

// Asegurar que el DOM está listo
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
} else {
    bootstrap();
}
```

### Paso 2: Actualizar polyfills.ts

```typescript
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Verificar que window y document existen
if (typeof window === 'undefined') {
    (global as any).window = {};
}

if (typeof document === 'undefined') {
    (global as any).document = {
        addEventListener: () => {},
        removeEventListener: () => {},
        createElement: () => ({}),
        querySelector: () => null,
        querySelectorAll: () => []
    };
}

// Polyfill para navegadores muy antiguos
if (typeof window !== 'undefined') {
    if (!window.addEventListener) {
        (window as any).addEventListener = function() {};
    }
    if (!window.removeEventListener) {
        (window as any).removeEventListener = function() {};
    }
}

if (typeof document !== 'undefined') {
    if (!document.addEventListener) {
        (document as any).addEventListener = function() {};
    }
    if (!document.removeEventListener) {
        (document as any).removeEventListener = function() {};
    }
}
```

### Paso 3: Actualizar angular.json (Optimización Segura)

En la configuración de producción:

```json
"production": {
    "budgets": [
        {
            "type": "initial",
            "maximumWarning": "3mb",
            "maximumError": "5mb"
        },
        {
            "type": "anyComponentStyle",
            "maximumWarning": "75kb",
            "maximumError": "90kb"
        }
    ],
    "fileReplacements": [
        {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.prod.ts"
        }
    ],
    "outputHashing": "all",
    "optimization": {
        "scripts": true,
        "styles": {
            "minify": true,
            "inlineCritical": true
        },
        "fonts": true
    },
    "buildOptimizer": true,
    "aot": true,
    "extractLicenses": true,
    "sourceMap": false,
    "namedChunks": false
}
```

## 🚀 Rebuild y Deploy

```bash
# Limpiar cache
rm -rf .angular/cache
rm -rf dist

# Build de producción
npm run build:prod

# Verificar que el build completó sin errores
# La carpeta dist/fuse/ debe contener archivos

# Deploy
npm run deploy:do
```

## 🧪 Testing Local del Build de Producción

```bash
# Instalar servidor simple
npm install -g http-server

# Servir el build de producción
cd dist/fuse
http-server -p 8080

# Abrir en browser
# http://localhost:8080
```

Verifica que NO haya errores en la consola del navegador (F12).

## 🔍 Debugging Adicional

### Ver errores completos

Temporalmente habilita source maps en producción:

En `angular.json`:
```json
"production": {
    "sourceMap": true,  // Cambiar de false a true
    ...
}
```

Rebuild y verás el error completo con stack trace.

### Verificar en diferentes navegadores

- Chrome (últimaversión)
- Firefox
- Safari
- Edge

Si solo falla en navegadores antiguos, es un problema de polyfills.

## 📋 Checklist de Solución

- [ ] Actualizar `src/main.ts` con verificación de DOM
- [ ] Actualizar `src/polyfills.ts` con polyfills adicionales
- [ ] Verificar configuración de `angular.json`
- [ ] Limpiar cache: `rm -rf .angular/cache dist`
- [ ] Build de producción: `npm run build:prod`
- [ ] Verificar que no hay errores de build
- [ ] Testing local con `http-server`
- [ ] Verificar en consola del navegador (F12)
- [ ] Deploy: `npm run deploy:do`
- [ ] Verificar en producción

## ⚡ Fix Rápido (Si tienes prisa)

```bash
# 1. Deshabilitar optimización temporalmente
# Editar angular.json: "optimization": false

# 2. Rebuild
rm -rf dist && npm run build:prod

# 3. Deploy
npm run deploy:do

# 4. Verificar que funciona
# http://157.245.226.11

# 5. Luego implementar el fix completo cuando tengas tiempo
```

---

**Recomendación:** Implementa el "Fix Completo Recomendado" para una solución permanente.
