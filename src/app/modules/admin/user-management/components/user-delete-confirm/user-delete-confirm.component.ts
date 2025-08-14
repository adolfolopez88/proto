import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../core/models/user.model';

export interface DeleteConfirmData {
  user: User;
  message: string;
}

@Component({
  selector: 'app-user-delete-confirm',
  templateUrl: './user-delete-confirm.component.html',
  styleUrls: ['./user-delete-confirm.component.scss']
})
export class UserDeleteConfirmComponent {
  confirmText = '';
  isConfirmValid = false;

  constructor(
    private dialogRef: MatDialogRef<UserDeleteConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmData
  ) {}

  onConfirmTextChange(): void {
    const expectedText = 'ELIMINAR';
    this.isConfirmValid = this.confirmText.toUpperCase() === expectedText;
  }

  onConfirm(): void {
    if (this.isConfirmValid) {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getUserDisplayName(): string {
    const user = this.data.user;
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  }
}