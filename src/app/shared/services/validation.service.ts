import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  /**
   * Validate email format with enhanced rules
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);

      return isValid ? null : { invalidEmail: true };
    };
  }

  /**
   * Validate password strength
   * @param minLength Minimum password length
   * @param requireUppercase Require uppercase letter
   * @param requireLowercase Require lowercase letter
   * @param requireNumbers Require numbers
   * @param requireSpecialChars Require special characters
   */
  static passwordValidator(
    minLength: number = 8,
    requireUppercase: boolean = true,
    requireLowercase: boolean = true,
    requireNumbers: boolean = true,
    requireSpecialChars: boolean = false
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      if (password.length < minLength) {
        errors['minLength'] = { requiredLength: minLength, actualLength: password.length };
      }

      if (requireUppercase && !/[A-Z]/.test(password)) {
        errors['requireUppercase'] = true;
      }

      if (requireLowercase && !/[a-z]/.test(password)) {
        errors['requireLowercase'] = true;
      }

      if (requireNumbers && !/\d/.test(password)) {
        errors['requireNumbers'] = true;
      }

      if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors['requireSpecialChars'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validate phone number format
   * @param allowInternational Allow international format
   */
  static phoneValidator(allowInternational: boolean = true): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex = allowInternational 
        ? /^\+?[\d\s\-\(\)]{10,}$/
        : /^[\d\s\-\(\)]{10}$/;
      
      const isValid = phoneRegex.test(control.value);
      return isValid ? null : { invalidPhone: true };
    };
  }

  /**
   * Validate that passwords match
   * @param passwordField Name of password field
   * @param confirmPasswordField Name of confirm password field
   */
  static passwordMatchValidator(
    passwordField: string = 'password',
    confirmPasswordField: string = 'confirmPassword'
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  /**
   * Validate URL format
   * @param requireHttps Require HTTPS protocol
   */
  static urlValidator(requireHttps: boolean = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        const url = new URL(control.value);
        
        if (requireHttps && url.protocol !== 'https:') {
          return { httpsRequired: true };
        }

        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  /**
   * Validate date range
   * @param startDateField Name of start date field
   * @param endDateField Name of end date field
   * @param allowSameDate Allow start and end date to be the same
   */
  static dateRangeValidator(
    startDateField: string = 'startDate',
    endDateField: string = 'endDate',
    allowSameDate: boolean = true
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get(startDateField);
      const endDate = control.get(endDateField);

      if (!startDate || !endDate || !startDate.value || !endDate.value) {
        return null;
      }

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (allowSameDate) {
        return start <= end ? null : { invalidDateRange: true };
      } else {
        return start < end ? null : { invalidDateRange: true };
      }
    };
  }

  /**
   * Validate minimum age
   * @param minAge Minimum age required
   */
  static minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age - 1 } };
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  /**
   * Validate file size
   * @param maxSizeInMB Maximum file size in MB
   */
  static fileSizeValidator(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        return { 
          fileSize: { 
            maxSize: maxSizeInMB, 
            actualSize: Math.round(file.size / 1024 / 1024 * 100) / 100 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Validate file type
   * @param allowedTypes Array of allowed MIME types
   */
  static fileTypeValidator(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const file = control.value as File;
      
      if (!allowedTypes.includes(file.type)) {
        return { 
          fileType: { 
            allowedTypes, 
            actualType: file.type 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Custom async validator for checking if email exists
   * @param checkEmailFn Function to check if email exists
   */
  static asyncEmailExistsValidator(
    checkEmailFn: (email: string) => Promise<boolean>
  ) {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      if (!control.value) {
        return null;
      }

      try {
        const exists = await checkEmailFn(control.value);
        return exists ? { emailExists: true } : null;
      } catch (error) {
        return { emailCheckError: true };
      }
    };
  }

  /**
   * Get validation error messages
   * @param errors Validation errors object
   * @param fieldName Name of the field for personalized messages
   */
  static getErrorMessage(errors: ValidationErrors, fieldName: string = 'Campo'): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return `${fieldName} es requerido`;
    }

    if (errors['email'] || errors['invalidEmail']) {
      return 'Ingrese un email válido';
    }

    if (errors['minlength']) {
      return `${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `${fieldName} no puede exceder ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['pattern']) {
      return `${fieldName} tiene un formato inválido`;
    }

    if (errors['min']) {
      return `${fieldName} debe ser mayor o igual a ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${fieldName} debe ser menor o igual a ${errors['max'].max}`;
    }

    if (errors['requireUppercase']) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }

    if (errors['requireLowercase']) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }

    if (errors['requireNumbers']) {
      return 'La contraseña debe contener al menos un número';
    }

    if (errors['requireSpecialChars']) {
      return 'La contraseña debe contener al menos un caracter especial';
    }

    if (errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    if (errors['invalidPhone']) {
      return 'Ingrese un número de teléfono válido';
    }

    if (errors['invalidUrl']) {
      return 'Ingrese una URL válida';
    }

    if (errors['httpsRequired']) {
      return 'La URL debe usar protocolo HTTPS';
    }

    if (errors['invalidDateRange']) {
      return 'La fecha de inicio debe ser anterior a la fecha de fin';
    }

    if (errors['minAge']) {
      return `Debe tener al menos ${errors['minAge'].requiredAge} años`;
    }

    if (errors['fileSize']) {
      return `El archivo no puede exceder ${errors['fileSize'].maxSize}MB`;
    }

    if (errors['fileType']) {
      return `Tipo de archivo no permitido. Tipos permitidos: ${errors['fileType'].allowedTypes.join(', ')}`;
    }

    if (errors['emailExists']) {
      return 'Este email ya está registrado';
    }

    // Generic error message
    return `${fieldName} es inválido`;
  }
}