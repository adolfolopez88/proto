
# Problemática

Esta será una aplicación que usará la infraestructura de Firebase. Usaremos este template para generar componentes útiles para cada una de las futuras características del software. Usarás los patrones de diseño necesarios para mantener una aplicación escalable y fácil de entender, generando componentes genéricos que podamos reutilizar.

## Instrucciones de Desarrollo

### 1. Arquitectura y Patrones de Diseño

- **Implementar patrón Repository**: Crear servicios abstractos para las operaciones CRUD de Firebase
- **Usar patrón Observer**: Aprovechar los Observables de Angular para datos en tiempo real
- **Aplicar patrón Strategy**: Para diferentes tipos de autenticación (email, Google, Facebook)
- **Implementar patrón Factory**: Para la creación de diferentes tipos de documentos/entidades
- **Usar patrón Singleton**: Para servicios de configuración y estado global

### 2. Estructura de Servicios Firebase

- **AuthService**: Gestión de autenticación con Firebase Auth
- **FirestoreService**: Servicio genérico para operaciones CRUD en Firestore
- **StorageService**: Manejo de archivos con Firebase Storage
- **RealtimeService**: Sincronización en tiempo real con Firestore
- **NotificationService**: Push notifications con Firebase Messaging

### 3. Componentes Genéricos a Desarrollar

#### Componentes de Datos
- **GenericTable**: Tabla reutilizable con paginación, filtros y ordenamiento
- **GenericForm**: Formulario dinámico basado en configuración JSON
- **GenericList**: Lista genérica con lazy loading y búsqueda
- **DataExporter**: Componente para exportar datos (PDF, Excel, CSV)

#### Componentes de UI
- **ConfirmDialog**: Diálogos de confirmación consistentes
- **FileUploader**: Subida de archivos con drag & drop
- **ImageCropper**: Recorte de imágenes antes de subir
- **DateRangePicker**: Selector de rangos de fechas
- **StatusIndicator**: Indicadores de estado visual

#### Componentes de Navegación
- **Breadcrumb**: Navegación jerárquica
- **Stepper**: Procesos paso a paso
- **TabManager**: Gestión dinámica de pestañas

### 4. Servicios Utilitarios

- **ValidationService**: Validaciones personalizadas para formularios
- **UtilsService**: Funciones auxiliares comunes
- **ConfigService**: Gestión de configuración de la aplicación
- **ErrorHandlerService**: Manejo centralizado de errores
- **LoadingService**: Estados de carga globales
- **CacheService**: Cache inteligente para optimización

### 5. Directivas Personalizadas

- **LazyLoad**: Carga perezosa de imágenes
- **AutoFocus**: Enfoque automático de elementos
- **ClickOutside**: Detectar clics fuera de elementos
- **Permissions**: Control de permisos en templates
- **Tooltip**: Tooltips personalizados

### 6. Pipes Personalizados

- **SafeHtml**: Renderizado seguro de HTML
- **TimeAgo**: Formato de tiempo relativo
- **FileSize**: Formateo de tamaños de archivo
- **Currency**: Formateo de moneda local
- **Phone**: Formateo de números telefónicos

### 7. Guards y Resolvers

- **RoleGuard**: Control de acceso basado en roles
- **DataResolver**: Pre-carga de datos para rutas
- **UnsavedChangesGuard**: Protección contra pérdida de cambios
- **PermissionGuard**: Control granular de permisos

### 8. Interceptors

- **AuthInterceptor**: Inyección automática de tokens
- **ErrorInterceptor**: Manejo global de errores HTTP
- **LoadingInterceptor**: Estados de carga automáticos
- **CacheInterceptor**: Cache de respuestas HTTP

### 9. Modelos y Interfaces

- **BaseEntity**: Interface base para todas las entidades
- **User**: Modelo de usuario con roles y permisos
- **ApiResponse**: Tipado de respuestas de API
- **FilterOptions**: Opciones de filtrado genéricas
- **PaginationOptions**: Configuración de paginación

### 10. Configuración y Setup

- **Environment**: Configuración por ambiente (dev, staging, prod)
- **Firebase Config**: Configuración centralizada de Firebase
- **App Constants**: Constantes de la aplicación
- **Theme Config**: Configuración de temas dinámicos

### 11. Testing Strategy

- **Unit Tests**: Para todos los servicios y componentes
- **Integration Tests**: Para flujos completos
- **E2E Tests**: Para casos de uso críticos
- **Mock Services**: Servicios mock para testing

### 12. Performance y Optimización

- **Lazy Loading**: Carga perezosa de módulos
- **OnPush Strategy**: Estrategia de detección de cambios optimizada
- **TrackBy Functions**: Optimización de *ngFor
- **Bundle Optimization**: Análisis y optimización de bundles


### 13. Documentacion

- **Direcctorio de documentacion**: crea un directorio en la raiz llamado doc
- **Documenta cada evolutivo**: documentacion adecuada para cada paso