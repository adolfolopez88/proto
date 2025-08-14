import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, LoginCredentials, RegisterData } from '../../../../core/services/firebase/auth.service';
import { UserService } from '../../../../core/services/firebase/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
    selector: 'app-firebase-example',
    template: `
        <div class="flex flex-col gap-8 p-8">
            <!-- Auth Status -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Estado de Autenticación</h2>
                <div *ngIf="authService.currentUser$ | async as user; else notAuthenticated">
                    <p class="text-green-600">✓ Autenticado como: {{user?.email}}</p>
                    <p>Nombre: {{user?.displayName || 'No especificado'}}</p>
                    <p>Rol: {{user?.role}}</p>
                    <button 
                        mat-raised-button 
                        color="warn" 
                        (click)="logout()"
                        class="mt-4">
                        Cerrar Sesión
                    </button>
                </div>
                <ng-template #notAuthenticated>
                    <p class="text-red-600">✗ No autenticado</p>
                </ng-template>
            </div>

            <!-- Login Form -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Iniciar Sesión</h3>
                <form [formGroup]="loginForm" (ngSubmit)="login()">
                    <mat-form-field class="w-full mb-4">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email">
                        <mat-error *ngIf="loginForm.get('email')?.errors?.['required']">
                            El email es requerido
                        </mat-error>
                        <mat-error *ngIf="loginForm.get('email')?.errors?.['email']">
                            Email inválido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field class="w-full mb-4">
                        <mat-label>Contraseña</mat-label>
                        <input matInput formControlName="password" type="password">
                        <mat-error *ngIf="loginForm.get('password')?.errors?.['required']">
                            La contraseña es requerida
                        </mat-error>
                    </mat-form-field>

                    <div class="flex gap-2">
                        <button 
                            mat-raised-button 
                            color="primary" 
                            type="submit"
                            [disabled]="loginForm.invalid || (authService.loading$ | async)">
                            <mat-spinner diameter="20" *ngIf="authService.loading$ | async"></mat-spinner>
                            Iniciar Sesión
                        </button>
                        
                        <button 
                            mat-raised-button 
                            color="accent" 
                            type="button"
                            (click)="loginWithGoogle()"
                            [disabled]="authService.loading$ | async">
                            Google
                        </button>
                    </div>
                </form>
            </div>

            <!-- Register Form -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Registro</h3>
                <form [formGroup]="registerForm" (ngSubmit)="register()">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <mat-form-field>
                            <mat-label>Nombre</mat-label>
                            <input matInput formControlName="firstName">
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Apellido</mat-label>
                            <input matInput formControlName="lastName">
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Email</mat-label>
                            <input matInput formControlName="email" type="email">
                            <mat-error *ngIf="registerForm.get('email')?.errors?.['required']">
                                El email es requerido
                            </mat-error>
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Nombre para mostrar</mat-label>
                            <input matInput formControlName="displayName">
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Contraseña</mat-label>
                            <input matInput formControlName="password" type="password">
                            <mat-error *ngIf="registerForm.get('password')?.errors?.['required']">
                                La contraseña es requerida
                            </mat-error>
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Confirmar Contraseña</mat-label>
                            <input matInput formControlName="confirmPassword" type="password">
                            <mat-error *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                                Confirma la contraseña
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <button 
                        mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="registerForm.invalid || (authService.loading$ | async)"
                        class="mt-4">
                        Registrarse
                    </button>
                </form>
            </div>

            <!-- User Management -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Gestión de Usuarios</h3>
                
                <div class="flex gap-4 mb-4">
                    <button mat-raised-button (click)="loadAllUsers()">
                        Cargar Todos los Usuarios
                    </button>
                    <button mat-raised-button (click)="loadActiveUsers()">
                        Usuarios Activos
                    </button>
                    <button mat-raised-button (click)="loadUserStats()">
                        Estadísticas
                    </button>
                </div>

                <div *ngIf="users.length > 0">
                    <h4 class="font-semibold mb-2">Usuarios ({{users.length}})</h4>
                    <div class="grid gap-2">
                        <div *ngFor="let user of users" class="p-3 border rounded flex justify-between items-center">
                            <div>
                                <span class="font-medium">{{user.displayName || user.email}}</span>
                                <span class="text-sm text-gray-500 ml-2">({{user.role}})</span>
                                <span *ngIf="!user.isActive" class="text-red-500 ml-2">Inactivo</span>
                            </div>
                            <button 
                                mat-icon-button 
                                color="warn"
                                (click)="deactivateUser(user.id!)"
                                *ngIf="user.isActive">
                                <mat-icon>block</mat-icon>
                            </button>
                        </div>
                    </div>
                </div>

                <div *ngIf="userStats" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                    <h4 class="font-semibold mb-2">Estadísticas</h4>
                    <p>Total: {{userStats.total}}</p>
                    <p>Activos: {{userStats.active}}</p>
                    <p>Inactivos: {{userStats.inactive}}</p>
                    <div *ngIf="userStats.byRole">
                        <p class="font-medium mt-2">Por Rol:</p>
                        <div *ngFor="let role of objectKeys(userStats.byRole)">
                            {{role}}: {{userStats.byRole[role]}}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages -->
            <div *ngIf="message" 
                 class="p-4 rounded"
                 [ngClass]="{
                     'bg-green-100 text-green-800': messageType === 'success',
                     'bg-red-100 text-red-800': messageType === 'error',
                     'bg-blue-100 text-blue-800': messageType === 'info'
                 }">
                {{message}}
            </div>
        </div>
    `
})
export class FirebaseExampleComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    registerForm: FormGroup;
    users: User[] = [];
    userStats: any;
    message: string = '';
    messageType: 'success' | 'error' | 'info' = 'info';

    private destroy$ = new Subject<void>();

    objectKeys = Object.keys;

    constructor(
        private fb: FormBuilder,
        public authService: AuthService,
        private userService: UserService
    ) {
        this.createForms();
    }

    ngOnInit(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                if (user) {
                    this.showMessage('Usuario autenticado correctamente', 'success');
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createForms(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        this.registerForm = this.fb.group({
            firstName: [''],
            lastName: [''],
            email: ['', [Validators.required, Validators.email]],
            displayName: [''],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });
    }

    login(): void {
        if (this.loginForm.valid) {
            const credentials: LoginCredentials = this.loginForm.value;
            
            this.authService.signIn(credentials)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.showMessage('Inicio de sesión exitoso', 'success');
                            this.loginForm.reset();
                        } else {
                            this.showMessage(response.error?.message || 'Error en el inicio de sesión', 'error');
                        }
                    },
                    error: (error) => {
                        this.showMessage('Error: ' + error.message, 'error');
                    }
                });
        }
    }

    register(): void {
        if (this.registerForm.valid) {
            const registerData: RegisterData = this.registerForm.value;
            
            this.authService.signUp(registerData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.showMessage('Registro exitoso', 'success');
                            this.registerForm.reset();
                        } else {
                            this.showMessage(response.error?.message || 'Error en el registro', 'error');
                        }
                    },
                    error: (error) => {
                        this.showMessage('Error: ' + error.message, 'error');
                    }
                });
        }
    }

    loginWithGoogle(): void {
        this.authService.signInWithGoogle()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.showMessage('Inicio de sesión con Google exitoso', 'success');
                    } else {
                        this.showMessage(response.error?.message || 'Error con Google', 'error');
                    }
                },
                error: (error) => {
                    this.showMessage('Error: ' + error.message, 'error');
                }
            });
    }

    logout(): void {
        this.authService.signOut()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Sesión cerrada correctamente', 'success');
                }
            });
    }

    loadAllUsers(): void {
        this.userService.getDocuments([])
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (users) => {
                    this.users = users;
                    this.showMessage(`Cargados ${users.length} usuarios`, 'info');
                },
                error: (error) => {
                    this.showMessage('Error cargando usuarios: ' + error.message, 'error');
                }
            });
    }

    loadActiveUsers(): void {
        this.userService.getActiveUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (users) => {
                    this.users = users;
                    this.showMessage(`Cargados ${users.length} usuarios activos`, 'info');
                },
                error: (error) => {
                    this.showMessage('Error cargando usuarios activos: ' + error.message, 'error');
                }
            });
    }

    loadUserStats(): void {
        this.userService.getUserStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.userStats = stats;
                    this.showMessage('Estadísticas cargadas', 'info');
                },
                error: (error) => {
                    this.showMessage('Error cargando estadísticas: ' + error.message, 'error');
                }
            });
    }

    deactivateUser(userId: string): void {
        this.userService.deactivateUser(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Usuario desactivado', 'success');
                    this.loadAllUsers(); // Recargar lista
                },
                error: (error) => {
                    this.showMessage('Error desactivando usuario: ' + error.message, 'error');
                }
            });
    }

    private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
        this.message = message;
        this.messageType = type;
        
        setTimeout(() => {
            this.message = '';
        }, 5000);
    }
}