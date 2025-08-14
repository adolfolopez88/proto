# Documentación del Proyecto

Este directorio contiene toda la documentación técnica del proyecto, organizando cada evolutivo implementado para facilitar el mantenimiento y el desarrollo futuro.

## 📁 Estructura de Documentación

```
doc/
├── README.md                   # Este archivo
├── arquitectura/               # Documentación de arquitectura
├── servicios/                  # Documentación de servicios
├── componentes/                # Documentación de componentes
├── guards-interceptors/        # Documentación de guards e interceptors
├── utils/                      # Documentación de utilidades
└── guias/                      # Guías de uso y desarrollo
```

## 📋 Índice de Documentación

### 1. [Arquitectura Base](./arquitectura/)
- Patrones de diseño implementados
- Estructura de módulos
- Configuración de Firebase

### 2. [Servicios Firebase](./servicios/)
- AuthService
- BaseRepositoryService
- FirestoreService
- StorageService

### 3. [Componentes Genéricos](./componentes/)
- GenericTable
- GenericForm
- Configuración y uso

### 4. [Guards e Interceptors](./guards-interceptors/)
- RoleGuard
- AuthInterceptor
- ErrorInterceptor
- LoadingInterceptor

### 5. [Servicios Utilitarios](./utils/)
- ValidationService
- UtilsService
- ErrorHandlerService

### 6. [Guías de Uso](./guias/)
- Guía de desarrollo
- Mejores prácticas
- Configuración del entorno

## 🚀 Cómo usar esta documentación

1. **Desarrolladores nuevos**: Comenzar con [Arquitectura Base](./arquitectura/) y luego [Guías de Uso](./guias/)
2. **Implementación de features**: Consultar [Servicios](./servicios/) y [Componentes](./componentes/)
3. **Mantenimiento**: Revisar documentación específica del área a mantener
4. **Troubleshooting**: Consultar [Guards e Interceptors](./guards-interceptors/) y [Utils](./utils/)

## 📝 Convenciones de Documentación

- Cada evolutivo está documentado con ejemplos prácticos
- Se incluyen diagramas cuando es necesario
- Código de ejemplo funcional
- Enlaces a recursos externos relevantes
- Notas de versionado y cambios

## 🔄 Mantenimiento de la Documentación

Esta documentación se actualiza con cada nuevo evolutivo. Cada nueva funcionalidad debe incluir:
- Documentación técnica correspondiente
- Ejemplos de uso
- Notas de breaking changes si aplican
- Tests relacionados

---
*Última actualización: Agosto 2025*