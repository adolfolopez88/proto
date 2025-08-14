import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { FirebaseSimpleService } from './firebase-simple.service';
import { UserSimpleService } from './user-simple.service';
import { User, CreateUserRequest } from '../../models/user.model';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends CreateUserRequest {
    password: string;
    confirmPassword: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
        timestamp: Date;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthSimpleService {
    private firebaseService = inject(FirebaseSimpleService);
    private userService = inject(UserSimpleService);
    private router = inject(Router);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public currentUser$ = this.currentUserSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();

    constructor() {
        this.initializeAuthStateListener();
    }

    private initializeAuthStateListener(): void {
        this.firebaseService.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                await this.loadUserProfile(firebaseUser);
            } else {
                this.currentUserSubject.next(null);
            }
        });
    }

    private async loadUserProfile(firebaseUser: firebase.default.User): Promise<void> {
        try {
            const user = await this.userService.getUserByEmail(firebaseUser.email!);
            this.currentUserSubject.next(user);
            if (user) {
                await this.userService.updateLastLogin(user.id!);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.currentUserSubject.next(null);
        }
    }

    signIn(credentials: LoginCredentials): Observable<ApiResponse<User>> {
        this.setLoading(true);
        
        return from(this.performSignIn(credentials));
    }

    private async performSignIn(credentials: LoginCredentials): Promise<ApiResponse<User>> {
        try {
            const userCredential = await this.firebaseService.signInWithEmailAndPassword(
                credentials.email, 
                credentials.password
            );
            
            const user = await this.userService.getUserByEmail(userCredential.user!.email!);
            
            this.setLoading(false);
            this.router.navigate(['/signed-in-redirect']);
            
            return {
                success: true,
                data: user,
                message: 'Signed in successfully'
            };
        } catch (error: any) {
            this.setLoading(false);
            return this.handleAuthError(error);
        }
    }

    signUp(data: RegisterData): Observable<ApiResponse<User>> {
        this.setLoading(true);
        
        if (data.password !== data.confirmPassword) {
            this.setLoading(false);
            return of({
                success: false,
                error: {
                    code: 'PASSWORDS_DONT_MATCH',
                    message: 'Las contraseñas no coinciden',
                    timestamp: new Date()
                }
            });
        }
        
        return from(this.performSignUp(data));
    }

    private async performSignUp(data: RegisterData): Promise<ApiResponse<User>> {
        try {
            const userCredential = await this.firebaseService.createUserWithEmailAndPassword(
                data.email, 
                data.password
            );
            
            // Update Firebase Auth profile
            if (data.displayName && userCredential.user) {
                await userCredential.user.updateProfile({
                    displayName: data.displayName
                });
            }

            // Create user document in Firestore
            const userData: CreateUserRequest = {
                email: data.email,
                displayName: data.displayName,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'user',
                isActive: true
            };

            await this.userService.createUser(userData);
            const user = await this.userService.getUserByEmail(data.email);
            
            this.setLoading(false);
            
            return {
                success: true,
                data: user,
                message: 'Account created successfully'
            };
        } catch (error: any) {
            this.setLoading(false);
            return this.handleAuthError(error);
        }
    }

    signInWithGoogle(): Observable<ApiResponse<User>> {
        this.setLoading(true);
        
        return from(this.performGoogleSignIn());
    }

    private async performGoogleSignIn(): Promise<ApiResponse<User>> {
        try {
            const result = await this.firebaseService.signInWithGoogle();
            
            let user = await this.userService.getUserByEmail(result.user!.email!);
            
            if (!user) {
                // Create new user from Google profile
                const userData: CreateUserRequest = {
                    email: result.user!.email!,
                    displayName: result.user!.displayName || '',
                    firstName: result.user!.displayName?.split(' ')[0] || '',
                    lastName: result.user!.displayName?.split(' ').slice(1).join(' ') || '',
                    avatar: result.user!.photoURL || '',
                    role: 'user',
                    isActive: true
                };
                
                await this.userService.createUser(userData);
                user = await this.userService.getUserByEmail(result.user!.email!);
            }
            
            this.setLoading(false);
            this.router.navigate(['/signed-in-redirect']);
            
            return {
                success: true,
                data: user,
                message: 'Signed in with Google successfully'
            };
        } catch (error: any) {
            this.setLoading(false);
            return this.handleAuthError(error);
        }
    }

    signOut(): Observable<ApiResponse<void>> {
        this.setLoading(true);
        
        return from(this.performSignOut());
    }

    private async performSignOut(): Promise<ApiResponse<void>> {
        try {
            await this.firebaseService.signOut();
            
            this.setLoading(false);
            this.router.navigate(['/sign-in']);
            
            return {
                success: true,
                message: 'Signed out successfully'
            };
        } catch (error: any) {
            this.setLoading(false);
            return this.handleAuthError(error);
        }
    }

    sendPasswordResetEmail(email: string): Observable<ApiResponse<void>> {
        this.setLoading(true);
        
        return from(this.performPasswordReset(email));
    }

    private async performPasswordReset(email: string): Promise<ApiResponse<void>> {
        try {
            await this.firebaseService.sendPasswordResetEmail(email);
            
            this.setLoading(false);
            
            return {
                success: true,
                message: 'Password reset email sent'
            };
        } catch (error: any) {
            this.setLoading(false);
            return this.handleAuthError(error);
        }
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    get isLoading(): boolean {
        return this.loadingSubject.value;
    }

    hasRole(role: string): boolean {
        return this.currentUser?.role === role;
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.includes(this.currentUser?.role || '');
    }

    private setLoading(loading: boolean): void {
        this.loadingSubject.next(loading);
    }

    private handleAuthError(error: any): ApiResponse<any> {
        console.error('Authentication error:', error);
        
        let message = 'Ha ocurrido un error';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/email-already-in-use':
                message = 'El email ya está registrado';
                break;
            case 'auth/weak-password':
                message = 'La contraseña es muy débil';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/user-disabled':
                message = 'Usuario deshabilitado';
                break;
            case 'auth/too-many-requests':
                message = 'Demasiados intentos. Intenta más tarde';
                break;
            default:
                message = error.message || 'Error de autenticación';
        }
        
        return {
            success: false,
            error: {
                code: error.code || 'AUTH_ERROR',
                message,
                details: error,
                timestamp: new Date()
            }
        };
    }
}