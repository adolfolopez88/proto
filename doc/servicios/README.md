# Servicios Firebase

## 🔥 Visión General

Los servicios Firebase proporcionan una capa de abstracción robusta para interactuar con la plataforma Firebase, incluyendo autenticación, base de datos y almacenamiento.

## 📋 Servicios Implementados

### 1. [AuthService](#authservice)
- Autenticación con múltiples proveedores
- Gestión de sesiones
- Integración con guards

### 2. [BaseRepositoryService](#baserepositoryservice)
- CRUD genérico para Firestore
- Operaciones en tiempo real
- Filtrado y paginación

### 3. [FirestoreService](#firestoreservice)
- Extensión del repository base
- Operaciones específicas por colección

### 4. [UserService](#userservice)
- Gestión específica de usuarios
- Roles y permisos

### 5. [StorageService](#storageservice)
- Subida de archivos
- Gestión de metadatos
- Operaciones de almacenamiento

---

## 🔐 AuthService

### Ubicación
`src/app/core/services/firebase/auth.service.ts`

### Funcionalidades Principales

#### Autenticación con Email/Password
```typescript
const credentials: LoginCredentials = {
    email: 'user@example.com',
    password: 'securePassword123'
};

this.authService.signIn(credentials).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('User signed in:', response.data);
            // Redirección automática a /signed-in-redirect
        }
    },
    error: (error) => console.error('Sign in failed:', error)
});
```

#### Registro de Usuarios
```typescript
const userData: RegisterData = {
    email: 'newuser@example.com',
    password: 'securePassword123',
    displayName: 'John Doe'
};

this.authService.signUp(userData).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('User registered:', response.data);
        }
    }
});
```

#### Autenticación Social
```typescript
// Google Sign-In
this.authService.signInWithGoogle().subscribe(response => {
    if (response.success) {
        console.log('Google sign-in successful');
    }
});

// Facebook Sign-In
this.authService.signInWithFacebook().subscribe(response => {
    if (response.success) {
        console.log('Facebook sign-in successful');
    }
});
```

#### Estado del Usuario
```typescript
@Component({...})
export class HeaderComponent implements OnInit {
    user$ = this.authService.currentUser$;
    isLoading$ = this.authService.loading$;

    constructor(private authService: AuthService) {}

    signOut(): void {
        this.authService.signOut().subscribe();
    }

    get isAuthenticated(): boolean {
        return this.authService.isAuthenticated;
    }
}
```

### Gestión de Errores

El AuthService maneja automáticamente los errores comunes de Firebase Auth:

```typescript
// Errores manejados automáticamente:
// - auth/user-not-found
// - auth/wrong-password
// - auth/email-already-in-use
// - auth/weak-password
// - auth/too-many-requests

this.authService.signIn(credentials).subscribe({
    error: (errorResponse) => {
        console.log(errorResponse.error.message); // Mensaje user-friendly
    }
});
```

---

## 🗄️ BaseRepositoryService

### Ubicación
`src/app/core/services/firebase/base-repository.service.ts`

### Operaciones CRUD

#### Crear
```typescript
// Crear nuevo producto
const productData = {
    name: 'iPhone 14',
    price: 999,
    category: 'electronics'
};

this.productService.create(productData).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Product created:', response.data);
        }
    }
});
```

#### Leer
```typescript
// Obtener por ID
this.productService.getById('product-id').subscribe(response => {
    if (response.success) {
        const product = response.data;
    }
});

// Obtener todos con filtros
this.productService.getAll({
    filters: [
        { field: 'category', operator: '==', value: 'electronics' },
        { field: 'price', operator: '<=', value: 1000 }
    ],
    sort: [{ field: 'name', direction: 'asc' }],
    limit: 10
}).subscribe(response => {
    if (response.success) {
        const products = response.data;
    }
});
```

#### Actualizar
```typescript
// Actualizar producto
this.productService.update('product-id', {
    price: 899,
    updatedAt: new Date()
}).subscribe(response => {
    if (response.success) {
        console.log('Product updated');
    }
});
```

#### Eliminar
```typescript
// Eliminación física
this.productService.delete('product-id').subscribe();

// Eliminación lógica (soft delete)
this.productService.softDelete('product-id').subscribe();
```

### Datos en Tiempo Real

```typescript
@Component({
    template: `
        <div *ngFor="let product of products$ | async">
            {{ product.name }} - ${{ product.price }}
        </div>
    `
})
export class ProductListComponent {
    products$: Observable<Product[]>;

    constructor(private productService: ProductService) {
        this.products$ = this.productService.getRealtimeCollection({
            filters: [{ field: 'isActive', operator: '==', value: true }]
        });
    }
}
```

### Query Builder

```typescript
// Query compleja con múltiples filtros
const queryOptions: QueryOptions = {
    filters: [
        { field: 'category', operator: '==', value: 'electronics' },
        { field: 'stock', operator: '>', value: 0 },
        { field: 'featured', operator: '==', value: true }
    ],
    sort: [
        { field: 'priority', direction: 'desc' },
        { field: 'name', direction: 'asc' }
    ],
    limit: 20,
    page: 1
};

this.productService.getAll(queryOptions).subscribe();
```

---

## 👤 UserService

### Ubicación
`src/app/core/services/firebase/firestore.service.ts`

### Operaciones Específicas

```typescript
// Crear perfil de usuario
const userData: Partial<User> = {
    email: 'user@example.com',
    displayName: 'John Doe',
    roles: [{ id: 'user', name: 'User', permissions: [] }],
    profile: {
        firstName: 'John',
        lastName: 'Doe'
    }
};

this.userService.createUserProfile('firebase-uid', userData).subscribe();

// Buscar por email
this.userService.getUserByEmail('user@example.com').subscribe(response => {
    const users = response.data; // Array con usuarios encontrados
});

// Obtener usuarios por rol
this.userService.getUsersByRole('admin').subscribe(response => {
    const adminUsers = response.data;
});
```

---

## 📁 StorageService

### Ubicación
`src/app/core/services/firebase/storage.service.ts`

### Subida de Archivos

#### Subida Simple
```typescript
onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const path = this.storageService.generateFileName(file.name, 'uploads');
        
        this.storageService.uploadFileSimple(file, path).subscribe({
            next: (response) => {
                if (response.success) {
                    console.log('File uploaded:', response.data); // Download URL
                }
            }
        });
    }
}
```

#### Subida con Progress
```typescript
@Component({
    template: `
        <input type="file" (change)="uploadFile($event)">
        <div *ngIf="uploadProgress$ | async as progress">
            Progress: {{ progress.progress }}%
        </div>
    `
})
export class FileUploadComponent {
    uploadProgress$ = this.storageService.uploadProgress$;

    constructor(private storageService: StorageService) {}

    uploadFile(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const path = `uploads/${Date.now()}_${file.name}`;
            
            this.storageService.uploadFile(file, path).subscribe({
                next: (response) => {
                    if (response.success) {
                        console.log('Upload complete:', response.data.downloadURL);
                    }
                }
            });
        }
    }
}
```

### Gestión de Archivos

```typescript
// Listar archivos en un directorio
this.storageService.listFiles('uploads/').subscribe(response => {
    if (response.success) {
        const files = response.data; // Array de FileMetadata
        files.forEach(file => {
            console.log(`${file.name} - ${file.size} bytes`);
        });
    }
});

// Obtener metadatos
this.storageService.getFileMetadata('uploads/file.jpg').subscribe(response => {
    if (response.success) {
        const metadata = response.data;
        console.log('File size:', this.storageService.formatFileSize(metadata.size));
    }
});

// Eliminar archivo
this.storageService.deleteFile('uploads/file.jpg').subscribe({
    next: () => console.log('File deleted'),
    error: (error) => console.error('Delete failed:', error)
});
```

### Utilidades

```typescript
// Generar nombres únicos
const fileName = this.storageService.generateFileName('photo.jpg', 'profiles');
// Resultado: profiles/1692345678901_abc123_photo.jpg

// Validar tipos de archivo
const isImage = this.storageService.isImageFile('photo.jpg'); // true

// Formatear tamaños
const formattedSize = this.storageService.formatFileSize(1048576); // "1 MB"
```

---

## 🔧 Configuración

### Firebase Config
```typescript
// src/app/core/config/firebase.config.ts
export const firebaseConfig = {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
    projectId: process.env['FIREBASE_PROJECT_ID'],
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['FIREBASE_APP_ID']
};
```

### Emulators (Development)
```typescript
export const firebaseEmulatorConfig = {
    useEmulators: !environment.production,
    auth: { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
    storage: { host: 'localhost', port: 9199 }
};
```

## ⚡ Performance Tips

1. **Use Real-time Sparingly**: Solo para datos críticos
2. **Implement Pagination**: Para listas grandes
3. **Cache Responses**: En servicios cuando sea apropiado
4. **Optimize Queries**: Usa índices en Firestore
5. **Lazy Load Images**: Para archivos de storage

## 🧪 Testing

```typescript
// Mock del AuthService para tests
const mockAuthService = {
    signIn: jasmine.createSpy().and.returnValue(of({ success: true, data: mockUser })),
    currentUser$: of(mockUser),
    isAuthenticated: true
};

TestBed.configureTestingModule({
    providers: [
        { provide: AuthService, useValue: mockAuthService }
    ]
});
```