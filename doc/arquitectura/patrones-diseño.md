# Patrones de Diseño Detallados

## 🎯 Repository Pattern

### Implementación Base

El `BaseRepositoryService` proporciona operaciones CRUD genéricas que pueden ser extendidas por servicios específicos.

```typescript
// Servicio específico extendiendo el repository base
@Injectable({
    providedIn: 'root'
})
export class ProductService extends BaseRepositoryService<Product> {
    protected collectionName = 'products';

    // Método específico del dominio
    getProductsByCategory(categoryId: string): Observable<ApiResponse<Product[]>> {
        return this.getAll({
            filters: [
                { field: 'categoryId', operator: '==', value: categoryId },
                { field: 'isActive', operator: '==', value: true }
            ],
            sort: [{ field: 'name', direction: 'asc' }]
        });
    }

    // Método con lógica de negocio específica
    async updateStock(productId: string, quantity: number): Promise<ApiResponse<Product>> {
        const product = await this.getById(productId).toPromise();
        if (product.success && product.data) {
            const updatedStock = product.data.stock + quantity;
            return this.update(productId, { stock: updatedStock });
        }
        throw new Error('Product not found');
    }
}
```

### Beneficios del Pattern

1. **Consistencia**: Todas las operaciones CRUD siguen la misma estructura
2. **Testabilidad**: Fácil crear mocks y tests unitarios
3. **Escalabilidad**: Nuevas entidades solo requieren extender la clase base
4. **Mantenimiento**: Cambios en la lógica base se propagan automáticamente

## 🔄 Observer Pattern con RxJS

### Datos en Tiempo Real

```typescript
// Componente que escucha cambios en tiempo real
@Component({
    selector: 'app-product-list',
    template: `
        <div *ngFor="let product of products$ | async">
            {{ product.name }} - Stock: {{ product.stock }}
        </div>
    `
})
export class ProductListComponent implements OnInit {
    products$: Observable<Product[]>;

    constructor(private productService: ProductService) {}

    ngOnInit() {
        // Subscripción a cambios en tiempo real
        this.products$ = this.productService.getRealtimeCollection({
            filters: [{ field: 'isActive', operator: '==', value: true }]
        });
    }
}
```

### Estado Reactivo

```typescript
// Servicio con estado reactivo
@Injectable()
export class CartService {
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);

    cartItems$ = this.cartItemsSubject.asObservable();
    total$ = this.totalSubject.asObservable();

    addItem(item: CartItem): void {
        const currentItems = this.cartItemsSubject.value;
        const updatedItems = [...currentItems, item];
        
        this.cartItemsSubject.next(updatedItems);
        this.updateTotal(updatedItems);
    }

    private updateTotal(items: CartItem[]): void {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.totalSubject.next(total);
    }
}
```

## 🎭 Strategy Pattern para Autenticación

### Implementación de Múltiples Estrategias

```typescript
// Interface común para estrategias de autenticación
interface AuthStrategy {
    signIn(): Observable<ApiResponse<User>>;
    getProviderName(): string;
}

// Estrategia para Google
class GoogleAuthStrategy implements AuthStrategy {
    signIn(): Observable<ApiResponse<User>> {
        return this.authService.signInWithGoogle();
    }
    
    getProviderName(): string {
        return 'Google';
    }
}

// Estrategia para Email/Password
class EmailAuthStrategy implements AuthStrategy {
    constructor(private credentials: LoginCredentials) {}
    
    signIn(): Observable<ApiResponse<User>> {
        return this.authService.signIn(this.credentials);
    }
    
    getProviderName(): string {
        return 'Email';
    }
}

// Contexto que usa las estrategias
@Injectable()
export class AuthenticationContext {
    private strategy: AuthStrategy;

    setStrategy(strategy: AuthStrategy): void {
        this.strategy = strategy;
    }

    executeAuth(): Observable<ApiResponse<User>> {
        if (!this.strategy) {
            throw new Error('Authentication strategy not set');
        }
        return this.strategy.signIn();
    }
}
```

## 🏭 Factory Pattern para Configuraciones

### Factory para Formularios Dinámicos

```typescript
export class FormConfigFactory {
    
    static createUserForm(): FormConfig {
        return {
            layout: 'grid',
            columns: 2,
            fields: [
                {
                    key: 'firstName',
                    type: 'text',
                    label: 'First Name',
                    required: true
                },
                {
                    key: 'lastName',
                    type: 'text',
                    label: 'Last Name',
                    required: true
                },
                {
                    key: 'email',
                    type: 'email',
                    label: 'Email',
                    required: true,
                    validators: [Validators.email]
                },
                {
                    key: 'role',
                    type: 'select',
                    label: 'Role',
                    options: [
                        { label: 'Admin', value: 'admin' },
                        { label: 'User', value: 'user' }
                    ]
                }
            ]
        };
    }

    static createProductForm(): FormConfig {
        return {
            layout: 'vertical',
            fields: [
                {
                    key: 'name',
                    type: 'text',
                    label: 'Product Name',
                    required: true
                },
                {
                    key: 'description',
                    type: 'textarea',
                    label: 'Description',
                    rows: 4
                },
                {
                    key: 'price',
                    type: 'number',
                    label: 'Price',
                    required: true,
                    min: 0
                },
                {
                    key: 'category',
                    type: 'select',
                    label: 'Category',
                    required: true,
                    // Options would be loaded dynamically
                    options: []
                }
            ]
        };
    }
}

// Uso del factory
@Component({...})
export class UserFormComponent {
    formConfig = FormConfigFactory.createUserForm();
}
```

### Factory para Configuraciones de Tabla

```typescript
export class TableConfigFactory {
    
    static createProductTable(): TableConfig {
        return {
            columns: [
                { key: 'name', label: 'Product Name', sortable: true },
                { key: 'price', label: 'Price', type: 'currency', sortable: true },
                { key: 'stock', label: 'Stock', type: 'number', sortable: true },
                { key: 'category.name', label: 'Category', sortable: false },
                { key: 'isActive', label: 'Active', type: 'boolean' },
                {
                    key: 'actions',
                    label: 'Actions',
                    type: 'actions',
                    actions: [
                        { key: 'edit', label: 'Edit', icon: 'edit', color: 'primary' },
                        { key: 'delete', label: 'Delete', icon: 'delete', color: 'warn' }
                    ]
                }
            ],
            pagination: {
                enabled: true,
                pageSize: 10,
                pageSizeOptions: [5, 10, 25, 50]
            },
            selectable: true,
            sorting: true,
            filtering: true
        };
    }
}
```

## 🎪 Decorator Pattern para Validaciones

```typescript
// Decorator para logging automático
function LogExecution(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        console.log(`Executing ${propertyName} with args:`, args);
        const result = method.apply(this, args);
        
        if (result instanceof Observable) {
            return result.pipe(
                tap(response => console.log(`${propertyName} completed:`, response)),
                catchError(error => {
                    console.error(`${propertyName} failed:`, error);
                    return throwError(error);
                })
            );
        }
        
        return result;
    };
}

// Uso del decorator
@Injectable()
export class UserService extends BaseRepositoryService<User> {
    protected collectionName = 'users';

    @LogExecution
    createUser(userData: Omit<User, 'id'>): Observable<ApiResponse<User>> {
        return this.create(userData);
    }
}
```

## 🎯 Command Pattern para Acciones

```typescript
// Interface para comandos
interface Command {
    execute(): Observable<any>;
    undo?(): Observable<any>;
}

// Comando para crear usuario
class CreateUserCommand implements Command {
    constructor(
        private userService: UserService,
        private userData: Omit<User, 'id'>,
        private createdUserId?: string
    ) {}

    execute(): Observable<ApiResponse<User>> {
        return this.userService.create(this.userData).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.createdUserId = response.data.id;
                }
            })
        );
    }

    undo(): Observable<ApiResponse<void>> {
        if (this.createdUserId) {
            return this.userService.delete(this.createdUserId);
        }
        return of({ success: true });
    }
}

// Invoker para ejecutar comandos
@Injectable()
export class CommandInvoker {
    private commandHistory: Command[] = [];

    executeCommand(command: Command): Observable<any> {
        return command.execute().pipe(
            tap(() => {
                this.commandHistory.push(command);
            })
        );
    }

    undoLastCommand(): Observable<any> {
        const lastCommand = this.commandHistory.pop();
        if (lastCommand && lastCommand.undo) {
            return lastCommand.undo();
        }
        return of(null);
    }
}
```

---

## 📋 Resumen de Beneficios

| Patrón | Beneficio Principal | Caso de Uso |
|--------|-------------------|-------------|
| Repository | Abstracción de datos | CRUD operations |
| Observer | Reactividad | Real-time updates |
| Strategy | Flexibilidad | Multiple algorithms |
| Factory | Creación centralizada | Dynamic configurations |
| Decorator | Funcionalidad adicional | Cross-cutting concerns |
| Command | Desacoplamiento | Undo/Redo operations |

Estos patrones trabajan juntos para crear una arquitectura robusta, mantenible y escalable.