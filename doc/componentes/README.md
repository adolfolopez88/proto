# Componentes Genéricos

## 🧩 Visión General

Los componentes genéricos proporcionan funcionalidad reutilizable y altamente configurable para acelerar el desarrollo y mantener consistencia en la UI.

## 📋 Componentes Implementados

### 1. [GenericTable](#generictable)
- Tabla con paginación, filtros y ordenamiento
- Acciones personalizables
- Selección múltiple

### 2. [GenericForm](#genericform)
- Formularios dinámicos configurables
- Validaciones automáticas
- Campos condicionales

---

## 📊 GenericTable

### Ubicación
`src/app/shared/components/generic-table/`

### Características Principales

- ✅ Paginación automática
- ✅ Filtros por columna
- ✅ Ordenamiento
- ✅ Selección múltiple
- ✅ Acciones personalizables
- ✅ Exportación de datos
- ✅ Densidad de tabla configurable
- ✅ Responsive design

### Uso Básico

```typescript
@Component({
    template: `
        <app-generic-table 
            [data]="products"
            [config]="tableConfig"
            [loading]="isLoading"
            [totalCount]="totalProducts"
            (rowClick)="onRowClick($event)"
            (actionClick)="onActionClick($event)"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)">
        </app-generic-table>
    `
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    isLoading = false;
    totalProducts = 0;
    
    tableConfig: TableConfig = {
        columns: [
            { key: 'name', label: 'Product Name', sortable: true, filterable: true },
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
                    { 
                        key: 'delete', 
                        label: 'Delete', 
                        icon: 'delete', 
                        color: 'warn',
                        disabled: (row) => row.isActive === false
                    }
                ]
            }
        ],
        pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25, 50]
        },
        selectable: true,
        multiSelect: true,
        sorting: true,
        filtering: true,
        exportable: true,
        density: 'standard'
    };

    constructor(private productService: ProductService) {}

    ngOnInit(): void {
        this.loadProducts();
    }

    onRowClick(product: Product): void {
        console.log('Row clicked:', product);
        // Navegar a detalle del producto
    }

    onActionClick(event: {action: string, row: Product}): void {
        switch (event.action) {
            case 'edit':
                this.editProduct(event.row);
                break;
            case 'delete':
                this.deleteProduct(event.row);
                break;
        }
    }

    onPageChange(event: PageEvent): void {
        this.loadProducts(event.pageIndex, event.pageSize);
    }

    onSortChange(sort: Sort): void {
        this.loadProducts(0, 10, sort);
    }

    private loadProducts(page = 0, size = 10, sort?: Sort): void {
        this.isLoading = true;
        
        const options: QueryOptions = {
            limit: size,
            page: page
        };

        if (sort && sort.direction) {
            options.sort = [{ field: sort.active, direction: sort.direction }];
        }

        this.productService.getAll(options).subscribe({
            next: (response) => {
                if (response.success) {
                    this.products = response.data || [];
                    this.totalProducts = response.metadata?.totalCount || 0;
                }
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
}
```

### Configuración de Columnas

#### Tipos de Columna Soportados

```typescript
const tableConfig: TableConfig = {
    columns: [
        // Texto simple
        { key: 'name', label: 'Name', type: 'text' },
        
        // Número
        { key: 'quantity', label: 'Quantity', type: 'number' },
        
        // Moneda
        { key: 'price', label: 'Price', type: 'currency' },
        
        // Fecha
        { key: 'createdAt', label: 'Created', type: 'date' },
        
        // Boolean
        { key: 'isActive', label: 'Active', type: 'boolean' },
        
        // Acciones personalizadas
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                {
                    key: 'view',
                    label: 'View',
                    icon: 'visibility',
                    color: 'primary'
                },
                {
                    key: 'edit',
                    label: 'Edit',
                    icon: 'edit',
                    color: 'accent',
                    disabled: (row) => row.readonly === true
                },
                {
                    key: 'delete',
                    label: 'Delete',
                    icon: 'delete',
                    color: 'warn',
                    visible: (row) => row.canDelete === true
                }
            ]
        }
    ]
};
```

#### Configuración de Paginación

```typescript
const paginationConfig = {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
};
```

#### Selección de Filas

```typescript
// En el componente
onSelectionChange(selectedRows: Product[]): void {
    console.log('Selected products:', selectedRows);
    this.selectedProducts = selectedRows;
}

// En el template
<app-generic-table
    [config]="tableConfig"
    (selectionChange)="onSelectionChange($event)">
</app-generic-table>
```

### Filtros Avanzados

```typescript
// Los filtros se pueden aplicar globalmente o por columna
onFilterChange(filters: {[key: string]: any}): void {
    console.log('Applied filters:', filters);
    this.applyFilters(filters);
}

private applyFilters(filters: {[key: string]: any}): void {
    const queryOptions: QueryOptions = {
        filters: Object.keys(filters).map(key => ({
            field: key,
            operator: '==',
            value: filters[key]
        }))
    };
    
    this.loadProducts(0, 10, undefined, queryOptions);
}
```

---

## 📝 GenericForm

### Ubicación
`src/app/shared/components/generic-form/`

### Características Principales

- ✅ Formularios dinámicos basados en configuración
- ✅ Validaciones automáticas y personalizadas
- ✅ Campos condicionales
- ✅ Múltiples layouts (vertical, horizontal, grid)
- ✅ Tipos de campo extensivos
- ✅ Estados de carga
- ✅ Integración con Angular Reactive Forms

### Uso Básico

```typescript
@Component({
    template: `
        <app-generic-form
            [config]="formConfig"
            [initialData]="userData"
            [loading]="isSubmitting"
            (formSubmit)="onSubmit($event)"
            (formChange)="onFormChange($event)"
            (fieldChange)="onFieldChange($event)">
        </app-generic-form>
    `
})
export class UserFormComponent {
    userData: Partial<User> = {};
    isSubmitting = false;

    formConfig: FormConfig = {
        layout: 'grid',
        columns: 2,
        appearance: 'outline',
        submitLabel: 'Create User',
        showReset: true,
        fields: [
            {
                key: 'firstName',
                type: 'text',
                label: 'First Name',
                placeholder: 'Enter first name',
                required: true,
                icon: 'person'
            },
            {
                key: 'lastName',
                type: 'text',
                label: 'Last Name',
                placeholder: 'Enter last name',
                required: true
            },
            {
                key: 'email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'user@example.com',
                required: true,
                validators: [Validators.email]
            },
            {
                key: 'phone',
                type: 'text',
                label: 'Phone Number',
                placeholder: '+1 (555) 123-4567',
                validators: [ValidationService.phoneValidator()]
            },
            {
                key: 'birthDate',
                type: 'date',
                label: 'Birth Date',
                max: new Date(),
                hint: 'You must be 18 or older'
            },
            {
                key: 'role',
                type: 'select',
                label: 'User Role',
                required: true,
                options: [
                    { label: 'Administrator', value: 'admin' },
                    { label: 'Manager', value: 'manager' },
                    { label: 'User', value: 'user' }
                ]
            },
            {
                key: 'permissions',
                type: 'multiselect',
                label: 'Permissions',
                options: [
                    { label: 'Read Users', value: 'users.read' },
                    { label: 'Write Users', value: 'users.write' },
                    { label: 'Delete Users', value: 'users.delete' }
                ],
                // Campo condicional - solo mostrar si es admin
                conditional: {
                    field: 'role',
                    value: 'admin'
                }
            },
            {
                key: 'bio',
                type: 'textarea',
                label: 'Biography',
                placeholder: 'Tell us about yourself...',
                rows: 4,
                hint: 'Optional personal information'
            },
            {
                key: 'avatar',
                type: 'file',
                label: 'Profile Picture',
                accept: 'image/*',
                hint: 'Upload a profile picture (max 2MB)'
            },
            {
                key: 'isActive',
                type: 'toggle',
                label: 'Account Active',
                value: true
            },
            {
                key: 'notifications',
                type: 'checkbox',
                label: 'Receive email notifications',
                value: true
            }
        ]
    };

    onSubmit(formData: any): void {
        console.log('Form submitted:', formData);
        this.isSubmitting = true;

        this.userService.create(formData).subscribe({
            next: (response) => {
                if (response.success) {
                    console.log('User created successfully');
                    // Reset form or navigate away
                }
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Failed to create user:', error);
                this.isSubmitting = false;
            }
        });
    }

    onFormChange(formValue: any): void {
        console.log('Form changed:', formValue);
        // Realizar validaciones en tiempo real si es necesario
    }

    onFieldChange(change: {field: string, value: any}): void {
        console.log(`Field ${change.field} changed to:`, change.value);
        
        // Ejemplo: actualizar opciones basado en otro campo
        if (change.field === 'role' && change.value === 'admin') {
            this.loadAdminPermissions();
        }
    }
}
```

### Tipos de Campo Soportados

#### Campos de Texto

```typescript
// Input básico
{ key: 'name', type: 'text', label: 'Name' }

// Email con validación automática
{ key: 'email', type: 'email', label: 'Email' }

// Password
{ key: 'password', type: 'password', label: 'Password' }

// Textarea
{ key: 'description', type: 'textarea', label: 'Description', rows: 4 }
```

#### Campos Numéricos

```typescript
// Número con restricciones
{
    key: 'age',
    type: 'number',
    label: 'Age',
    min: 18,
    max: 100,
    step: 1
}

// Precio con formato
{
    key: 'price',
    type: 'number',
    label: 'Price',
    min: 0,
    step: 0.01,
    prefix: '$'
}
```

#### Campos de Selección

```typescript
// Select simple
{
    key: 'category',
    type: 'select',
    label: 'Category',
    options: [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Books', value: 'books' }
    ]
}

// Multi-select
{
    key: 'tags',
    type: 'multiselect',
    label: 'Tags',
    options: [
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Sale', value: 'sale' }
    ]
}

// Autocomplete
{
    key: 'city',
    type: 'autocomplete',
    label: 'City',
    options: [
        { label: 'New York', value: 'ny' },
        { label: 'Los Angeles', value: 'la' },
        { label: 'Chicago', value: 'chi' }
    ]
}

// Radio buttons
{
    key: 'gender',
    type: 'radio',
    label: 'Gender',
    options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ]
}
```

#### Campos de Fecha

```typescript
// Date picker básico
{ key: 'startDate', type: 'date', label: 'Start Date' }

// Con restricciones
{
    key: 'endDate',
    type: 'date',
    label: 'End Date',
    min: new Date(),
    max: new Date(2025, 11, 31)
}
```

#### Campos Booleanos

```typescript
// Checkbox
{ key: 'agree', type: 'checkbox', label: 'I agree to terms' }

// Toggle switch
{ key: 'isActive', type: 'toggle', label: 'Active Status' }
```

#### Campos de Archivo

```typescript
// File upload
{
    key: 'document',
    type: 'file',
    label: 'Upload Document',
    accept: '.pdf,.doc,.docx',
    hint: 'PDF or Word documents only'
}

// Image upload
{
    key: 'photo',
    type: 'file',
    label: 'Profile Photo',
    accept: 'image/*'
}
```

### Campos Condicionales

```typescript
const formConfig: FormConfig = {
    fields: [
        {
            key: 'hasDriverLicense',
            type: 'checkbox',
            label: 'Has Driver License'
        },
        {
            key: 'licenseNumber',
            type: 'text',
            label: 'License Number',
            required: true,
            // Solo mostrar si tiene licencia
            conditional: {
                field: 'hasDriverLicense',
                value: true
            }
        },
        {
            key: 'experienceYears',
            type: 'number',
            label: 'Years of Experience',
            // Solo mostrar si tiene licencia y es mayor a 5 años
            conditional: {
                field: 'licenseNumber',
                operator: '!=',
                value: null
            }
        }
    ]
};
```

### Validaciones Personalizadas

```typescript
// Usando el ValidationService
{
    key: 'password',
    type: 'password',
    label: 'Password',
    validators: [
        Validators.required,
        ValidationService.passwordValidator()
    ]
}

// Confirmación de password
{
    key: 'confirmPassword',
    type: 'password',
    label: 'Confirm Password',
    validators: [
        Validators.required,
        ValidationService.confirmPasswordValidator('password')
    ]
}

// Validación de teléfono
{
    key: 'phone',
    type: 'text',
    label: 'Phone Number',
    validators: [ValidationService.phoneValidator()]
}
```

### Layouts Disponibles

#### Layout Vertical (Default)
```typescript
const formConfig: FormConfig = {
    layout: 'vertical',
    fields: [...]
};
```

#### Layout Horizontal
```typescript
const formConfig: FormConfig = {
    layout: 'horizontal',
    fields: [...]
};
```

#### Layout Grid
```typescript
const formConfig: FormConfig = {
    layout: 'grid',
    columns: 3, // 3 columnas
    fields: [...]
};
```

### Manejo de Estados

```typescript
@Component({...})
export class DynamicFormComponent {
    formComponent!: GenericFormComponent;

    // Verificar validez del formulario
    get isFormValid(): boolean {
        return this.formComponent.isFormValid;
    }

    // Verificar si hay cambios
    get hasUnsavedChanges(): boolean {
        return this.formComponent.isFormDirty;
    }

    // Obtener valores del formulario
    getFormData(): any {
        return this.formComponent.formValue;
    }

    // Reset programático
    resetForm(): void {
        this.formComponent.onReset();
    }
}
```

---

## 🎨 Personalización de Estilos

### Variables CSS Disponibles

```scss
// En tu styles.scss
:root {
    // Colores de tabla
    --table-header-bg: #f5f5f5;
    --table-row-hover: #f9f9f9;
    --table-border: #e0e0e0;
    
    // Colores de formulario
    --form-field-border: #ccc;
    --form-field-focus: #2196f3;
    --form-error-color: #f44336;
}
```

### Clases CSS Personalizables

```scss
// Personalizar tabla
.generic-table-container {
    .table-toolbar {
        background: var(--primary-color);
    }
    
    .actions-cell button {
        margin-right: 4px;
    }
}

// Personalizar formulario
.generic-form {
    .form-actions {
        justify-content: flex-end;
    }
    
    &.layout-grid {
        gap: 20px;
    }
}
```

## 🧪 Testing

### Testing de Componentes

```typescript
describe('GenericTableComponent', () => {
    let component: GenericTableComponent;
    let fixture: ComponentFixture<GenericTableComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GenericTableComponent],
            imports: [SharedModule]
        });

        fixture = TestBed.createComponent(GenericTableComponent);
        component = fixture.componentInstance;
    });

    it('should display data correctly', () => {
        const testData = [
            { id: 1, name: 'Test Product', price: 100 }
        ];
        
        component.data = testData;
        component.config = mockTableConfig;
        fixture.detectChanges();

        expect(component.dataSource.data).toEqual(testData);
    });

    it('should emit row click events', () => {
        spyOn(component.rowClick, 'emit');
        
        const testRow = { id: 1, name: 'Test' };
        component.onRowClick(testRow);
        
        expect(component.rowClick.emit).toHaveBeenCalledWith(testRow);
    });
});
```

### Mocks para Testing

```typescript
export const mockTableConfig: TableConfig = {
    columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'price', label: 'Price', type: 'currency' }
    ],
    pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 25] }
};

export const mockFormConfig: FormConfig = {
    fields: [
        { key: 'name', type: 'text', label: 'Name', required: true },
        { key: 'email', type: 'email', label: 'Email', required: true }
    ]
};
```

---

## 📚 Ejemplos Completos

Ver carpeta `doc/componentes/ejemplos/` para implementaciones completas y casos de uso avanzados.