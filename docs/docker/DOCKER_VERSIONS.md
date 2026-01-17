# Versiones de Docker Build

## Configuración Actual

### Node.js y npm
- **Node.js**: 18 LTS (alpine)
- **npm**: 11.5.1 (actualizado explícitamente)

### ¿Por qué estos cambios?

#### Node.js 18 en lugar de 16
- ✅ Node 16 llegó a EOL (End of Life) en septiembre 2023
- ✅ Node 18 es LTS hasta abril 2025
- ✅ Mejor rendimiento y características modernas
- ✅ Compatible con Angular 14

#### npm 11.5.1
- ✅ Versión más reciente y estable
- ✅ Mejoras de rendimiento
- ✅ Mejor manejo de dependencias
- ✅ Compatibilidad mejorada

## Verificación de Versiones

Durante el build, verás:
```
Step X: RUN node --version && npm --version
v18.x.x
11.5.1
```

## Comandos de Build Actualizados

### Dockerfile Changes
```dockerfile
# ANTES
FROM node:16-alpine
RUN npm install
RUN npm run build

# AHORA
FROM node:18-alpine
RUN npm install -g npm@11.5.1
RUN npm install --legacy-peer-deps
RUN npm run build:prod
```

### Flag `--legacy-peer-deps`
**¿Por qué se usa?**
- Angular 14 tiene dependencias con peer dependencies conflictivas
- npm 7+ es más estricto con peer dependencies
- `--legacy-peer-deps` usa el comportamiento de npm 6 (más permisivo)
- Necesario para evitar errores como: `ERESOLVE unable to resolve dependency tree`

## Build y Deploy

### Build Local (Testing)
```bash
docker build -t fuse-app:latest .
```

### Build y Deploy Completo
```powershell
.\deploy-docker-simple.ps1
```

## Actualizar Versiones en el Futuro

### Actualizar npm
```dockerfile
# En Dockerfile, línea 14:
RUN npm install -g npm@X.X.X
```

### Actualizar Node.js
```dockerfile
# En Dockerfile, línea 7:
FROM node:XX-alpine AS builder
```

**Versiones recomendadas:**
- Node 18 LTS: Hasta abril 2025
- Node 20 LTS: Hasta abril 2026
- Node 22: Siguiente LTS (octubre 2024)

## Compatibilidad

### Angular 14 Requirements
- ✅ Node.js: 14.20.x, 16.14.x o 18.10.x
- ✅ npm: 6.x, 7.x, 8.x, o superior
- ✅ Nuestra config: Node 18 + npm 11.5.1 ✅

### Paquetes Alpine
**¿Por qué `alpine`?**
- Imagen mucho más pequeña (~150MB vs ~1GB)
- Menos superficie de ataque (seguridad)
- Builds más rápidos
- Suficiente para builds de producción

## Troubleshooting

### Error: "npm WARN old lockfile"
**Solución:** Regenerar package-lock.json
```bash
rm package-lock.json
npm install --legacy-peer-deps
```

### Error: "ERESOLVE unable to resolve"
**Solución:** Ya incluida con `--legacy-peer-deps`

### Error: "node-sass" o "node-gyp"
**Solución:** Usar `sass` en lugar de `node-sass` (ya debería estar en package.json)

### Build muy lento
**Normal en primera ejecución:**
- Primera vez: 10-15 minutos
- Subsecuentes: 5-7 minutos (Docker cache)

## Logs de Build

Durante el build verás estas etapas:

```
[Stage 1: Builder]
Step 1/12 : FROM node:18-alpine
Step 2/12 : RUN npm install -g npm@11.5.1
  → Descarga e instala npm 11.5.1
Step 3/12 : RUN node --version && npm --version
  → v18.x.x
  → 11.5.1
Step 4/12 : WORKDIR /app
Step 5/12 : COPY package*.json ./
Step 6/12 : COPY . .
Step 7/12 : RUN npm install --legacy-peer-deps
  → Instala 800+ paquetes (~3-5 min)
Step 8/12 : RUN npm run build:prod
  → Build de Angular (~5-8 min)

[Stage 2: Nginx]
Step 9/12 : FROM nginx:alpine
Step 10/12 : COPY --from=builder /app/dist/fuse
  → Copia archivos compilados
Step 11/12 : COPY nginx.conf
Step 12/12 : EXPOSE 80

Successfully built [image-id]
```

## Optimizaciones Implementadas

1. **Multi-stage build**:
   - Stage 1: Build (con Node.js y npm)
   - Stage 2: Runtime (solo Nginx + archivos estáticos)
   - Resultado: Imagen final ~50MB vs ~500MB

2. **Layer caching**:
   - COPY package*.json ANTES de COPY .
   - Permite reusar cache de npm install si solo cambió código

3. **Alpine Linux**:
   - Base mínima
   - Menos vulnerabilidades
   - Menor tamaño

## Verificar Versiones en Contenedor

### Durante el build
```bash
docker build -t fuse-app:latest .
# Verás las versiones en Step 3/12
```

### En contenedor corriendo (stage builder)
```bash
# No se puede, el stage builder se descarta
# Solo queda el stage nginx con los archivos estáticos
```

### Ver imagen final
```bash
docker images fuse-app:latest
# Verás el tamaño (~50-60MB)
```

## Referencias

- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [npm Changelog](https://github.com/npm/cli/releases)
- [Angular 14 Requirements](https://angular.io/guide/versions)
- [Docker Node Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
