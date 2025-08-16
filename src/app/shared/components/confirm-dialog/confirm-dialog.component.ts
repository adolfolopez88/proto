import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  requireConfirmation?: boolean;
  confirmationText?: string;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  confirmationInput = '';
  isConfirmValid = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default values
    this.data = {
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'info',
      requireConfirmation: false,
      confirmationText: 'CONFIRMAR',
      icon: this.getDefaultIcon(),
      ...data
    };
  }

  private getDefaultIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  onConfirmTextChange(): void {
    if (this.data.requireConfirmation && this.data.confirmationText) {
      this.isConfirmValid = this.confirmationInput.toUpperCase() === this.data.confirmationText.toUpperCase();
    } else {
      this.isConfirmValid = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (!this.data.requireConfirmation || this.isConfirmValid) {
      this.dialogRef.close(true);
    }
  }

  getDialogClass(): string {
    return `confirm-dialog-${this.data.type}`;
  }

  getIconClass(): string {
    const baseClass = 'dialog-icon';
    switch (this.data.type) {
      case 'warning':
        return `${baseClass} text-orange-500`;
      case 'danger':
        return `${baseClass} text-red-500`;
      case 'success':
        return `${baseClass} text-green-500`;
      default:
        return `${baseClass} text-blue-500`;
    }
  }
}