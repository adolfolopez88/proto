# Firebase Integration Guide

Esta guía explica cómo está configurada la integración de Firebase en el proyecto Fuse Angular y cómo utilizarla.

## Configuración Realizada

### 1. Configuración de Firebase

**Archivo:** `src/app/core/config/firebase.config.ts`

```typescript
export const firebaseConfig = {
    apiKey: "AIzaSyAky5dltJTCGjWhFEXV17BY-GEWZ8W32G8",
    authDomain: "proto-c51d8.firebaseapp.com",
    projectId: "proto-c51d8",
    storageBucket: "proto-c51d8.appspot.com",
    messagingSenderId: "1061232766933",
    appId: "1:1061232766933:web:b3c778c2aa1135067e975c",
    measurementId: "G-E53VHXMSPP"
};
```

### 2. Servicios Creados

#### BaseRepositoryService
**Archivo:** `src/app/core/services/firebase/base-repository.service.ts`

Servicio genérico para operaciones CRUD con Firestore que incluye:
- CRUD completo (Create, Read, Update, Delete)
- Queries con filtros, ordenamiento y paginación
- Observadores en tiempo real
- Transacciones y operaciones batch
- Manejo de errores

#### UserService
**Archivo:** `src/app/core/services/firebase/user.service.ts`

Servicio específico para gestión de usuarios que extiende BaseRepositoryService:
- Búsqueda por email, rol, estado
- Creación y actualización de usuarios
- Estadísticas de usuarios
- Desactivación de usuarios

#### AuthService
**Archivo:** `src/app/core/services/firebase/auth.service.ts`

Servicio de autenticación completo:
- Login/registro con email y contraseña
- Autenticación con Google y Facebook
- Gestión de estado de autenticación
- Recuperación de contraseña
- Integración con UserService

### 3. Modelo de Usuario

**Archivo:** `src/app/core/models/user.model.ts`

```typescript
export interface User {
    id?: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: 'admin' | 'user' | 'moderator';
    isActive?: boolean;
    createdAt?: any;
    updatedAt?: any;
    lastLoginAt?: any;
    preferences?: {
        theme?: string;
        language?: string;
        notifications?: boolean;
    };
}
```

## Instalación de Dependencias

```bash
npm install firebase @angular/fire
```

## Configuración en el Proyecto

### 1. Importar FirebaseModule

El módulo ya está configurado en `src/app/core/core.module.ts`:

```typescript
import { FirebaseModule } from './firebase.module';

@NgModule({
    imports: [
        FirebaseModule,
        // ... otros imports
    ]
})
export class CoreModule {}
```

### 2. Servicios Disponibles

Los servicios están configurados con `providedIn: 'root'` y se pueden inyectar directamente:

```typescript
import { AuthService } from 'app/core/services/firebase/auth.service';
import { UserService } from 'app/core/services/firebase/user.service';

constructor(
    private authService: AuthService,
    private userService: UserService
) {}
```

## Ejemplos de Uso

### 1. Autenticación

#### Login
```typescript
const credentials = { email: 'user@example.com', password: 'password123' };

this.authService.signIn(credentials).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Usuario autenticado:', response.data);
        } else {
            console.error('Error:', response.error?.message);
        }
    }
});
```

#### Registro
```typescript
const registerData = {
    email: 'nuevo@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Juan',
    lastName: 'Pérez',
    displayName: 'Juan Pérez'
};

this.authService.signUp(registerData).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Usuario registrado:', response.data);
        }
    }
});
```

#### Login con Google
```typescript
this.authService.signInWithGoogle().subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Autenticado con Google:', response.data);
        }
    }
});
```

#### Estado de Autenticación
```typescript
this.authService.currentUser$.subscribe(user => {
    if (user) {
        console.log('Usuario logueado:', user);
    } else {
        console.log('Usuario no autenticado');
    }
});
```

### 2. Gestión de Usuarios

#### Obtener todos los usuarios
```typescript
this.userService.getDocuments([]).subscribe(users => {
    console.log('Todos los usuarios:', users);
});
```

#### Buscar usuario por email
```typescript
this.userService.getUserByEmail('user@example.com').subscribe(user => {
    if (user) {
        console.log('Usuario encontrado:', user);
    }
});
```

#### Filtrar usuarios activos
```typescript
this.userService.getActiveUsers().subscribe(activeUsers => {
    console.log('Usuarios activos:', activeUsers);
});
```

#### Usuarios por rol
```typescript
this.userService.getUsersByRole('admin').subscribe(admins => {
    console.log('Administradores:', admins);
});
```

#### Crear usuario
```typescript
const newUser = {
    email: 'nuevo@example.com',
    firstName: 'Nuevo',
    lastName: 'Usuario',
    role: 'user' as const
};

this.userService.createUser(newUser).subscribe(userId => {
    console.log('Usuario creado con ID:', userId);
});
```

#### Actualizar usuario
```typescript
this.userService.updateUser('userId123', {
    firstName: 'Nombre Actualizado',
    preferences: {
        theme: 'dark',
        notifications: true
    }
}).subscribe(() => {
    console.log('Usuario actualizado');
});
```

#### Estadísticas de usuarios
```typescript
this.userService.getUserStats().subscribe(stats => {
    console.log('Total:', stats.total);
    console.log('Activos:', stats.active);
    console.log('Por rol:', stats.byRole);
});
```

### 3. Operaciones Avanzadas con BaseRepository

#### Query con filtros múltiples
```typescript
const filters = [
    { field: 'isActive', operator: '==', value: true },
    { field: 'role', operator: '==', value: 'user' },
    { field: 'createdAt', operator: '>=', value: new Date('2024-01-01') }
];

this.userService.getDocuments(filters).subscribe(users => {
    console.log('Usuarios filtrados:', users);
});
```

#### Query con ordenamiento y límite
```typescript
const options = {
    orderBy: [{ field: 'createdAt', direction: 'desc' as const }],
    limit: 10
};

this.userService.getDocuments([], options).subscribe(users => {
    console.log('Últimos 10 usuarios:', users);
});
```

#### Escuchar cambios en tiempo real
```typescript
this.userService.getDocumentsRealTime([]).subscribe(users => {
    console.log('Usuarios actualizados en tiempo real:', users);
});
```

#### Transacción
```typescript
const updates = [
    { id: 'user1', data: { lastLoginAt: new Date() } },
    { id: 'user2', data: { lastLoginAt: new Date() } }
];

this.userService.batchUpdate(updates).subscribe(() => {
    console.log('Actualización en lote completada');
});
```

## Componente de Ejemplo

Se ha creado un componente completo de ejemplo en:
`src/app/modules/admin/example/firebase-example/`

Este componente demuestra:
- Formularios de login y registro
- Autenticación con Google
- Gestión de usuarios
- Estadísticas
- Manejo de errores

## Configuración Adicional

### Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        resource.data.isActive == true;
    }
    
    // Admin only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Firebase Authentication

En la consola de Firebase, habilitar:
- Autenticación por email/contraseña
- Autenticación con Google
- Autenticación con Facebook (opcional)

### Environment Variables

Para producción, considerar usar variables de entorno:

```typescript
// environment.prod.ts
export const environment = {
    firebase: {
        apiKey: process.env['FIREBASE_API_KEY'],
        authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
        // ... resto de configuración
    }
};
```

## Troubleshooting

### Errores Comunes

1. **"Firebase not initialized"**
   - Verificar que FirebaseModule esté importado en CoreModule
   - Verificar configuración en firebase.config.ts

2. **"Insufficient permissions"**
   - Verificar Security Rules en Firestore
   - Verificar que el usuario esté autenticado

3. **"Network error"**
   - Verificar conectividad
   - Verificar configuración de proyecto en Firebase Console

### Debug

Habilitar logs de Firebase:
```typescript
import { enableNetwork, disableNetwork } from '@angular/fire/firestore';

// Para debugging
enableNetwork(firestore).then(() => {
    console.log('Firestore online');
});
```

## Próximos Pasos

1. Implementar más servicios específicos (productos, pedidos, etc.)
2. Agregar validaciones del lado del cliente
3. Implementar cache offline
4. Agregar tests unitarios
5. Configurar CI/CD con Firebase Hosting

## Estructura de Archivos

```
src/app/core/
├── config/
│   └── firebase.config.ts
├── models/
│   └── user.model.ts
├── services/firebase/
│   ├── auth.service.ts
│   ├── base-repository.service.ts
│   ├── user.service.ts
│   ├── firestore.service.ts
│   └── storage.service.ts
├── interceptors/
│   └── auth.interceptor.ts
├── core.module.ts
└── firebase.module.ts
```

Esta integración proporciona una base sólida y escalable para cualquier aplicación que requiera funcionalidades de backend con Firebase.