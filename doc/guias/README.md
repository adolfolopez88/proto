# Guías de Uso y Desarrollo

## 📚 Visión General

Esta sección contiene guías prácticas para desarrolladores que trabajen con el proyecto, incluyendo configuración del entorno, mejores prácticas y flujos de desarrollo.

## 📋 Guías Disponibles

### 1. [Guía de Configuración Inicial](#configuración-inicial)
- Setup del proyecto
- Configuración de Firebase
- Variables de entorno

### 2. [Guía de Desarrollo](#desarrollo)
- Flujo de desarrollo
- Convenciones de código
- Estructura de commits

### 3. [Guía de Testing](#testing)
- Estrategias de testing
- Configuración de tests
- Ejemplos prácticos

### 4. [Guía de Despliegue](#despliegue)
- Preparación para producción
- Configuración de entornos
- CI/CD

---

## 🚀 Configuración Inicial

### Prerrequisitos

```bash
# Node.js (versión 16 o superior)
node --version  # v16.x.x o superior

# npm (viene con Node.js)
npm --version   # 8.x.x o superior

# Angular CLI
npm install -g @angular/cli@14
ng version
```

### Instalación del Proyecto

```bash
# Clonar el repositorio
git clone <repository-url>
cd Proto

# Instalar dependencias
npm install

# Verificar que la aplicación compile
ng build --configuration development

# Ejecutar en modo desarrollo
ng serve
```

### Configuración de Firebase

#### 1. Crear Proyecto Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. Habilitar Authentication, Firestore y Storage

#### 2. Configurar Autenticación

```javascript
// En Firebase Console > Authentication > Sign-in method
// Habilitar:
- Email/Password
- Google (opcional)
- Facebook (opcional)
```

#### 3. Configurar Firestore

```javascript
// En Firebase Console > Firestore Database
// Crear base de datos en modo test (cambiar reglas después)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura si el usuario está autenticado
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 4. Configurar Variables de Entorno

```typescript
// src/environments/environment.ts
export const environment = {
    production: false,
    firebase: {
        apiKey: "tu-api-key",
        authDomain: "tu-proyecto.firebaseapp.com",
        projectId: "tu-proyecto",
        storageBucket: "tu-proyecto.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef"
    }
};

// src/environments/environment.prod.ts
export const environment = {
    production: true,
    firebase: {
        // Configuración de producción
    }
};
```

#### 5. Habilitar Firebase en el Proyecto

```typescript
// Descomentar en src/app/core/core.module.ts
imports: [
    AuthModule,
    IconsModule,
    TranslocoCoreModule,
    FirebaseModule // Descomentar esta línea
]
```

```typescript
// Descomentar en src/app/core/firebase.module.ts
// Todas las importaciones y configuraciones de Firebase
```

#### 6. Instalar Dependencias Firebase Correctas

```bash
# Desinstalar versiones incompatibles
npm uninstall firebase @angular/fire

# Instalar versiones compatibles con Angular 14
npm install firebase@^9.23.0 @angular/fire@^7.6.1
```

### Configuración de Development Tools

#### ESLint y Prettier

```bash
# Si no están instalados
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 4
}
```

#### Extensiones VS Code Recomendadas

```json
// .vscode/extensions.json
{
    "recommendations": [
        "angular.ng-template",
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "firebase.vscode-firebase-explorer"
    ]
}
```

---

## 💻 Desarrollo

### Estructura de Archivos

```
src/app/
├── core/                    # Servicios singleton
│   ├── auth/               # Autenticación
│   ├── config/             # Configuraciones
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   └── services/           # Servicios core
├── shared/                 # Código compartido
│   ├── components/         # Componentes reutilizables
│   ├── interfaces/         # Tipos e interfaces
│   ├── pipes/             # Pipes personalizados
│   └── directives/        # Directivas
├── modules/               # Módulos de funcionalidad
│   ├── auth/              # Páginas de autenticación
│   ├── admin/             # Área administrativa
│   └── landing/           # Landing pages
└── layout/               # Layouts y navegación
```

### Convenciones de Naming

#### Archivos y Carpetas

```bash
# Componentes
user-profile.component.ts
user-profile.component.html
user-profile.component.scss

# Servicios
user-management.service.ts

# Interfaces
user.interface.ts

# Módulos
user-management.module.ts

# Guards
auth.guard.ts

# Interceptors
auth.interceptor.ts
```

#### Clases y Variables

```typescript
// Clases - PascalCase
export class UserProfileComponent { }
export class AuthService { }

// Interfaces - PascalCase con prefijo I (opcional)
export interface User { }
export interface IUserPreferences { }

// Variables y métodos - camelCase
const userName = 'john';
const isUserActive = true;

function getUserById(id: string) { }

// Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Enums - PascalCase
enum UserRole {
    Admin = 'admin',
    User = 'user',
    Guest = 'guest'
}
```

### Workflow de Desarrollo

#### 1. Crear Nueva Funcionalidad

```bash
# Crear nueva rama
git checkout -b feature/user-management

# Generar componentes
ng generate component modules/admin/user-management/user-list
ng generate component modules/admin/user-management/user-form

# Generar servicio
ng generate service modules/admin/user-management/services/user-crud

# Generar módulo
ng generate module modules/admin/user-management --routing
```

#### 2. Implementar Funcionalidad

```typescript
// 1. Crear interfaces
export interface User extends BaseEntity {
    email: string;
    name: string;
    role: UserRole;
}

// 2. Crear servicio
@Injectable()
export class UserCrudService extends BaseRepositoryService<User> {
    protected collectionName = 'users';
}

// 3. Crear componente de lista
@Component({
    template: `
        <app-generic-table
            [data]="users"
            [config]="tableConfig"
            [loading]="loading"
            (actionClick)="onActionClick($event)">
        </app-generic-table>
    `
})
export class UserListComponent {
    // Implementation
}

// 4. Crear componente de formulario
@Component({
    template: `
        <app-generic-form
            [config]="formConfig"
            [initialData]="userData"
            (formSubmit)="onSubmit($event)">
        </app-generic-form>
    `
})
export class UserFormComponent {
    // Implementation
}
```

#### 3. Testing

```bash
# Ejecutar tests durante desarrollo
ng test --watch

# Tests específicos
ng test --include="**/user-management/**/*.spec.ts"

# Coverage
ng test --code-coverage
```

#### 4. Build y Verificación

```bash
# Build de desarrollo
ng build --configuration development

# Build de producción
ng build --configuration production

# Análisis de bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/fuse/stats.json
```

### Mejores Prácticas

#### Componentes

```typescript
// ✅ Buena práctica
@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit, OnDestroy {
    @Input() userId!: string;
    @Output() userUpdated = new EventEmitter<User>();

    user$ = new BehaviorSubject<User | null>(null);
    loading$ = new BehaviorSubject<boolean>(false);
    
    private destroy$ = new Subject<void>();

    constructor(
        private userService: UserService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadUser();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadUser(): void {
        this.loading$.next(true);
        
        this.userService.getById(this.userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.user$.next(response.data);
                    }
                    this.loading$.next(false);
                },
                error: () => this.loading$.next(false)
            });
    }
}
```

#### Servicios

```typescript
// ✅ Buena práctica
@Injectable({
    providedIn: 'root'
})
export class UserManagementService extends BaseRepositoryService<User> {
    protected collectionName = 'users';
    
    private selectedUserSubject = new BehaviorSubject<User | null>(null);
    selectedUser$ = this.selectedUserSubject.asObservable();

    // Métodos específicos del dominio
    getUsersByRole(role: UserRole): Observable<ApiResponse<User[]>> {
        return this.getAll({
            filters: [{ field: 'role', operator: '==', value: role }],
            sort: [{ field: 'name', direction: 'asc' }]
        });
    }

    activateUser(userId: string): Observable<ApiResponse<User>> {
        return this.update(userId, { isActive: true });
    }

    deactivateUser(userId: string): Observable<ApiResponse<User>> {
        return this.update(userId, { isActive: false });
    }

    selectUser(user: User): void {
        this.selectedUserSubject.next(user);
    }

    clearSelection(): void {
        this.selectedUserSubject.next(null);
    }
}
```

#### Templates

```html
<!-- ✅ Buena práctica -->
<div class="user-profile-container">
    <!-- Loading state -->
    <div *ngIf="loading$ | async" class="loading-container">
        <mat-spinner></mat-spinner>
    </div>

    <!-- Content -->
    <div *ngIf="!(loading$ | async) && (user$ | async) as user" class="content">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        
        <!-- Actions -->
        <div class="actions">
            <button mat-raised-button 
                    color="primary" 
                    (click)="editUser(user)"
                    [disabled]="!canEditUser(user)">
                Edit User
            </button>
        </div>
    </div>

    <!-- Error state -->
    <div *ngIf="!(loading$ | async) && !(user$ | async)" class="error-container">
        <p>User not found</p>
    </div>
</div>
```

---

## 🧪 Testing

### Configuración de Testing

#### Karma Configuration

```javascript
// karma.conf.js personalizado para el proyecto
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage/fuse'),
            subdir: '.',
            reporters: [
                { type: 'html' },
                { type: 'text-summary' },
                { type: 'lcov' }
            ]
        },
        reporters: ['progress', 'kjhtml', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        restartOnFileChange: true
    });
};
```

### Estrategias de Testing

#### Unit Tests

```typescript
// user.service.spec.ts
describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let firestoreMock: jasmine.SpyObj<Firestore>;

    beforeEach(() => {
        const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection', 'doc']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: Firestore, useValue: firestoreSpy }
            ]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        firestoreMock = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create user', () => {
        const userData: Omit<User, 'id'> = {
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.User
        };

        service.create(userData).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.data?.name).toBe('Test User');
        });

        // Verificar que se llamó a Firestore
        expect(firestoreMock.collection).toHaveBeenCalledWith('users');
    });
});
```

#### Component Tests

```typescript
// user-profile.component.spec.ts
describe('UserProfileComponent', () => {
    let component: UserProfileComponent;
    let fixture: ComponentFixture<UserProfileComponent>;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        const userServiceSpy = jasmine.createSpyObj('UserService', ['getById']);

        await TestBed.configureTestingModule({
            declarations: [UserProfileComponent],
            imports: [SharedModule, NoopAnimationsModule],
            providers: [
                { provide: UserService, useValue: userServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserProfileComponent);
        component = fixture.componentInstance;
        userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    });

    it('should load user on init', () => {
        const mockUser: User = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.User
        };

        userService.getById.and.returnValue(of({
            success: true,
            data: mockUser
        }));

        component.userId = '1';
        component.ngOnInit();

        expect(userService.getById).toHaveBeenCalledWith('1');
        component.user$.subscribe(user => {
            expect(user).toEqual(mockUser);
        });
    });

    it('should emit userUpdated when user is updated', () => {
        spyOn(component.userUpdated, 'emit');
        const updatedUser: User = { /* user data */ };

        component.onUserUpdate(updatedUser);

        expect(component.userUpdated.emit).toHaveBeenCalledWith(updatedUser);
    });
});
```

#### Integration Tests

```typescript
// user-management-integration.spec.ts
describe('User Management Integration', () => {
    let component: UserListComponent;
    let fixture: ComponentFixture<UserListComponent>;
    let userService: UserService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserListComponent],
            imports: [
                SharedModule,
                BrowserAnimationsModule,
                RouterTestingModule
            ],
            providers: [
                UserService,
                // Mocks de Firebase
                { provide: Firestore, useValue: mockFirestore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserListComponent);
        component = fixture.componentInstance;
        userService = TestBed.inject(UserService);
    });

    it('should display users in table', fakeAsync(() => {
        const mockUsers: User[] = [
            { id: '1', name: 'User 1', email: 'user1@example.com', role: UserRole.User },
            { id: '2', name: 'User 2', email: 'user2@example.com', role: UserRole.Admin }
        ];

        // Setup mock response
        spyOn(userService, 'getAll').and.returnValue(of({
            success: true,
            data: mockUsers
        }));

        // Initialize component
        component.ngOnInit();
        tick();
        fixture.detectChanges();

        // Verify table displays users
        const tableRows = fixture.debugElement.queryAll(By.css('mat-row'));
        expect(tableRows.length).toBe(2);

        const firstRowCells = tableRows[0].queryAll(By.css('mat-cell'));
        expect(firstRowCells[0].nativeElement.textContent).toContain('User 1');
    }));
});
```

### Mocks y Test Utilities

```typescript
// test-utils/mocks.ts
export const mockFirestore = {
    collection: jasmine.createSpy('collection').and.returnValue({
        add: jasmine.createSpy('add').and.returnValue(Promise.resolve({ id: 'mock-id' })),
        doc: jasmine.createSpy('doc').and.returnValue({
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({
                exists: true,
                data: () => ({ name: 'Mock User' })
            }))
        })
    })
};

export const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.User,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
};

export const mockTableConfig: TableConfig = {
    columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: false }
    ],
    pagination: {
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 25]
    }
};
```

### Comandos de Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo CI (single run)
npm run test:ci

# Tests específicos
ng test --include="**/user-management/**"

# Tests con watch
ng test --watch
```

---

## 🚀 Despliegue

### Preparación para Producción

#### 1. Environment de Producción

```typescript
// src/environments/environment.prod.ts
export const environment = {
    production: true,
    firebase: {
        apiKey: process.env['FIREBASE_API_KEY'],
        authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
        projectId: process.env['FIREBASE_PROJECT_ID'],
        storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
        messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
        appId: process.env['FIREBASE_APP_ID']
    }
};
```

#### 2. Build de Producción

```bash
# Build optimizado
ng build --configuration production

# Análisis de bundle size
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/fuse/stats.json
```

#### 3. Optimización de Performance

```typescript
// Lazy loading mejorado
const routes: Routes = [
    {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
    }
];

// Preloading strategy personalizada
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
    preload(route: Route, load: () => Observable<any>): Observable<any> {
        // Precargar solo rutas importantes
        if (route.data && route.data['preload']) {
            return load();
        }
        return of(null);
    }
}
```

### CI/CD Configuration

#### GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Build
      run: npm run build:prod
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build:prod
      env:
        FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-firebase-project-id
```

#### Docker Configuration

```dockerfile
# Dockerfile
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/dist/fuse /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Monitoreo y Logging

#### Firebase Performance

```typescript
// src/app/app.component.ts
import { getPerformance, trace } from 'firebase/performance';

@Component({...})
export class AppComponent implements OnInit {
    ngOnInit(): void {
        if (environment.production) {
            const perf = getPerformance();
            
            // Trace personalizado
            const t = trace(perf, 'app-initialization');
            t.start();
            
            // ... lógica de inicialización
            
            t.stop();
        }
    }
}
```

#### Error Tracking

```typescript
// Integración con Sentry (ejemplo)
import * as Sentry from '@sentry/angular';

if (environment.production) {
    Sentry.init({
        dsn: 'YOUR_SENTRY_DSN',
        integrations: [
            new Sentry.BrowserTracing({
                tracePropagationTargets: ['localhost', 'your-api-domain.com', /^\//],
                routingInstrumentation: Sentry.routingInstrumentation,
            }),
        ],
        tracesSampleRate: 0.1,
    });
}
```

---

## 📞 Soporte

### Recursos de Ayuda

- **Documentación del Proyecto**: `doc/README.md`
- **Arquitectura**: `doc/arquitectura/README.md`
- **APIs**: `doc/servicios/README.md`
- **Componentes**: `doc/componentes/README.md`

### Contacto

- **Issues**: Crear issue en el repositorio
- **Preguntas**: Usar discussions del repositorio
- **Emergencias**: Contactar al equipo de desarrollo

### Troubleshooting

#### Problemas Comunes

1. **Firebase no inicializa**: Verificar configuración en `firebase.config.ts`
2. **Errores de compilación**: Ejecutar `npm install` nuevamente
3. **Tests fallan**: Verificar mocks en `src/test-utils/`
4. **Performance lenta**: Revisar bundle analyzer y optimizar imports

#### Comandos de Diagnóstico

```bash
# Verificar dependencias
npm ls

# Limpiar node_modules
rm -rf node_modules package-lock.json && npm install

# Verificar build
ng build --configuration production --verbose

# Análisis de bundle
ng build --stats-json && npx webpack-bundle-analyzer dist/fuse/stats.json
```

---

*Esta documentación se actualiza continuamente. Última revisión: Agosto 2025*