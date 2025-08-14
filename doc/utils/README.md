# Servicios Utilitarios

## 🔧 Visión General

Los servicios utilitarios proporcionan funcionalidades transversales y herramientas comunes que facilitan el desarrollo y mantienen la consistencia en toda la aplicación.

## 📋 Servicios Implementados

### 1. [ValidationService](#validationservice)
- Validadores personalizados para formularios
- Utilidades de validación
- Mensajes de error consistentes

### 2. [UtilsService](#utilsservice)
- Funciones auxiliares para strings, arrays, objetos
- Utilidades de fecha y formato
- Helpers de performance

### 3. [ErrorHandlerService](#errorhandlerservice)
- Manejo centralizado de errores
- Logging y reportes
- Clasificación por severidad

---

## ✅ ValidationService

### Ubicación
`src/app/core/services/utils/validation.service.ts`

### Validadores Personalizados

#### Password Validator

```typescript
// Validador para passwords seguros
{
    key: 'password',
    type: 'password',
    label: 'Password',
    validators: [
        Validators.required,
        ValidationService.passwordValidator()
    ]
}

// Maneja automáticamente:
// - Mínimo 8 caracteres
// - Al menos una mayúscula
// - Al menos una minúscula
// - Al menos un número
// - Al menos un carácter especial
```

#### Confirmación de Password

```typescript
// Formulario con confirmación
const formConfig: FormConfig = {
    fields: [
        {
            key: 'password',
            type: 'password',
            label: 'Password',
            validators: [ValidationService.passwordValidator()]
        },
        {
            key: 'confirmPassword',
            type: 'password',
            label: 'Confirm Password',
            validators: [
                Validators.required,
                ValidationService.confirmPasswordValidator('password')
            ]
        }
    ]
};
```

#### Validador de Teléfono

```typescript
// Campo con validación de teléfono
{
    key: 'phone',
    type: 'text',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    validators: [ValidationService.phoneValidator()]
}

// Acepta formatos:
// +1234567890
// (555) 123-4567
// 555-123-4567
```

#### Validador de URL

```typescript
{
    key: 'website',
    type: 'text',
    label: 'Website',
    validators: [ValidationService.urlValidator()]
}

// Valida URLs completas:
// https://example.com
// http://subdomain.example.com
// https://example.com/path?query=value
```

#### Validadores de Archivos

```typescript
// Validación por tipo de archivo
{
    key: 'document',
    type: 'file',
    label: 'Upload Document',
    validators: [
        ValidationService.fileTypeValidator(['pdf', 'doc', 'docx'])
    ]
}

// Validación por tamaño
{
    key: 'image',
    type: 'file',
    label: 'Profile Image',
    validators: [
        ValidationService.fileTypeValidator(['jpg', 'png', 'gif']),
        ValidationService.fileSizeValidator(2) // 2MB máximo
    ]
}
```

#### Validadores de Fecha

```typescript
// Fecha mínima (ej: mayoría de edad)
{
    key: 'birthDate',
    type: 'date',
    label: 'Birth Date',
    validators: [
        ValidationService.maxDateValidator(
            new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
        )
    ]
}

// Rango de fechas
const formGroup = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', [
        Validators.required,
        ValidationService.dateRangeValidator('startDate', 'endDate')
    ]]
});
```

#### Validador de Tarjeta de Crédito

```typescript
{
    key: 'creditCard',
    type: 'text',
    label: 'Credit Card Number',
    placeholder: '1234 5678 9012 3456',
    validators: [ValidationService.creditCardValidator()]
}

// Utiliza algoritmo de Luhn para validación
```

#### Validadores de Arrays

```typescript
// Mínimo de elementos seleccionados
{
    key: 'skills',
    type: 'multiselect',
    label: 'Select Skills',
    validators: [
        ValidationService.arrayMinLengthValidator(3) // Mínimo 3 skills
    ],
    options: skillOptions
}

// Máximo de elementos
{
    key: 'categories',
    type: 'multiselect',
    label: 'Categories',
    validators: [
        ValidationService.arrayMaxLengthValidator(5) // Máximo 5 categorías
    ],
    options: categoryOptions
}
```

### Mensajes de Error Personalizados

```typescript
// Obtener mensaje de error apropiado
getErrorMessage(control: AbstractControl): string {
    if (control.errors) {
        const errorKey = Object.keys(control.errors)[0];
        const errorValue = control.errors[errorKey];
        
        return ValidationService.getValidatorErrorMessage(errorKey, errorValue);
    }
    return '';
}

// Ejemplo de uso en componente
@Component({
    template: `
        <mat-error *ngIf="passwordControl.invalid && passwordControl.touched">
            {{ getPasswordError() }}
        </mat-error>
    `
})
export class CustomFormComponent {
    getPasswordError(): string {
        const errors = this.passwordControl.errors;
        if (errors?.['passwordRequirements']) {
            const reqs = errors['passwordRequirements'];
            const missing = [];
            
            if (!reqs.hasNumber) missing.push('a number');
            if (!reqs.hasUpper) missing.push('an uppercase letter');
            if (!reqs.hasLower) missing.push('a lowercase letter');
            if (!reqs.hasSpecial) missing.push('a special character');
            if (!reqs.isValidLength) missing.push('at least 8 characters');
            
            return `Password must contain ${missing.join(', ')}`;
        }
        
        return ValidationService.getValidatorErrorMessage('password', errors);
    }
}
```

### Utilidades de Validación

```typescript
@Injectable()
export class FormValidationHelper {
    constructor(private validationService: ValidationService) {}

    // Verificar email
    isValidEmail(email: string): boolean {
        return this.validationService.isEmail(email);
    }

    // Verificar teléfono
    isValidPhone(phone: string): boolean {
        return this.validationService.isPhoneNumber(phone);
    }

    // Verificar URL
    isValidUrl(url: string): boolean {
        return this.validationService.isUrl(url);
    }

    // Verificar password seguro
    isStrongPassword(password: string): boolean {
        return this.validationService.isStrongPassword(password);
    }

    // Sanitizar entrada
    sanitizeInput(input: string): string {
        return this.validationService.sanitizeInput(input);
    }
}
```

---

## 🛠️ UtilsService

### Ubicación
`src/app/core/services/utils/utils.service.ts`

### Utilidades de String

```typescript
@Component({...})
export class StringExamplesComponent {
    constructor(private utils: UtilsService) {}

    examples(): void {
        // Capitalizar
        const name = this.utils.capitalize('john doe'); // "John doe"
        
        // Conversiones de caso
        const camelCase = this.utils.camelCase('user-name'); // "userName"
        const kebabCase = this.utils.kebabCase('userName'); // "user-name"
        const snakeCase = this.utils.snakeCase('userName'); // "user_name"
        
        // Truncar texto
        const truncated = this.utils.truncate('Lorem ipsum dolor sit', 10); // "Lorem i..."
        
        // Crear slug para URLs
        const slug = this.utils.slugify('Hello World! @#$'); // "hello-world"
        
        // Remover acentos
        const clean = this.utils.removeAccents('José María'); // "Jose Maria"
    }
}
```

### Utilidades de Array

```typescript
@Component({...})
export class ArrayExamplesComponent {
    products: Product[] = [...];
    
    constructor(private utils: UtilsService) {}

    processProducts(): void {
        // Eliminar duplicados
        const uniqueCategories = this.utils.unique(
            this.products.map(p => p.category)
        );

        // Agrupar por categoría
        const grouped = this.utils.groupBy(this.products, p => p.category);
        console.log(grouped);
        // { electronics: [...], clothing: [...] }

        // Ordenar por precio
        const sorted = this.utils.sortBy(this.products, 'price', 'asc');

        // Dividir en chunks para paginación
        const chunks = this.utils.chunk(this.products, 10); // Páginas de 10

        // Aplanar arrays anidados
        const nestedArray = [[1, 2], [3, 4], [5]];
        const flat = this.utils.flatten(nestedArray); // [1, 2, 3, 4, 5]
    }
}
```

### Utilidades de Objeto

```typescript
@Component({...})
export class ObjectExamplesComponent {
    constructor(private utils: UtilsService) {}

    manipulateObjects(): void {
        const user = {
            id: 1,
            profile: {
                name: 'John',
                settings: {
                    theme: 'dark'
                }
            }
        };

        // Deep clone
        const userCopy = this.utils.deepClone(user);

        // Merge profundo
        const updates = { profile: { name: 'Jane', age: 30 } };
        const merged = this.utils.deepMerge(user, updates);

        // Obtener propiedades anidadas
        const theme = this.utils.getNestedProperty(user, 'profile.settings.theme');

        // Establecer propiedades anidadas
        this.utils.setNestedProperty(user, 'profile.settings.language', 'es');

        // Seleccionar propiedades específicas
        const userSummary = this.utils.pick(user, ['id', 'profile']);

        // Omitir propiedades específicas
        const publicUser = this.utils.omit(user, ['password', 'email']);
    }
}
```

### Utilidades de Fecha

```typescript
@Component({
    template: `
        <p>Formatted: {{ formatDate(user.createdAt) }}</p>
        <p>Time ago: {{ getTimeAgo(user.lastLogin) }}</p>
        <p>In range: {{ isInDateRange(event.date) }}</p>
    `
})
export class DateExamplesComponent {
    user: User;
    event: Event;

    constructor(private utils: UtilsService) {}

    formatDate(date: Date): string {
        return this.utils.formatDate(date, 'DD/MM/YYYY HH:mm');
    }

    getTimeAgo(date: Date): string {
        const now = new Date();
        const diff = this.utils.getDateDifference(date, now, 'days');
        return diff === 1 ? 'Yesterday' : `${diff} days ago`;
    }

    isInDateRange(date: Date): boolean {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');
        return this.utils.isDateInRange(date, startDate, endDate);
    }

    addBusinessDays(date: Date, days: number): Date {
        return this.utils.addDays(date, days);
    }
}
```

### Utilidades de Formato

```typescript
@Component({
    template: `
        <div class="product-card">
            <h3>{{ product.name }}</h3>
            <p>Price: {{ formatCurrency(product.price) }}</p>
            <p>Discount: {{ formatPercent(product.discount) }}</p>
            <p>File size: {{ formatFileSize(product.fileSize) }}</p>
        </div>
    `
})
export class ProductCardComponent {
    @Input() product: Product;

    constructor(private utils: UtilsService) {}

    formatCurrency(amount: number): string {
        return this.utils.formatCurrency(amount, 'USD', 'en-US');
    }

    formatPercent(value: number): string {
        return this.utils.formatPercent(value, 1); // 1 decimal
    }

    formatFileSize(bytes: number): string {
        return this.utils.formatFileSize(bytes);
    }

    generateId(): string {
        return this.utils.generateId(12); // ID de 12 caracteres
    }

    generateUUID(): string {
        return this.utils.generateUUID(); // UUID estándar
    }
}
```

### Utilidades de Performance

```typescript
@Component({...})
export class PerformanceExamplesComponent {
    private debouncedSearch: Function;
    private throttledScroll: Function;

    constructor(private utils: UtilsService) {
        // Debounce para búsqueda (espera 300ms después del último keystroke)
        this.debouncedSearch = this.utils.debounce((query: string) => {
            this.performSearch(query);
        }, 300);

        // Throttle para scroll (máximo una ejecución por 100ms)
        this.throttledScroll = this.utils.throttle(() => {
            this.handleScroll();
        }, 100);
    }

    onSearchInput(event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        this.debouncedSearch(query);
    }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.throttledScroll();
    }

    private performSearch(query: string): void {
        console.log('Searching for:', query);
    }

    private handleScroll(): void {
        console.log('Scroll handled');
    }
}
```

### Utilidades de URL y Query String

```typescript
@Component({...})
export class UrlExamplesComponent {
    constructor(
        private utils: UtilsService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    buildSearchUrl(): void {
        const params = {
            category: 'electronics',
            minPrice: 100,
            maxPrice: 500,
            tags: ['new', 'featured']
        };

        const queryString = this.utils.buildQueryString(params);
        // category=electronics&minPrice=100&maxPrice=500&tags=new&tags=featured

        this.router.navigate(['/products'], { 
            queryParams: this.utils.parseQueryString(queryString) 
        });
    }

    parseCurrentUrl(): void {
        const queryParams = this.route.snapshot.queryParams;
        const parsed = this.utils.parseQueryString(window.location.search);
        console.log('Current filters:', parsed);
    }
}
```

---

## 🚨 ErrorHandlerService

### Ubicación
`src/app/core/services/utils/error-handler.service.ts`

### Clasificación por Severidad

#### Manejo Automático por Tipo de Error

```typescript
// El servicio clasifica automáticamente los errores:

// Errores HTTP 400, 422 -> Severidad: low
// Errores HTTP 401, 403 -> Severidad: medium  
// Errores HTTP 404 -> Severidad: low
// Errores HTTP 500+ -> Severidad: high

// Errores de Firebase Auth -> Severidad: medium
// Errores de Firestore -> Severidad: high
// Errores de JavaScript -> Severidad: high
```

#### Manejo Manual de Errores

```typescript
@Component({...})
export class DataProcessingComponent {
    constructor(private errorHandler: ErrorHandlerService) {}

    processData(): void {
        try {
            // Operación compleja
            this.performComplexOperation();
        } catch (error) {
            // Reportar error manualmente
            this.errorHandler.reportManualError(
                'Failed to process data',
                { operation: 'complex-calculation', data: this.inputData },
                'high' // severidad
            );
        }
    }

    handleValidationErrors(errors: ValidationError[]): void {
        errors.forEach(error => {
            this.errorHandler.reportManualError(
                `Validation failed: ${error.message}`,
                { field: error.field, value: error.value },
                'low' // errores de validación son menos críticos
            );
        });
    }
}
```

### Logging y Monitoreo

```typescript
// Obtener log de errores para debugging
@Component({
    template: `
        <div class="error-dashboard">
            <h3>Error Statistics</h3>
            <p>Total errors: {{ getTotalErrors() }}</p>
            <p>Critical errors: {{ getCriticalErrors().length }}</p>
            
            <mat-expansion-panel>
                <mat-expansion-panel-header>
                    Recent Errors
                </mat-expansion-panel-header>
                <div *ngFor="let error of getRecentErrors()">
                    <div class="error-item" [class]="'severity-' + error.severity">
                        <strong>{{ error.message }}</strong>
                        <small>{{ error.timestamp | date:'short' }}</small>
                    </div>
                </div>
            </mat-expansion-panel>
        </div>
    `
})
export class ErrorDashboardComponent {
    constructor(private errorHandler: ErrorHandlerService) {}

    getTotalErrors(): number {
        return this.errorHandler.getErrorLog().length;
    }

    getCriticalErrors(): ErrorInfo[] {
        return this.errorHandler.getErrorsBySeverity('critical');
    }

    getRecentErrors(): ErrorInfo[] {
        return this.errorHandler.getErrorLog()
            .slice(-10) // Últimos 10 errores
            .reverse(); // Más recientes primero
    }

    getErrorsByType(type: string): ErrorInfo[] {
        return this.errorHandler.getErrorsByType(type);
    }

    clearLogs(): void {
        this.errorHandler.clearErrorLog();
    }
}
```

### Manejo de Errores Específicos de Firebase

```typescript
// El servicio maneja automáticamente errores de Firebase
// con mensajes user-friendly:

@Component({...})
export class AuthComponent {
    constructor(
        private authService: AuthService,
        private errorHandler: ErrorHandlerService
    ) {}

    signIn(): void {
        this.authService.signIn(credentials).subscribe({
            error: (error) => {
                // ErrorHandlerService ya procesó el error y mostró
                // un mensaje apropiado al usuario:
                // "auth/user-not-found" -> "No account found with this email"
                // "auth/wrong-password" -> "Incorrect password"
                // etc.
            }
        });
    }
}
```

### Integración con Servicios de Monitoreo

```typescript
// Configuración para envío a servicios externos
@Injectable()
export class ExternalErrorReporting {
    constructor(private errorHandler: ErrorHandlerService) {
        // Escuchar errores críticos para reportar
        this.setupExternalReporting();
    }

    private setupExternalReporting(): void {
        // Simular integración con Sentry, LogRocket, etc.
        setInterval(() => {
            const criticalErrors = this.errorHandler.getErrorsBySeverity('critical');
            const highErrors = this.errorHandler.getErrorsBySeverity('high');
            
            if (criticalErrors.length > 0 || highErrors.length > 0) {
                this.reportToExternalService([...criticalErrors, ...highErrors]);
                // Limpiar errores reportados
                this.errorHandler.clearErrorLog();
            }
        }, 60000); // Cada minuto
    }

    private reportToExternalService(errors: ErrorInfo[]): void {
        // Integración con servicio de monitoreo
        console.log('Reporting errors to external service:', errors);
        
        // Ejemplo con Sentry:
        // errors.forEach(error => {
        //     Sentry.captureException(new Error(error.message), {
        //         level: error.severity,
        //         contexts: {
        //             error: error.context
        //         }
        //     });
        // });
    }
}
```

---

## 🧪 Testing

### Testing de Validadores

```typescript
describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValidationService);
    });

    describe('passwordValidator', () => {
        it('should accept strong password', () => {
            const control = new FormControl('SecurePass123!');
            const validator = ValidationService.passwordValidator();
            const result = validator(control);
            
            expect(result).toBeNull();
        });

        it('should reject weak password', () => {
            const control = new FormControl('weak');
            const validator = ValidationService.passwordValidator();
            const result = validator(control);
            
            expect(result).toEqual({
                passwordRequirements: jasmine.objectContaining({
                    hasNumber: false,
                    hasUpper: false,
                    isValidLength: false
                })
            });
        });
    });

    describe('phoneValidator', () => {
        it('should accept valid phone numbers', () => {
            const validator = ValidationService.phoneValidator();
            
            expect(validator(new FormControl('+1234567890'))).toBeNull();
            expect(validator(new FormControl('1234567890'))).toBeNull();
        });

        it('should reject invalid phone numbers', () => {
            const validator = ValidationService.phoneValidator();
            
            expect(validator(new FormControl('invalid'))).toEqual({
                invalidPhone: true
            });
        });
    });
});
```

### Testing de UtilsService

```typescript
describe('UtilsService', () => {
    let service: UtilsService;

    beforeEach(() => {
        service = TestBed.inject(UtilsService);
    });

    describe('string utilities', () => {
        it('should capitalize strings correctly', () => {
            expect(service.capitalize('hello world')).toBe('Hello world');
            expect(service.capitalize('HELLO')).toBe('Hello');
        });

        it('should convert to camelCase', () => {
            expect(service.camelCase('hello-world')).toBe('helloWorld');
            expect(service.camelCase('hello_world')).toBe('helloWorld');
        });
    });

    describe('array utilities', () => {
        it('should remove duplicates', () => {
            const input = [1, 2, 2, 3, 3, 3];
            expect(service.unique(input)).toEqual([1, 2, 3]);
        });

        it('should group by key', () => {
            const input = [
                { category: 'A', name: 'item1' },
                { category: 'B', name: 'item2' },
                { category: 'A', name: 'item3' }
            ];
            
            const result = service.groupBy(input, item => item.category);
            expect(Object.keys(result)).toEqual(['A', 'B']);
            expect(result['A']).toHaveLength(2);
        });
    });
});
```

---

## 🎯 Mejores Prácticas

### ValidationService
1. **Consistencia**: Usa validadores estándar para casos comunes
2. **Reutilización**: Combina validadores para casos complejos
3. **UX**: Proporciona mensajes de error claros y específicos

### UtilsService  
1. **Pure Functions**: Mantén las funciones sin efectos secundarios
2. **Performance**: Usa debounce/throttle para operaciones costosas
3. **Type Safety**: Mantén tipado fuerte en TypeScript

### ErrorHandlerService
1. **Clasificación**: Clasifica errores apropiadamente por severidad
2. **Context**: Incluye contexto útil para debugging
3. **User Experience**: No todos los errores necesitan notificar al usuario

---

## 🔗 Integración con Otros Servicios

Los servicios utilitarios se integran seamlessly con:
- **GenericForm**: Validadores automáticos
- **GenericTable**: Formateo de datos
- **Guards**: Validación de permisos
- **Interceptors**: Manejo de errores HTTP