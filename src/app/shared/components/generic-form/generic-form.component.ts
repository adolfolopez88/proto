import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

export interface FormFieldConfig {
    key: string;
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'file' | 'toggle' | 'autocomplete';
    label: string;
    placeholder?: string;
    value?: any;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    validators?: any[];
    options?: FormFieldOption[];
    multiple?: boolean;
    appearance?: 'fill' | 'outline';
    hint?: string;
    icon?: string;
    prefix?: string;
    suffix?: string;
    rows?: number; // For textarea
    accept?: string; // For file input
    min?: number | Date;
    max?: number | Date;
    step?: number;
    autocomplete?: string;
    mask?: string;
    conditional?: {
        field: string;
        value: any;
        operator?: '==' | '!=' | '>' | '<' | 'in' | 'not-in';
    };
}

export interface FormFieldOption {
    label: string;
    value: any;
    disabled?: boolean;
    group?: string;
}

export interface FormConfig {
    fields: FormFieldConfig[];
    layout?: 'vertical' | 'horizontal' | 'grid';
    columns?: number;
    submitLabel?: string;
    resetLabel?: string;
    showReset?: boolean;
    validateOnChange?: boolean;
    appearance?: 'fill' | 'outline';
}

@Component({
    selector: 'app-generic-form',
    templateUrl: './generic-form.component.html',
    styleUrls: ['./generic-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericFormComponent implements OnInit {
    @Input() config!: FormConfig;
    @Input() initialData: any = {};
    @Input() loading = false;

    @Output() formSubmit = new EventEmitter<any>();
    @Output() formReset = new EventEmitter<void>();
    @Output() formChange = new EventEmitter<any>();
    @Output() fieldChange = new EventEmitter<{field: string, value: any}>();

    form!: FormGroup;
    visibleFields: FormFieldConfig[] = [];

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.buildForm();
        this.updateVisibleFields();
        this.setupFormSubscriptions();
    }

    ngOnChanges(): void {
        this.loadingSubject.next(this.loading);
        if (this.form && this.initialData) {
            this.form.patchValue(this.initialData);
        }
    }

    private buildForm(): void {
        const formControls: {[key: string]: AbstractControl} = {};

        this.config.fields.forEach(field => {
            const validators = this.buildValidators(field);
            const initialValue = this.initialData[field.key] || field.value || this.getDefaultValue(field);
            
            formControls[field.key] = this.fb.control({
                value: initialValue,
                disabled: field.disabled || false
            }, validators);
        });

        this.form = this.fb.group(formControls);
    }

    private buildValidators(field: FormFieldConfig): any[] {
        const validators: any[] = [];

        if (field.required) {
            validators.push(Validators.required);
        }

        if (field.type === 'email') {
            validators.push(Validators.email);
        }

        if (field.type === 'number') {
            if (field.min !== undefined) {
                validators.push(Validators.min(field.min as number));
            }
            if (field.max !== undefined) {
                validators.push(Validators.max(field.max as number));
            }
        }

        if (field.validators) {
            validators.push(...field.validators);
        }

        return validators;
    }

    private getDefaultValue(field: FormFieldConfig): any {
        switch (field.type) {
            case 'checkbox':
            case 'toggle':
                return false;
            case 'multiselect':
                return [];
            case 'number':
                return null;
            default:
                return '';
        }
    }

    private setupFormSubscriptions(): void {
        if (this.config.validateOnChange) {
            this.form.valueChanges.subscribe(value => {
                this.updateVisibleFields();
                this.formChange.emit(value);
            });
        }

        // Listen to individual field changes
        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.valueChanges.subscribe(value => {
                this.fieldChange.emit({ field: key, value });
                this.updateVisibleFields();
            });
        });
    }

    private updateVisibleFields(): void {
        this.visibleFields = this.config.fields.filter(field => 
            this.isFieldVisible(field)
        );
    }

    private isFieldVisible(field: FormFieldConfig): boolean {
        if (!field.conditional) {
            return true;
        }

        const conditionField = this.form.get(field.conditional.field);
        if (!conditionField) {
            return true;
        }

        const fieldValue = conditionField.value;
        const conditionValue = field.conditional.value;
        const operator = field.conditional.operator || '==';

        switch (operator) {
            case '==':
                return fieldValue === conditionValue;
            case '!=':
                return fieldValue !== conditionValue;
            case '>':
                return fieldValue > conditionValue;
            case '<':
                return fieldValue < conditionValue;
            case 'in':
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case 'not-in':
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            default:
                return true;
        }
    }

    // Form actions
    onSubmit(): void {
        if (this.form.valid) {
            this.formSubmit.emit(this.form.value);
        } else {
            this.markAllFieldsAsTouched();
        }
    }

    onReset(): void {
        this.form.reset();
        this.form.patchValue(this.initialData || {});
        this.formReset.emit();
    }

    // Utility methods
    getFormControl(fieldKey: string): AbstractControl | null {
        return this.form.get(fieldKey);
    }

    isFieldInvalid(field: FormFieldConfig): boolean {
        const control = this.getFormControl(field.key);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getFieldError(field: FormFieldConfig): string {
        const control = this.getFormControl(field.key);
        if (!control || !control.errors) {
            return '';
        }

        const errors = control.errors;
        if (errors['required']) {
            return `${field.label} is required`;
        }
        if (errors['email']) {
            return 'Please enter a valid email address';
        }
        if (errors['min']) {
            return `Minimum value is ${errors['min'].min}`;
        }
        if (errors['max']) {
            return `Maximum value is ${errors['max'].max}`;
        }
        if (errors['minlength']) {
            return `Minimum length is ${errors['minlength'].requiredLength}`;
        }
        if (errors['maxlength']) {
            return `Maximum length is ${errors['maxlength'].requiredLength}`;
        }

        // Return first error message
        return Object.keys(errors)[0];
    }

    private markAllFieldsAsTouched(): void {
        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.markAsTouched();
        });
    }

    // Field-specific methods
    getFieldAppearance(field: FormFieldConfig): 'fill' | 'outline' {
        return field.appearance || this.config.appearance || 'outline';
    }

    getGridColumns(): string {
        if (this.config.layout === 'grid' && this.config.columns) {
            return `repeat(${this.config.columns}, 1fr)`;
        }
        return '1fr';
    }

    // File upload handling
    onFileSelect(event: any, field: FormFieldConfig): void {
        const file = event.target.files[0];
        if (file) {
            this.form.get(field.key)?.setValue(file);
        }
    }

    // Getters for template
    get isFormValid(): boolean {
        return this.form.valid;
    }

    get isFormDirty(): boolean {
        return this.form.dirty;
    }

    get formValue(): any {
        return this.form.value;
    }
}