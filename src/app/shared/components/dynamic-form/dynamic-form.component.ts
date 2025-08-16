import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface FormFieldConfig {
  key: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'phone' | 'url';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  value?: any;
  validators?: ValidatorFn[];
  options?: { value: any; label: string; disabled?: boolean }[];
  multiple?: boolean;
  accept?: string; // for file inputs
  min?: number | string;
  max?: number | string;
  step?: number;
  rows?: number; // for textarea
  cols?: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  appearance?: 'legacy' | 'standard' | 'fill' | 'outline';
  floatLabel?: 'always' | 'never' | 'auto';
  conditional?: {
    field: string;
    value: any;
    operator?: '==' | '!=' | '>' | '<' | '>=' | '<=';
  };
  className?: string;
  width?: string;
  order?: number;
}

export interface FormConfig {
  fields: FormFieldConfig[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  @Input() config!: FormConfig;
  @Input() initialData: any = {};
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{field: string, value: any}>();

  form!: FormGroup;
  orderedFields: FormFieldConfig[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Sort fields by order if specified
    this.orderedFields = [...this.config.fields].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });

    // Create form controls
    const controls: { [key: string]: FormControl } = {};

    this.orderedFields.forEach(field => {
      const validators = this.buildValidators(field);
      const initialValue = this.getInitialValue(field);
      
      controls[field.key] = new FormControl({
        value: initialValue,
        disabled: field.disabled || this.config.disabled || false
      }, validators);
    });

    this.form = this.fb.group(controls);

    // Set initial data
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  private buildValidators(field: FormFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    // Type-specific validators
    switch (field.type) {
      case 'email':
        validators.push(ValidationService.emailValidator());
        break;
      case 'phone':
        validators.push(ValidationService.phoneValidator());
        break;
      case 'url':
        validators.push(ValidationService.urlValidator());
        break;
      case 'number':
        if (field.min !== undefined) {
          validators.push(Validators.min(Number(field.min)));
        }
        if (field.max !== undefined) {
          validators.push(Validators.max(Number(field.max)));
        }
        break;
      case 'text':
      case 'textarea':
      case 'password':
        if (field.min !== undefined) {
          validators.push(Validators.minLength(Number(field.min)));
        }
        if (field.max !== undefined) {
          validators.push(Validators.maxLength(Number(field.max)));
        }
        break;
    }

    // Custom validators
    if (field.validators) {
      validators.push(...field.validators);
    }

    return validators;
  }

  private getInitialValue(field: FormFieldConfig): any {
    if (field.value !== undefined) {
      return field.value;
    }

    switch (field.type) {
      case 'checkbox':
        return false;
      case 'number':
        return null;
      case 'select':
        return field.multiple ? [] : null;
      default:
        return '';
    }
  }

  private setupFormListeners(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.formChange.emit(value);
      });

    // Listen to individual field changes for conditional logic
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.fieldChange.emit({ field: key, value });
          this.updateConditionalFields();
        });
    });
  }

  private updateConditionalFields(): void {
    this.orderedFields.forEach(field => {
      if (field.conditional) {
        const control = this.form.get(field.key);
        const dependentControl = this.form.get(field.conditional.field);
        
        if (control && dependentControl) {
          const shouldShow = this.evaluateCondition(
            dependentControl.value,
            field.conditional.value,
            field.conditional.operator || '=='
          );

          if (shouldShow) {
            control.enable();
          } else {
            control.disable();
            control.setValue(this.getInitialValue(field));
          }
        }
      }
    });
  }

  private evaluateCondition(fieldValue: any, conditionValue: any, operator: string): boolean {
    switch (operator) {
      case '==':
        return fieldValue == conditionValue;
      case '!=':
        return fieldValue != conditionValue;
      case '>':
        return fieldValue > conditionValue;
      case '<':
        return fieldValue < conditionValue;
      case '>=':
        return fieldValue >= conditionValue;
      case '<=':
        return fieldValue <= conditionValue;
      default:
        return fieldValue == conditionValue;
    }
  }

  // Public methods
  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onReset(): void {
    this.form.reset();
    this.orderedFields.forEach(field => {
      const control = this.form.get(field.key);
      if (control) {
        control.setValue(this.getInitialValue(field));
      }
    });
    this.formReset.emit();
  }

  isFieldVisible(field: FormFieldConfig): boolean {
    if (field.hidden) {
      return false;
    }

    if (field.conditional) {
      const dependentControl = this.form.get(field.conditional.field);
      if (dependentControl) {
        return this.evaluateCondition(
          dependentControl.value,
          field.conditional.value,
          field.conditional.operator || '=='
        );
      }
    }

    return true;
  }

  getFieldError(field: FormFieldConfig): string {
    const control = this.form.get(field.key);
    if (control && control.errors && (control.dirty || control.touched)) {
      return ValidationService.getErrorMessage(control.errors, field.label);
    }
    return '';
  }

  isFieldRequired(field: FormFieldConfig): boolean {
    const control = this.form.get(field.key);
    return control?.hasError('required') || false;
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  getFormData(): any {
    return this.form.value;
  }

  updateFormData(data: any): void {
    this.form.patchValue(data);
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  getFormErrors(): { [key: string]: any } {
    const errors: { [key: string]: any } = {};
    
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });

    return errors;
  }

  // File handling
  onFileChange(event: any, field: FormFieldConfig): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const control = this.form.get(field.key);
      if (field.multiple) {
        control?.setValue(Array.from(files));
      } else {
        control?.setValue(files[0]);
      }
    }
  }

  // Layout helpers
  getGridColumns(): string {
    const columns = this.config.columns || 1;
    return `repeat(${columns}, 1fr)`;
  }

  getFieldWidth(field: FormFieldConfig): string {
    if (field.width) {
      return field.width;
    }
    
    if (this.config.layout === 'grid') {
      return '100%';
    }
    
    return 'auto';
  }
}