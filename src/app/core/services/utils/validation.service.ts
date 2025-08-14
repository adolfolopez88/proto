import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    // Custom validators
    static passwordValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) {
                return null;
            }

            const hasNumber = /[0-9]/.test(value);
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasSpecial = /[#?!@$%^&*-]/.test(value);
            const isValidLength = value.length >= 8;

            const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;

            if (!passwordValid) {
                return {
                    passwordRequirements: {
                        hasNumber,
                        hasUpper,
                        hasLower,
                        hasSpecial,
                        isValidLength
                    }
                };
            }
            return null;
        };
    }

    static confirmPasswordValidator(passwordField: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.parent) {
                return null;
            }

            const password = control.parent.get(passwordField);
            const confirmPassword = control;

            if (password && confirmPassword && password.value !== confirmPassword.value) {
                return { passwordMismatch: true };
            }
            return null;
        };
    }

    static phoneValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const isValid = phoneRegex.test(control.value.replace(/\s/g, ''));

            return isValid ? null : { invalidPhone: true };
        };
    }

    static urlValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            try {
                new URL(control.value);
                return null;
            } catch {
                return { invalidUrl: true };
            }
        };
    }

    static fileTypeValidator(allowedTypes: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const file = control.value;
            if (!file) {
                return null;
            }

            const fileType = file.name.split('.').pop()?.toLowerCase();
            if (!fileType || !allowedTypes.includes(fileType)) {
                return { 
                    invalidFileType: { 
                        actualType: fileType,
                        allowedTypes 
                    }
                };
            }
            return null;
        };
    }

    static fileSizeValidator(maxSizeInMB: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const file = control.value;
            if (!file) {
                return null;
            }

            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                return { 
                    fileSizeExceeded: { 
                        actualSize: file.size,
                        maxSize: maxSizeInBytes,
                        maxSizeMB: maxSizeInMB
                    }
                };
            }
            return null;
        };
    }

    static dateRangeValidator(startDateField: string, endDateField: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.parent) {
                return null;
            }

            const startDate = control.parent.get(startDateField);
            const endDate = control.parent.get(endDateField);

            if (startDate && endDate && startDate.value && endDate.value) {
                const start = new Date(startDate.value);
                const end = new Date(endDate.value);

                if (start > end) {
                    return { dateRangeInvalid: true };
                }
            }
            return null;
        };
    }

    static minDateValidator(minDate: Date): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const inputDate = new Date(control.value);
            if (inputDate < minDate) {
                return { 
                    minDate: { 
                        actual: inputDate,
                        min: minDate 
                    }
                };
            }
            return null;
        };
    }

    static maxDateValidator(maxDate: Date): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const inputDate = new Date(control.value);
            if (inputDate > maxDate) {
                return { 
                    maxDate: { 
                        actual: inputDate,
                        max: maxDate 
                    }
                };
            }
            return null;
        };
    }

    static creditCardValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const cardNumber = control.value.replace(/\s/g, '');
            
            // Luhn algorithm
            let sum = 0;
            let isEven = false;
            
            for (let i = cardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(cardNumber.charAt(i), 10);
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return (sum % 10 === 0) ? null : { invalidCreditCard: true };
        };
    }

    static arrayMinLengthValidator(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || !Array.isArray(control.value)) {
                return null;
            }

            return control.value.length >= minLength ? null : { 
                arrayMinLength: { 
                    actualLength: control.value.length,
                    minLength 
                }
            };
        };
    }

    static arrayMaxLengthValidator(maxLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || !Array.isArray(control.value)) {
                return null;
            }

            return control.value.length <= maxLength ? null : { 
                arrayMaxLength: { 
                    actualLength: control.value.length,
                    maxLength 
                }
            };
        };
    }

    // Validation message generator
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any): string {
        const config: { [key: string]: string } = {
            'required': 'This field is required',
            'email': 'Please enter a valid email address',
            'minlength': `Minimum length is ${validatorValue?.requiredLength}`,
            'maxlength': `Maximum length is ${validatorValue?.requiredLength}`,
            'min': `Minimum value is ${validatorValue?.min}`,
            'max': `Maximum value is ${validatorValue?.max}`,
            'passwordRequirements': 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
            'passwordMismatch': 'Passwords do not match',
            'invalidPhone': 'Please enter a valid phone number',
            'invalidUrl': 'Please enter a valid URL',
            'invalidFileType': `File type not allowed. Allowed types: ${validatorValue?.allowedTypes?.join(', ')}`,
            'fileSizeExceeded': `File size exceeds ${validatorValue?.maxSizeMB}MB limit`,
            'dateRangeInvalid': 'End date must be after start date',
            'minDate': `Date must be after ${validatorValue?.min?.toLocaleDateString()}`,
            'maxDate': `Date must be before ${validatorValue?.max?.toLocaleDateString()}`,
            'invalidCreditCard': 'Please enter a valid credit card number',
            'arrayMinLength': `Please select at least ${validatorValue?.minLength} item(s)`,
            'arrayMaxLength': `Please select no more than ${validatorValue?.maxLength} item(s)`
        };

        return config[validatorName] || 'This field is invalid';
    }

    // Utility methods for common validations
    isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isPhoneNumber(phone: string): boolean {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isStrongPassword(password: string): boolean {
        const hasNumber = /[0-9]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasSpecial = /[#?!@$%^&*-]/.test(password);
        const isValidLength = password.length >= 8;

        return hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;
    }

    sanitizeInput(input: string): string {
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
}