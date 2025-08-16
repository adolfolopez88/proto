# Generic Components System

This directory contains reusable generic components, services, and utilities that provide a consistent and efficient development experience across the application.

## Overview

The generic components system follows the architectural principles established in the Fuse template, providing:

- **Consistency**: Uniform UI components and behavior patterns
- **Reusability**: Components that can be easily configured for different use cases
- **Type Safety**: Full TypeScript support with proper typing
- **Performance**: Optimized components with OnPush change detection
- **Accessibility**: ARIA-compliant components following Material Design guidelines

## Components

### 1. GenericTable Component

A powerful, configurable data table component with advanced features.

#### Features
- **Pagination**: Configurable page sizes and navigation
- **Sorting**: Multi-column sorting with visual indicators
- **Filtering**: Global and column-specific filtering
- **Selection**: Single or multi-row selection with callbacks
- **Actions**: Configurable row actions with conditional visibility
- **Export**: CSV, Excel, and PDF export capabilities
- **Responsive**: Mobile-friendly with density options
- **Loading States**: Built-in loading indicators

#### Usage Example
```typescript
import { TableConfig, TableColumn } from '@app/shared';

// Component configuration
tableConfig: TableConfig = {
  columns: [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', type: 'email', sortable: true },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
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
  selectable: true,
  multiSelect: true,
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  },
  sorting: true,
  filtering: true,
  exportable: true
};

// Template usage
<app-generic-table
  [data]="users"
  [config]="tableConfig"
  [loading]="loading"
  [totalCount]="totalUsers"
  (rowClick)="onRowClick($event)"
  (actionClick)="onActionClick($event)"
  (selectionChange)="onSelectionChange($event)">
</app-generic-table>
```

### 2. DynamicForm Component

A flexible form generator that creates reactive forms from configuration objects.

#### Features
- **Dynamic Field Types**: Text, email, password, number, select, checkbox, radio, date, file inputs
- **Conditional Logic**: Show/hide fields based on other field values
- **Validation**: Built-in and custom validators with error messages
- **Layouts**: Vertical, horizontal, and grid layouts
- **Accessibility**: Full ARIA support and keyboard navigation
- **File Handling**: File upload with validation and preview
- **Responsive**: Mobile-optimized field layouts

#### Usage Example
```typescript
import { FormConfig, FormFieldConfig } from '@app/shared';

// Form configuration
formConfig: FormConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
      placeholder: 'Enter your first name'
    },
    {
      key: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validators: [ValidationService.emailValidator()]
    },
    {
      key: 'notifications',
      type: 'checkbox',
      label: 'Receive email notifications'
    },
    {
      key: 'notificationFrequency',
      type: 'select',
      label: 'Notification Frequency',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' }
      ],
      conditional: {
        field: 'notifications',
        value: true
      }
    }
  ],
  layout: 'vertical',
  submitText: 'Save User',
  showReset: true
};

// Template usage
<app-dynamic-form
  [config]="formConfig"
  [initialData]="userData"
  [loading]="saving"
  (formSubmit)="onFormSubmit($event)"
  (formChange)="onFormChange($event)">
</app-dynamic-form>
```

### 3. ConfirmDialog Component

A reusable confirmation dialog with customizable types and actions.

#### Features
- **Multiple Types**: Info, warning, danger, success with appropriate styling
- **Confirmation Requirements**: Optional text confirmation for destructive actions
- **Customizable**: Custom titles, messages, and button texts
- **Icons**: Contextual icons for different dialog types
- **Keyboard Support**: ESC to cancel, Enter to confirm

#### Usage Example
```typescript
import { ConfirmDialogComponent, ConfirmDialogData } from '@app/shared';

// Service injection
constructor(private dialog: MatDialog) {}

// Open confirmation dialog
openDeleteConfirmation(user: User): void {
  const dialogData: ConfirmDialogData = {
    title: 'Delete User',
    message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
    type: 'danger',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    requireConfirmation: true,
    confirmationText: user.name,
    icon: 'delete_forever'
  };

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: dialogData,
    maxWidth: '500px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.deleteUser(user);
    }
  });
}
```

## Services

### 1. LoadingService

Global loading state management with progress tracking and multiple concurrent operations.

#### Features
- **Multiple Loading States**: Track different operations independently
- **Progress Tracking**: Monitor progress of long-running operations
- **Overlay Management**: Automatic loading overlays with backdrop
- **Promise Integration**: Execute operations with automatic loading states

#### Usage Example
```typescript
import { LoadingService } from '@app/shared';

constructor(private loadingService: LoadingService) {}

async saveUser(userData: any): Promise<void> {
  // Simple loading state
  this.loadingService.setLoading('save-user', true);
  
  try {
    await this.userService.saveUser(userData);
  } finally {
    this.loadingService.setLoading('save-user', false);
  }
}

// Or with automatic handling
async loadData(): Promise<void> {
  await this.loadingService.executeWithLoading(
    'load-data',
    () => this.dataService.loadData(),
    'Loading user data...'
  );
}

// Progress tracking
async bulkOperation(): Promise<void> {
  const tasks = users.map(user => () => this.processUser(user));
  
  await this.loadingService.executeWithProgress(
    'bulk-process',
    tasks,
    'Processing users...'
  );
}
```

### 2. ValidationService

Comprehensive validation service with custom validators and error message generation.

#### Features
- **Built-in Validators**: Email, phone, URL, password strength, file validation
- **Custom Validators**: Extensible validation system
- **Error Messages**: Localized error message generation
- **Async Validation**: Support for server-side validation
- **Form Integration**: Easy integration with reactive forms

#### Usage Example
```typescript
import { ValidationService } from '@app/shared';
import { FormBuilder, Validators } from '@angular/forms';

// Form with custom validators
userForm = this.fb.group({
  email: ['', [
    Validators.required,
    ValidationService.emailValidator()
  ]],
  password: ['', [
    Validators.required,
    ValidationService.passwordValidator(8, true, true, true, true)
  ]],
  confirmPassword: ['', Validators.required],
  phone: ['', ValidationService.phoneValidator()],
  website: ['', ValidationService.urlValidator(true)],
  avatar: ['', [
    ValidationService.fileSizeValidator(5),
    ValidationService.fileTypeValidator(['image/jpeg', 'image/png'])
  ]]
}, {
  validators: ValidationService.passwordMatchValidator('password', 'confirmPassword')
});

// Get error messages
getFieldError(fieldName: string): string {
  const control = this.userForm.get(fieldName);
  if (control?.errors && (control.dirty || control.touched)) {
    return ValidationService.getErrorMessage(control.errors, fieldName);
  }
  return '';
}
```

## Types and Interfaces

### BaseDocument Interface
```typescript
export interface BaseDocument {
  id: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
}
```

### Generic Service Interface
```typescript
export interface GenericService<T extends BaseDocument> {
  create(data: Omit<T, 'id'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(filters?: any): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  search(query: string, filters?: any): Promise<T[]>;
}
```

## Best Practices

### 1. Component Configuration
- Use TypeScript interfaces for configuration objects
- Provide sensible defaults for optional properties
- Document all configuration options with JSDoc comments

### 2. Error Handling
- Always handle async operations with try-catch blocks
- Provide meaningful error messages to users
- Log errors for debugging while hiding sensitive information

### 3. Performance
- Use OnPush change detection strategy when possible
- Implement virtual scrolling for large datasets
- Lazy load heavy components and data

### 4. Accessibility
- Include proper ARIA labels and descriptions
- Ensure keyboard navigation works correctly
- Test with screen readers
- Maintain proper color contrast ratios

### 5. Internationalization
- Use Angular i18n for all user-facing text
- Provide translation keys in component configurations
- Support RTL languages when necessary

## Integration Examples

### User Management Integration
```typescript
// user-management.component.ts
export class UserManagementComponent {
  tableConfig: TableConfig = {
    columns: [
      { key: 'name', label: 'Name', sortable: true, filterable: true },
      { key: 'email', label: 'Email', type: 'email', sortable: true },
      { key: 'role', label: 'Role', sortable: true, filterable: true },
      { key: 'lastLogin', label: 'Last Login', type: 'date', sortable: true },
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        actions: [
          { key: 'edit', label: 'Edit', icon: 'edit' },
          { key: 'delete', label: 'Delete', icon: 'delete', color: 'warn' }
        ]
      }
    ],
    selectable: true,
    pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 25, 50] },
    filtering: true,
    exportable: true
  };

  userFormConfig: FormConfig = {
    fields: [
      { key: 'firstName', type: 'text', label: 'First Name', required: true },
      { key: 'lastName', type: 'text', label: 'Last Name', required: true },
      { key: 'email', type: 'email', label: 'Email', required: true },
      {
        key: 'role',
        type: 'select',
        label: 'Role',
        required: true,
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'viewer', label: 'Viewer' }
        ]
      }
    ],
    layout: 'vertical'
  };

  async onActionClick(event: {action: string, row: User}): Promise<void> {
    switch (event.action) {
      case 'edit':
        this.editUser(event.row);
        break;
      case 'delete':
        await this.confirmDelete(event.row);
        break;
    }
  }

  private async confirmDelete(user: User): Promise<void> {
    const confirmed = await this.confirmDialog.open({
      title: 'Delete User',
      message: `Delete ${user.name}?`,
      type: 'danger',
      requireConfirmation: true,
      confirmationText: user.name
    });

    if (confirmed) {
      await this.loadingService.executeWithLoading(
        'delete-user',
        () => this.userService.delete(user.id),
        'Deleting user...'
      );
      this.loadUsers();
    }
  }
}
```

## Testing

### Unit Testing
```typescript
// Example component test
describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicFormComponent],
      imports: [ReactiveFormsModule, MaterialModules],
      providers: [ValidationService]
    });
    
    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
  });

  it('should create form controls from configuration', () => {
    component.config = {
      fields: [
        { key: 'name', type: 'text', label: 'Name', required: true }
      ]
    };
    component.ngOnInit();
    
    expect(component.form.get('name')).toBeTruthy();
    expect(component.form.get('name')?.hasError('required')).toBeTruthy();
  });
});
```

### E2E Testing
```typescript
// Example e2e test
describe('User Management', () => {
  it('should create new user through dynamic form', () => {
    cy.visit('/users');
    cy.get('[data-cy=add-user-btn]').click();
    
    // Fill dynamic form
    cy.get('[data-cy=dynamic-form] input[formControlName="firstName"]')
      .type('John');
    cy.get('[data-cy=dynamic-form] input[formControlName="email"]')
      .type('john@example.com');
    
    cy.get('[data-cy=submit-btn]').click();
    
    // Verify user appears in table
    cy.get('[data-cy=users-table]')
      .should('contain', 'John')
      .should('contain', 'john@example.com');
  });
});
```

## Contributing

When adding new generic components:

1. Follow the established patterns and interfaces
2. Include comprehensive TypeScript typing
3. Add proper documentation and examples
4. Write unit tests for all functionality
5. Ensure accessibility compliance
6. Test across different screen sizes
7. Update this README with new component documentation

## Future Enhancements

- **Advanced Filtering**: Add date range, multi-select, and custom filter components
- **Data Virtualization**: Implement virtual scrolling for large datasets
- **Advanced Forms**: Add conditional validation, field dependencies, and custom field types
- **Themes**: Support for custom themes and dark mode
- **Internationalization**: Full i18n support for all components
- **Performance Monitoring**: Built-in performance metrics and optimization suggestions