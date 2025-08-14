import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, CreateUserRequest } from '../../../../../core/models/user.model';

export interface UserFormData {
  mode: 'create' | 'edit';
  title: string;
  user?: User;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  roles = [
    { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'moderator', label: 'Moderador', description: 'Puede moderar contenido y usuarios' },
    { value: 'user', label: 'Usuario', description: 'Usuario estándar con permisos básicos' },
    { value: 'guest', label: 'Invitado', description: 'Acceso limitado de solo lectura' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private createForm(): FormGroup {
    const emailValidators = [Validators.required, Validators.email];
    const nameValidators = [Validators.required, Validators.minLength(2), Validators.maxLength(50)];
    
    return this.fb.group({
      email: [
        { value: '', disabled: this.isEditMode }, 
        emailValidators
      ],
      displayName: ['', [Validators.maxLength(100)]],
      firstName: ['', nameValidators],
      lastName: ['', nameValidators],
      role: ['user', [Validators.required]],
      isActive: [true],
      phone: ['', [
        Validators.pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/)
      ]],
      address: ['', [Validators.maxLength(200)]],
      bio: ['', [Validators.maxLength(500)]],
      avatar: ['', [
        Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)
      ]]
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      displayName: user.displayName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'user',
      isActive: user.isActive !== false, // Default to true if undefined
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.getRawValue(); // getRawValue to include disabled fields
      
      if (this.isEditMode) {
        // For edit mode, return only changed values (excluding email)
        const { email, ...updateData } = formValue;
        this.dialogRef.close(updateData);
      } else {
        // For create mode, return all data as CreateUserRequest
        const createData: CreateUserRequest = {
          email: formValue.email,
          displayName: formValue.displayName,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: formValue.role,
          isActive: formValue.isActive,
          phone: formValue.phone,
          address: formValue.address,
          bio: formValue.bio,
          avatar: formValue.avatar
        };
        this.dialogRef.close(createData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          control.updateValueAndValidity();
        }
      }
    });
  }

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (errors['email']) return 'Formato de email inválido';
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['pattern']) {
        if (fieldName === 'phone') return 'Formato de teléfono inválido';
        if (fieldName === 'avatar') return 'URL de imagen inválida (jpg, png, gif, webp)';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      displayName: 'Nombre para mostrar',
      firstName: 'Nombre',
      lastName: 'Apellido',
      role: 'Rol',
      phone: 'Teléfono',
      address: 'Dirección',
      bio: 'Biografía',
      avatar: 'Avatar URL'
    };
    return labels[fieldName] || fieldName;
  }

  // Preview avatar
  isValidImageUrl(url: string): boolean {
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  }

  onAvatarError(): void {
    const avatarControl = this.userForm.get('avatar');
    if (avatarControl) {
      avatarControl.setErrors({ invalidUrl: true });
    }
  }

  generateDisplayName(): void {
    const firstName = this.userForm.get('firstName')?.value || '';
    const lastName = this.userForm.get('lastName')?.value || '';
    
    if (firstName || lastName) {
      const displayName = `${firstName} ${lastName}`.trim();
      this.userForm.get('displayName')?.setValue(displayName);
    }
  }

  // Role selection helpers
  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      admin: 'admin_panel_settings',
      moderator: 'shield',
      user: 'person',
      guest: 'person_outline'
    };
    return icons[role] || 'person';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      admin: '#f44336',
      moderator: '#ff9800',
      user: '#2196f3',
      guest: '#9e9e9e'
    };
    return colors[role] || '#2196f3';
  }
}