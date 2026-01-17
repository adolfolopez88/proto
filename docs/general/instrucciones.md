
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

### 14. Formulario de registros de usuarios firebase servicio de Authenticacion

- **componente crud**:  Genera formularios, listas y otros elementos que creen, eliminen y actualizen usuarios con el servicio de authenticacion de firebase. de modo que queden el el registro sel sevicio en la nube

### 15. Auth
posicionate dentro de la carpeta de `app/modules/auth` dentro de ella encontraras una serie de componentes relacionados a la Authenticacion y registro de usuarios. todas son rutas publicas. tienes que integrar los servicios de firebase en caga uno de estos componentes de modo que se pueda registrar usuarios, loggearse etc. profundiza y detalla mejor esta instruccion.

### 16 sign-up 

posicionate dentro de la carpeta de `app/modules/auth/sign-up` en su interior encontraras un modulo llamado sign-up usando los servicios ya creados para firebase authentication registra un usuario con perfil cliente. habilita el componente y crea los cambios necesarios manteniendo estilos del template

### 17 Nuevos componentes

-**Tarjetas** crea elementos genericos de tipo card para representar diferentes listas unas como productos, postales, personajes.
-**Genera listas Mock y ejemplos** crea rutas para acceder al diferentes ejemplos de cada una de las listas agregandolas al menu del layout principal


### 18 Firebase Menssaging

- crea un servicio en la ruta `app/core/service/fiebase` para  Firebase Cloud Messaging JS
- Agrega el SDK de Firebase Cloud Messaging JS y, luego, inicializa Firebase Cloud Messaging una vez que se inicialize el app
- resive los mensajes y muestralo en la pagina 
- expande esta instruccion para hacer una funcionalidad util


### 18 Firebase Menssaging

- crea un servicio en la ruta `app/core/service/fiebase` para  Firebase Cloud Messaging JS
- Agrega el SDK de Firebase Cloud Messaging JS y, luego, inicializa Firebase Cloud Messaging una vez que se inicialize el app
- resive los mensajes y muestralo en la pagina 
- expande esta instruccion para hacer una funcionalidad util


### 19 Classy Layout.

- `src/app/layouts/vertical/classy` dentro encontraras una seccion que momienza con el tag <!-- User --> edita los datos del usuario de modo que tome el usuario loggeado con los datos almacenados en firebase. de no tener imagen de avatar por una por defecto con su inicial de nombre.
  
### 20 Mantenedor de prompt 

- `src/modules/admin/` en esta ruta crea un mantenedor de prompt haciendo uso de AngularFirestore y de la configuracion establecida crea un mantenedor que permita eliminar editar, crear y listar los prompt que desee guardar dales categorias y campos que consideres necesarios para la creacion de un buen prompt 
- expande esta instruccion con las funcionalidades adicionales que consideres utiles


### 21 Productos 
- **Producto Detalle** posicionate en la pagina `src/modules/admin/cards/products` y crea para cada tarjeta una vista de detalle
- **extiende y cambia el detalle de cada producto** crea diferentes tipos de agentes ia como productos de ejemplos


### 22 Caracteres 

/desing necesito prompt para crear un componente de un nuevo modulo que llamado caracteres que sera un modelo que pueda almacenar diferentes tipos de personajes cada personaje tendra los siguientes atributos detallados el el siguiente modelo json
el componente debe ser un crud, responsivo que tenga una lista paaginada de componentes tipo cards con un resumen del personaje que atravez de un  boton en la card podra llamar a una vista de detalle. Para el Crud usar el servicio AngularFirestore para almacenar, editar, eliminar y listar documentos

``` json

{
  "id": "string",
  "nombre": "string",
  "tipo": "persona | objeto | criatura | entidad",
  "descripcion": "string",
  "usuario_id": "string | null",
  "activo": true,
  "fecha_creacion": "2025-01-15T10:30:00Z",
  "fecha_actualizacion": "2025-01-15T10:30:00Z",
  
  "atributos_persona": {
    "edad": 25,
    "genero": "masculino | femenino | no_binario | otro",
    "ocupacion": "string",
    "personalidad": [
      "extrovertido",
      "creativo", 
      "analítico"
    ],
    "habilidades": [
      "programación",
      "liderazgo",
      "comunicación"
    ],
    "apariencia": {
      "altura": "1.75m",
      "color_cabello": "castaño",
      "color_ojos": "marrones",
      "complexion": "atlética"
    },
    "trasfondo": "Historia personal del personaje",
    "relaciones": [
      {
        "tipo": "familia | amigo | colega | pareja",
        "nombre": "string",
        "descripcion": "string"
      }
    ]
  },

  "atributos_objeto": {
    "categoria": "herramienta | vehículo | edificio | arma | mágico | tecnológico",
    "material": "string",
    "tamaño": "pequeño | mediano | grande | gigante",
    "peso": "2.5kg",
    "color_principal": "string",
    "estado": "nuevo | usado | dañado | roto | mágico",
    "funcionalidad": [
      "transportar",
      "atacar",
      "defender"
    ],
    "origen": "string",
    "valor_estimado": 1500.50,
    "propiedades_especiales": [
      {
        "nombre": "resistencia al fuego",
        "descripcion": "No se ve afectado por temperaturas altas",
        "nivel": "alto | medio | bajo"
      }
    ]
  },

  "capacidades_interpretacion": {
    "personalidad_base": {
      "temperamento": "calmado | agresivo | nervioso | alegre",
      "forma_hablar": "formal | casual | técnico | poético",
      "motivaciones": [
        "proteger a otros",
        "buscar conocimiento",
        "obtener poder"
      ],
      "miedos": ["alturas", "oscuridad"],
      "deseos": ["libertad", "reconocimiento"]
    },
    "comportamientos": {
      "en_combate": "string",
      "en_dialogo": "string", 
      "en_exploracion": "string",
      "reacciones_emocionales": {
        "alegría": "string",
        "tristeza": "string",
        "ira": "string",
        "miedo": "string"
      }
    },
    "frases_caracteristicas": [
      "¡Por la gloria del reino!",
      "Esto me recuerda a cuando..."
    ],
    "gestos_distintivos": [
      "se toca la barbilla al pensar",
      "tamborilea los dedos cuando está nervioso"
    ]
  },

  "estadisticas": {
    "nivel": 1,
    "experiencia": 0,
    "atributos_numericos": {
      "fuerza": 10,
      "destreza": 12,
      "inteligencia": 15,
      "carisma": 8,
      "resistencia": 11,
      "percepcion": 13
    }
  },

  "inventario": [
    {
      "objeto_id": "string",
      "nombre": "Espada de plata",
      "cantidad": 1,
      "equipado": true
    }
  ],

  "configuracion": {
    "visible_para_otros": true,
    "permite_interaccion": true,
    "nivel_detalle_respuestas": "alto | medio | bajo",
    "idioma_preferido": "es",
    "contexto_activo": "fantasy | modern | sci-fi | historical"
  },
  {
  "id": "string",
  "nombre": "string",
  "tipo": "persona | objeto | criatura | entidad",
  "descripcion": "string",
  "usuario_id": "string | null",
  "activo": true,
  "fecha_creacion": "2025-01-15T10:30:00Z",
  "fecha_actualizacion": "2025-01-15T10:30:00Z",
  
  "atributos_persona": {
    "edad": 25,
    "genero": "masculino | femenino | no_binario | otro",
    "ocupacion": "string",
    "personalidad": [
      "extrovertido",
      "creativo", 
      "analítico"
    ],
    "habilidades": [
      "programación",
      "liderazgo",
      "comunicación"
    ],
    "apariencia": {
      "altura": "1.75m",
      "color_cabello": "castaño",
      "color_ojos": "marrones",
      "complexion": "atlética"
    },
    "trasfondo": "Historia personal del personaje",
    "relaciones": [
      {
        "tipo": "familia | amigo | colega | pareja",
        "nombre": "string",
        "descripcion": "string"
      }
    ]
  },

  "atributos_objeto": {
    "categoria": "herramienta | vehículo | edificio | arma | mágico | tecnológico",
    "material": "string",
    "tamaño": "pequeño | mediano | grande | gigante",
    "peso": "2.5kg",
    "color_principal": "string",
    "estado": "nuevo | usado | dañado | roto | mágico",
    "funcionalidad": [
      "transportar",
      "atacar",
      "defender"
    ],
    "origen": "string",
    "valor_estimado": 1500.50,
    "propiedades_especiales": [
      {
        "nombre": "resistencia al fuego",
        "descripcion": "No se ve afectado por temperaturas altas",
        "nivel": "alto | medio | bajo"
      }
    ]
  },

  "capacidades_interpretacion": {
    "personalidad_base": {
      "temperamento": "calmado | agresivo | nervioso | alegre",
      "forma_hablar": "formal | casual | técnico | poético",
      "motivaciones": [
        "proteger a otros",
        "buscar conocimiento",
        "obtener poder"
      ],
      "miedos": ["alturas", "oscuridad"],
      "deseos": ["libertad", "reconocimiento"]
    },
    "comportamientos": {
      "en_combate": "string",
      "en_dialogo": "string", 
      "en_exploracion": "string",
      "reacciones_emocionales": {
        "alegría": "string",
        "tristeza": "string",
        "ira": "string",
        "miedo": "string"
      }
    },
    "frases_caracteristicas": [
      "¡Por la gloria del reino!",
      "Esto me recuerda a cuando..."
    ],
    "gestos_distintivos": [
      "se toca la barbilla al pensar",
      "tamborilea los dedos cuando está nervioso"
    ]
  },

  "estadisticas": {
    "nivel": 1,
    "experiencia": 0,
    "atributos_numericos": {
      "fuerza": 10,
      "destreza": 12,
      "inteligencia": 15,
      "carisma": 8,
      "resistencia": 11,
      "percepcion": 13
    }
  },

  "inventario": [
    {
      "objeto_id": "string",
      "nombre": "Espada de plata",
      "cantidad": 1,
      "equipado": true
    }
  ],

  "configuracion": {
    "visible_para_otros": true,
    "permite_interaccion": true,
    "nivel_detalle_respuestas": "alto | medio | bajo",
    "idioma_preferido": "es",
    "contexto_activo": "fantasy | modern | sci-fi | historical"
  },

  "imagenes": {
    "avatar_principal": {
      "url": "https://ejemplo.com/imagenes/characters/char123/avatar.jpg",
      "alt_text": "Retrato principal del personaje",
      "tipo": "avatar | portrait | full_body | action | concept_art",
      "dimension": "512x512",
      "formato": "jpg | png | webp | svg",
      "tamaño_bytes": 245760,
      "fecha_subida": "2025-01-15T10:30:00Z",
      "es_principal": true,
      "activa": true
    },
    "galeria": [
      {
        "id": "img_001",
        "url": "https://ejemplo.com/imagenes/characters/char123/portrait_1.jpg",
        "alt_text": "Vista frontal del personaje en pose heroica",
        "tipo": "portrait",
        "dimension": "1024x1024",
        "formato": "jpg",
        "tamaño_bytes": 512000,
        "fecha_subida": "2025-01-15T10:30:00Z",
        "tags": ["heroico", "frontal", "oficial"],
        "contexto": "Para usar en diálogos principales",
        "orden": 1,
        "activa": true,
        "calidad": "alta | media | baja",
        "generada_por_ia": false,
        "autor": "usuario | ia | artista_externo",
        "licencia": "libre | restringida | comercial"
      },
      {
        "id": "img_002", 
        "url": "https://ejemplo.com/imagenes/characters/char123/full_body.png",
        "alt_text": "Imagen de cuerpo completo mostrando equipamiento",
        "tipo": "full_body",
        "dimension": "768x1024",
        "formato": "png",
        "tamaño_bytes": 820000,
        "fecha_subida": "2025-01-14T15:20:00Z",
        "tags": ["cuerpo_completo", "equipamiento", "referencia"],
        "contexto": "Para mostrar en inventario y estadísticas",
        "orden": 2,
        "activa": true,
        "calidad": "alta",
        "generada_por_ia": true,
        "autor": "ia",
        "licencia": "libre"
      },
      {
        "id": "img_003",
        "url": "https://ejemplo.com/imagenes/characters/char123/action_scene.jpg", 
        "alt_text": "Personaje en escena de acción luchando",
        "tipo": "action",
        "dimension": "1920x1080",
        "formato": "jpg",
        "tamaño_bytes": 1024000,
        "fecha_subida": "2025-01-13T09:45:00Z",
        "tags": ["acción", "combate", "dinámico"],
        "contexto": "Para escenas de combate o momentos épicos",
        "orden": 3,
        "activa": true,
        "calidad": "alta",
        "generada_por_ia": false,
        "autor": "usuario",
        "licencia": "restringida"
      }
    ],
    "configuracion_imagenes": {
      "permitir_subida_usuario": true,
      "formatos_permitidos": ["jpg", "jpeg", "png", "webp"],
      "tamaño_maximo_mb": 5,
      "dimension_minima": "256x256",
      "dimension_maxima": "4096x4096",
      "moderacion_automatica": true,
      "marca_agua": false,
      "compresion_automatica": true,
      "generar_miniaturas": true,
      "miniaturas_tamaños": ["64x64", "128x128", "256x256"]
    }
  },

  "metadatos": {
    "version": "1.0",
    "tags": ["protagonista", "mago", "noble"],
    "popularidad": 0,
    "usos_totales": 0,
    "valoracion_promedio": 0.0
  }
}
```