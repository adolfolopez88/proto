import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseFactoryService } from '../../../core/services/firebase/firebase-factory.service';
import { AuthSimpleService } from '../../../core/services/firebase/auth-simple.service';
import { UserSimpleService } from '../../../core/services/firebase/user-simple.service';
import { User, CreateUserRequest } from '../../../core/models/user.model';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserDeleteConfirmComponent } from './components/user-delete-confirm/user-delete-confirm.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  totalUsers = 0;
  
  // Servicios
  private authService!: AuthSimpleService;
  private userService!: UserSimpleService;

  constructor(
    private firebaseFactory: FirebaseFactoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Configurar servicios Firebase
    this.firebaseFactory.switchToSimple();
    this.authService = this.firebaseFactory.getAuthSimpleService() as AuthSimpleService;
    this.userService = this.firebaseFactory.getUserSimpleService() as UserSimpleService;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.loading = true;
      this.users = await this.userService.getActiveUsers();
      this.totalUsers = await this.userService.getUserCount();
      this.showMessage('Usuarios cargados correctamente', 'success');
    } catch (error) {
      console.error('Error loading users:', error);
      this.showMessage('Error al cargar usuarios', 'error');
    } finally {
      this.loading = false;
    }
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { 
        mode: 'create',
        title: 'Crear Nuevo Usuario' 
      }
    });

    dialogRef.afterClosed().subscribe(async (result: CreateUserRequest) => {
      if (result) {
        await this.createUser(result);
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { 
        mode: 'edit',
        title: 'Editar Usuario',
        user: { ...user }
      }
    });

    dialogRef.afterClosed().subscribe(async (result: Partial<User>) => {
      if (result && user.id) {
        await this.updateUser(user.id, result);
      }
    });
  }

  openDeleteUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDeleteConfirmComponent, {
      width: '400px',
      data: { 
        user: user,
        message: `¿Estás seguro de que quieres eliminar al usuario "${user.displayName || user.email}"?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && user.id) {
        await this.deleteUser(user.id);
      }
    });
  }

  private async createUser(userData: CreateUserRequest): Promise<void> {
    try {
      this.loading = true;
      
      // Crear usuario con autenticación Firebase (requiere password)
      const registerData = {
        ...userData,
        password: this.generateTemporaryPassword(),
        confirmPassword: this.generateTemporaryPassword()
      };
      
      // Asegurar que password y confirmPassword coincidan
      registerData.confirmPassword = registerData.password;

      const result = await this.authService.signUp(registerData).toPromise();
      
      if (result?.success && result.data) {
        this.showMessage('Usuario creado exitosamente', 'success');
        await this.loadUsers(); // Recargar lista
      } else {
        this.showMessage(result?.error?.message || 'Error al crear usuario', 'error');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      this.showMessage(error.message || 'Error al crear usuario', 'error');
    } finally {
      this.loading = false;
    }
  }

  private async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      this.loading = true;
      await this.userService.updateUser(userId, userData);
      this.showMessage('Usuario actualizado exitosamente', 'success');
      await this.loadUsers(); // Recargar lista
    } catch (error: any) {
      console.error('Error updating user:', error);
      this.showMessage(error.message || 'Error al actualizar usuario', 'error');
    } finally {
      this.loading = false;
    }
  }

  private async deleteUser(userId: string): Promise<void> {
    try {
      this.loading = true;
      await this.userService.deleteUser(userId);
      this.showMessage('Usuario eliminado exitosamente', 'success');
      await this.loadUsers(); // Recargar lista
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.showMessage(error.message || 'Error al eliminar usuario', 'error');
    } finally {
      this.loading = false;
    }
  }

  private generateTemporaryPassword(): string {
    // Generar password temporal para nuevos usuarios
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Métodos para eventos de la tabla
  onUserSelect(user: User): void {
    console.log('Usuario seleccionado:', user);
  }

  onUserEdit(user: User): void {
    this.openEditUserDialog(user);
  }

  onUserDelete(user: User): void {
    this.openDeleteUserDialog(user);
  }

  async onRefresh(): Promise<void> {
    await this.loadUsers();
  }

  async toggleUserStatus(user: User): Promise<void> {
    if (user.id) {
      try {
        await this.userService.toggleUserStatus(user.id);
        this.showMessage(
          `Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`, 
          'success'
        );
        await this.loadUsers();
      } catch (error: any) {
        this.showMessage('Error al cambiar estado del usuario', 'error');
      }
    }
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }
}