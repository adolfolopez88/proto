# Dockerfile para Angular Fuse App
# Multi-stage build para optimizar tamaño de imagen

# ============================================
# Stage 1: Build de la aplicación Angular
# ============================================
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="fuse-app"
LABEL description="Angular Fuse Admin Template"

# Actualizar npm a versión 11.5.1
RUN npm install -g npm@11.5.1

# Verificar versiones
RUN node --version && npm --version

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar código fuente
COPY . .

# Instalar dependencias (necesarias para build)
RUN npm install --legacy-peer-deps

# Build de producción
RUN npm run build:prod

# ============================================
# Stage 2: Servidor Nginx para archivos estáticos
# ============================================
FROM nginx:alpine

# Copiar archivos de build desde stage anterior
COPY --from=builder /app/dist/fuse /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80 (interno del contenedor)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
