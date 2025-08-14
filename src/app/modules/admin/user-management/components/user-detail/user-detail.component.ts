import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../core/models/user.model';

export interface UserDetailData {
  user: User;
}

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent {
  
  constructor(
    private dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getUserDisplayName(): string {
    const user = this.data.user;
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'moderator': 'Moderador',
      'user': 'Usuario',
      'guest': 'Invitado'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'warn',
      'moderator': 'accent', 
      'user': 'primary',
      'guest': ''
    };
    return colors[role] || '';
  }

  formatDate(date: any): string {
    if (!date) return 'No disponible';
    
    let dateObj: Date;
    
    // Handle Firestore timestamp
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copiado al portapapeles:', text);
    });
  }

  sendEmail(): void {
    window.open(`mailto:${this.data.user.email}`, '_blank');
  }

  makePhoneCall(): void {
    if (this.data.user.phone) {
      window.open(`tel:${this.data.user.phone}`, '_blank');
    }
  }
}