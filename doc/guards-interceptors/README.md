# Guards e Interceptors

## 🛡️ Visión General

Los guards e interceptors proporcionan funcionalidad transversal para autenticación, autorización, manejo de errores y estados de carga en toda la aplicación.

## 📋 Implementaciones

### Guards
- [RoleGuard](#roleguard) - Control de acceso basado en roles
- [UnsavedChangesGuard](#unsavedchangesguard) - Protección contra pérdida de cambios

### Interceptors
- [AuthInterceptor](#authinterceptor) - Inyección automática de tokens
- [ErrorInterceptor](#errorinterceptor) - Manejo global de errores HTTP
- [LoadingInterceptor](#loadinginterceptor) - Estados de carga automáticos

---

## 🔐 Guards

### RoleGuard

#### Ubicación
`src/app/core/guards/role.guard.ts`

#### Propósito
Controla el acceso a rutas basándose en roles de usuario y permisos específicos.

#### Configuración de Rutas

```typescript
// En app.routing.ts o módulos específicos
const routes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [RoleGuard],
        data: {
            roles: ['admin', 'super-admin']
        }
    },
    {
        path: 'users',
        component: UsersComponent,
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: {
            permissions: ['users.read', 'users.write']
        },
        children: [
            {
                path: 'create',
                component: CreateUserComponent,
                data: {
                    permissions: ['users.create']
                }
            },
            {
                path: 'edit/:id',
                component: EditUserComponent,
                data: {
                    permissions: ['users.update']
                }
            }
        ]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: {
            // Requiere TANTO rol admin COMO permisos específicos
            roles: ['admin'],
            permissions: ['dashboard.view']
        }
    }
];
```

#### Ejemplos de Uso

##### Control por Roles
```typescript
// Ruta solo para administradores
{
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [RoleGuard],
    data: {
        roles: ['admin']
    }
}

// Ruta para múltiples roles
{
    path: 'reports',
    component: ReportsComponent,
    canActivate: [RoleGuard],
    data: {
        roles: ['admin', 'manager', 'analyst']
    }
}
```

##### Control por Permisos
```typescript
// Ruta con permisos específicos
{
    path: 'financial-data',
    component: FinancialDataComponent,
    canActivate: [RoleGuard],
    data: {
        permissions: ['finance.read', 'reports.view']
    }
}

// Combinación de roles y permisos
{
    path: 'system-config',
    component: SystemConfigComponent,
    canActivate: [RoleGuard],
    data: {
        roles: ['admin'],
        permissions: ['system.configure']
    }
}
```

#### Comportamiento

- **Sin acceso**: Redirecciona a `/unauthorized`
- **No autenticado**: Redirecciona a `/sign-in`
- **Verificación roles**: El usuario debe tener AL MENOS UNO de los roles especificados
- **Verificación permisos**: El usuario debe tener AL MENOS UNO de los permisos especificados
- **Roles + Permisos**: El usuario debe cumplir AMBOS criterios

#### Página de Error Personalizada

```typescript
// unauthorized.component.ts
@Component({
    template: `
        <div class="unauthorized-container">
            <mat-icon>block</mat-icon>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this resource.</p>
            <button mat-raised-button color="primary" (click)="goBack()">
                Go Back
            </button>
        </div>
    `
})
export class UnauthorizedComponent {
    constructor(private location: Location) {}
    
    goBack(): void {
        this.location.back();
    }
}
```

---

### UnsavedChangesGuard

#### Ubicación
`src/app/core/guards/unsaved-changes.guard.ts`

#### Propósito
Previene la navegación accidental cuando hay cambios no guardados en formularios.

#### Implementación en Componentes

```typescript
// Componente que implementa la interface
@Component({...})
export class EditUserComponent implements CanComponentDeactivate {
    @ViewChild('userForm') userForm!: NgForm;
    
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        // Si el formulario no ha cambiado, permite navegación
        if (!this.userForm.dirty) {
            return true;
        }

        // Mostrar confirmación si hay cambios
        return this.confirmDialog();
    }

    private confirmDialog(): Promise<boolean> {
        return new Promise((resolve) => {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                data: {
                    title: 'Unsaved Changes',
                    message: 'You have unsaved changes. Do you want to leave without saving?',
                    confirmText: 'Leave',
                    cancelText: 'Stay'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                resolve(result === true);
            });
        });
    }
}
```

#### Configuración de Rutas

```typescript
const routes: Routes = [
    {
        path: 'edit/:id',
        component: EditUserComponent,
        canDeactivate: [UnsavedChangesGuard]
    },
    {
        path: 'create',
        component: CreateProductComponent,
        canDeactivate: [UnsavedChangesGuard]
    }
];
```

#### Implementación con Reactive Forms

```typescript
@Component({...})
export class ProductFormComponent implements CanComponentDeactivate {
    productForm: FormGroup;
    originalValue: any;

    ngOnInit(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            price: [0, Validators.required],
            description: ['']
        });

        // Guardar valor original para comparación
        this.originalValue = this.productForm.value;
    }

    canDeactivate(): boolean {
        const currentValue = this.productForm.value;
        const hasChanges = JSON.stringify(this.originalValue) !== JSON.stringify(currentValue);
        
        if (!hasChanges) {
            return true;
        }

        return confirm('You have unsaved changes. Are you sure you want to leave?');
    }

    onSave(): void {
        if (this.productForm.valid) {
            this.productService.save(this.productForm.value).subscribe(() => {
                // Actualizar valor original después de guardar
                this.originalValue = this.productForm.value;
                this.router.navigate(['/products']);
            });
        }
    }
}
```

---

## 🔄 Interceptors

### AuthInterceptor

#### Ubicación
`src/app/core/interceptors/auth.interceptor.ts`

#### Propósito
Inyecta automáticamente tokens de autenticación en las requests HTTP.

#### Configuración

```typescript
// En core.module.ts
providers: [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    }
]
```

#### Funcionalidad Actual (Preparado para Firebase)

```typescript
// Estado actual - preparado para Firebase
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO: Implementar cuando Firebase esté configurado
    return next.handle(req);
}
```

#### Implementación Completa (Cuando Firebase esté configurado)

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip para requests a Firebase
    if (req.url.includes('googleapis.com') || req.url.includes('firebase.com')) {
        return next.handle(req);
    }

    // Skip si no hay usuario autenticado
    if (!this.auth.currentUser) {
        return next.handle(req);
    }

    // Añadir token de autenticación
    return from(getIdToken(this.auth.currentUser)).pipe(
        switchMap(token => {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(authReq);
        }),
        catchError(error => {
            console.error('Auth token error:', error);
            return next.handle(req);
        })
    );
}
```

#### Headers Personalizados

```typescript
// Para APIs específicas
if (req.url.includes('/api/v1/')) {
    const authReq = req.clone({
        setHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Version': '1.0.0'
        }
    });
    return next.handle(authReq);
}
```

---

### ErrorInterceptor

#### Ubicación
`src/app/core/interceptors/error.interceptor.ts`

#### Propósito
Maneja errores HTTP de forma centralizada y proporciona feedback consistente al usuario.

#### Errores Manejados

| Status Code | Acción |
|-------------|--------|
| 0 | Error de red - mostrar mensaje de conexión |
| 400 | Bad request - mostrar mensaje de validación |
| 401 | No autorizado - redireccionar a login |
| 403 | Prohibido - redireccionar a página de error |
| 404 | No encontrado - mostrar mensaje específico |
| 409 | Conflicto - mostrar advertencia |
| 422 | Error de validación - mostrar advertencias |
| 429 | Demasiadas requests - mostrar mensaje de espera |
| 500+ | Errores del servidor - mostrar mensaje genérico |

#### Ejemplo de Manejo

```typescript
// El interceptor maneja automáticamente estos casos:

// Request que falla con 401
this.userService.getUsers().subscribe({
    next: (users) => console.log(users),
    error: (error) => {
        // El usuario ya fue redirigido a /sign-in
        // Y se mostró el mensaje correspondiente
        console.log('Error handled by interceptor');
    }
});

// Request que falla con 500
this.productService.create(product).subscribe({
    error: (error) => {
        // Se muestra automáticamente:
        // "Internal server error. Please try again later."
    }
});
```

#### Personalización de Mensajes

```typescript
// En el interceptor
private getErrorMessage(status: number, error: any): string {
    const customMessages: { [key: number]: string } = {
        400: 'Please check your input data',
        401: 'Your session has expired. Please log in again',
        403: 'You don\'t have permission for this action',
        404: 'The requested resource was not found',
        500: 'Server error. Our team has been notified'
    };

    return customMessages[status] || error?.message || 'An unexpected error occurred';
}
```

#### Exclusión de Interceptor

```typescript
// Para requests que no deben mostrar errores automáticamente
const headers = new HttpHeaders().set('X-Skip-Error-Handling', 'true');
this.http.get('/api/check-connection', { headers }).subscribe({
    error: (error) => {
        // Manejo personalizado sin interferencia del interceptor
        this.handleConnectionError(error);
    }
});
```

---

### LoadingInterceptor

#### Ubicación
`src/app/core/interceptors/loading.interceptor.ts`

#### Propósito
Gestiona automáticamente los estados de carga global de la aplicación.

#### Integración con FuseLoadingService

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading para requests específicos
    if (req.headers.get('X-Skip-Loading') === 'true') {
        return next.handle(req);
    }

    // Mostrar loading si es la primera request
    if (this.activeRequests === 0) {
        this.loadingService.show();
    }
    this.activeRequests++;

    return next.handle(req).pipe(
        finalize(() => {
            this.activeRequests--;
            if (this.activeRequests === 0) {
                this.loadingService.hide();
            }
        })
    );
}
```

#### Uso con Loading Local

```typescript
@Component({
    template: `
        <button [disabled]="isLoading" (click)="loadData()">
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            Load Data
        </button>
    `
})
export class DataComponent {
    isLoading = false;

    loadData(): void {
        this.isLoading = true;
        
        // Skip global loading para esta request
        const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
        
        this.dataService.getData({ headers }).subscribe({
            next: (data) => {
                this.processData(data);
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
}
```

#### Configuración de Delays

```typescript
// Para evitar flickers en requests rápidas
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.activeRequests === 0) {
        // Delay de 200ms antes de mostrar loading
        setTimeout(() => {
            if (this.activeRequests > 0) {
                this.loadingService.show();
            }
        }, 200);
    }
    
    // ... resto del código
}
```

---

## 🔧 Configuración Global

### Registro de Guards

```typescript
// En app.module.ts o core.module.ts
providers: [
    RoleGuard,
    UnsavedChangesGuard
]
```

### Registro de Interceptors

```typescript
// En core.module.ts
providers: [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: LoadingInterceptor,
        multi: true
    }
]
```

### Orden de Ejecución

Los interceptors se ejecutan en el orden de declaración:
1. **AuthInterceptor** - Añade tokens
2. **ErrorInterceptor** - Maneja errores
3. **LoadingInterceptor** - Gestiona estados de carga

---

## 🧪 Testing

### Testing de Guards

```typescript
describe('RoleGuard', () => {
    let guard: RoleGuard;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthService', [], {
            currentUser$: of(mockUser)
        });
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                RoleGuard,
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        guard = TestBed.inject(RoleGuard);
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should allow access for valid role', () => {
        const route = new ActivatedRouteSnapshot();
        route.data = { roles: ['admin'] };

        const mockUser = { 
            roles: [{ name: 'admin', permissions: [] }] 
        } as User;
        (authService as any).currentUser$ = of(mockUser);

        guard.canActivate(route, {} as RouterStateSnapshot).subscribe(result => {
            expect(result).toBe(true);
        });
    });
});
```

### Testing de Interceptors

```typescript
describe('ErrorInterceptor', () => {
    let interceptor: ErrorInterceptor;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ErrorInterceptor,
                { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
            ]
        });

        interceptor = TestBed.inject(ErrorInterceptor);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should handle 401 errors', () => {
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        // Realizar request que fallará con 401
        http.get('/api/protected').subscribe({
            error: () => {
                expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
            }
        });

        const req = httpMock.expectOne('/api/protected');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });
});
```

---

## 📚 Mejores Prácticas

### Guards
1. **Granularidad**: Usa permisos específicos en lugar de roles amplios
2. **Feedback**: Siempre proporciona feedback al usuario sobre por qué se denegó el acceso
3. **Fallbacks**: Implementa páginas de error específicas

### Interceptors
1. **Orden**: Considera cuidadosamente el orden de los interceptors
2. **Performance**: Usa skip headers para requests que no necesitan procesamiento
3. **Error Handling**: No todos los errores necesitan notificación al usuario

### Testing
1. **Mock Services**: Usa mocks para dependencies en tests
2. **Edge Cases**: Prueba casos límite y errores
3. **Integration**: Testa la interacción entre guards e interceptors