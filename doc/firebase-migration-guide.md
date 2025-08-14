# Firebase Migration Guide - Mock to Real Services

## Descripción General

Esta guía detalla cómo migrar de los servicios mock de Firebase a los servicios reales de Firebase en la aplicación Fuse Angular.

## Arquitectura Implementada

### Patrón Factory

Se implementó un patrón Factory que permite intercambiar entre servicios mock y reales sin cambiar el código de los componentes.

```
FirebaseFactoryService
├── AuthService (Mock)
├── AuthFirebaseService (Real)
├── UserService (Mock)
└── UserFirebaseService (Real)
```

### Servicios Creados

#### 1. FirebaseRealService
**Archivo:** `src/app/core/services/firebase/firebase-real.service.ts`

Servicio base que encapsula todas las operaciones con Firebase:
- Autenticación (signIn, signUp, signOut, Google Auth)
- Firestore CRUD operations
- Real-time subscriptions
- Error handling

#### 2. AuthFirebaseService
**Archivo:** `src/app/core/services/firebase/auth-firebase.service.ts`

Servicio de autenticación usando Firebase Auth real:
- Login con email/password
- Registro con validaciones
- Autenticación con Google
- Gestión de estado de usuario
- Manejo de errores Firebase

#### 3. UserFirebaseService
**Archivo:** `src/app/core/services/firebase/user-firebase.service.ts`

Servicio de gestión de usuarios usando Firestore:
- CRUD de usuarios
- Consultas filtradas
- Estadísticas
- Subscripciones en tiempo real

#### 4. FirebaseConfigService
**Archivo:** `src/app/core/services/firebase/firebase-config.service.ts`

Servicio de configuración para controlar qué servicios usar:
```typescript
interface FirebaseAppConfig {
    useMockServices: boolean;
    useEmulators: boolean;
    emulatorConfig?: EmulatorConfig;
}
```

#### 5. FirebaseFactoryService
**Archivo:** `src/app/core/services/firebase/firebase-factory.service.ts`

Factory pattern para obtener la implementación correcta:
```typescript
getAuthService(): AuthService | AuthFirebaseService
getUserService(): UserService | UserFirebaseService
```

## Dependencias Requeridas

### Para Angular 14 (Versiones Compatibles)

```bash
npm uninstall firebase @angular/fire
npm install firebase@9.23.0 @angular/fire@7.6.1
```

### Package.json Recomendado
```json
{
  "dependencies": {
    "@angular/fire": "7.6.1",
    "firebase": "9.23.0"
  }
}
```

## Configuración

### 1. Configuración de Firebase

Asegúrate de que `firebase.config.ts` tenga la configuración correcta:

```typescript
export const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};
```

### 2. Módulo Firebase Real

Actualizar `core.module.ts` para usar el módulo real:

```typescript
// Cambiar de:
import { FirebaseModule } from './firebase.module.simple';

// A:
import { FirebaseModule } from './firebase.module.real';
```

### 3. Intercambiar Servicios

#### Opción 1: Configuración (Recomendada)
```typescript
// En firebase-config.service.ts
private config: FirebaseAppConfig = {
    useMockServices: false, // false = Real Firebase
    useEmulators: false
};
```

#### Opción 2: Programática
```typescript
// Inyectar FirebaseFactoryService
constructor(private firebaseFactory: FirebaseFactoryService) {}

// Cambiar a servicios reales
this.firebaseFactory.switchToReal();
```

#### Opción 3: Por Componente
```typescript
// En cualquier componente
constructor(
    private firebaseFactory: FirebaseFactoryService
) {
    this.authService = this.firebaseFactory.getAuthService();
    this.userService = this.firebaseFactory.getUserService();
}
```

## Migración Paso a Paso

### Paso 1: Preparar Dependencias
```bash
# 1. Desinstalar versiones incompatibles
npm uninstall firebase @angular/fire

# 2. Instalar versiones compatibles
npm install firebase@9.23.0 @angular/fire@7.6.1

# 3. Verificar instalación
npm list firebase @angular/fire
```

### Paso 2: Actualizar Módulos
```typescript
// core.module.ts - Cambiar import
import { FirebaseModule } from './firebase.module.real';
```

### Paso 3: Configurar Firebase
```typescript
// firebase-config.service.ts
useMockServices: false
```

### Paso 4: Verificar Compilación
```bash
ng build --configuration development
```

### Paso 5: Probar Funcionalidades
- Login/Register
- CRUD de usuarios
- Estados de autenticación
- Real-time updates

## Diferencias Entre Mock y Real

### Mock Services
- ✅ Funciona sin configuración
- ✅ Datos en memoria
- ✅ Respuestas inmediatas
- ❌ No persiste datos
- ❌ No sincronización real-time
- ❌ No autenticación real

### Real Firebase Services
- 🔥 Requiere configuración Firebase
- 🔥 Datos persistentes
- 🔥 Sincronización real-time
- 🔥 Autenticación completa
- 🔥 Escalable
- ⚠️ Requiere conexión internet

## Testing

### Test con Mock
```typescript
beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            { provide: FirebaseConfigService, useValue: { useMockServices: true } }
        ]
    });
});
```

### Test con Firebase
```typescript
beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [FirebaseRealModule],
        providers: [
            { provide: FirebaseConfigService, useValue: { useMockServices: false } }
        ]
    });
});
```

## Troubleshooting

### Error: "EnvironmentProviders not found"
**Solución:** Usar versiones compatibles de Firebase
```bash
npm install firebase@9.23.0 @angular/fire@7.6.1
```

### Error: "RxJS version conflict"
**Solución:** Verificar que todas las dependencias usen RxJS 7.x
```bash
npm list rxjs
```

### Error: "Firebase not initialized"
**Solución:** Verificar configuración en firebase.config.ts y módulos importados

### Error: "Permission denied"
**Solución:** Configurar Security Rules en Firebase Console
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Performance Tips

### 1. Lazy Loading de Firebase
```typescript
const FirebaseModule = () => import('./firebase.module.real').then(m => m.FirebaseRealModule);
```

### 2. Optimizar Consultas
```typescript
// Usar índices compuestos para consultas complejas
const filters = [
    { field: 'isActive', operator: '==', value: true },
    { field: 'role', operator: '==', value: 'admin' }
];
```

### 3. Pagination
```typescript
// Implementar paginación para listas grandes
const options = {
    limit: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }]
};
```

## Seguridad

### 1. Security Rules Básicas
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        resource.data.isActive == true;
    }
  }
}
```

### 2. Auth Rules
```javascript
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Conclusión

La migración de mock a Firebase real se realiza de forma gradual y controlada mediante el patrón Factory. Esto permite:

- **Desarrollo sin dependencias externas** usando mocks
- **Testing aislado** sin Firebase
- **Migración gradual** por módulos
- **Rollback rápido** en caso de problemas
- **Configuración flexible** por ambiente

La arquitectura soporta tanto servicios mock como reales, permitiendo un desarrollo ágil y un despliegue confiable.