import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { MockFirebaseService } from './mock-firebase.service';
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
export class AuthService {
    private mockFirebase = inject(MockFirebaseService);
    private router = inject(Router);

    public currentUser$ = this.mockFirebase.currentUser$;
    public loading$ = this.mockFirebase.loading$;

    signIn(credentials: LoginCredentials): Observable<ApiResponse<User>> {
        return this.mockFirebase.signIn(credentials.email, credentials.password).pipe(
            map(user => {
                if (user) {
                    this.router.navigate(['/signed-in-redirect']);
                    return {
                        success: true,
                        data: user,
                        message: 'Signed in successfully'
                    };
                }
                return {
                    success: false,
                    error: {
                        code: 'AUTH_ERROR',
                        message: 'Invalid credentials',
                        timestamp: new Date()
                    }
                };
            })
        );
    }

    signUp(data: RegisterData): Observable<ApiResponse<User>> {
        if (data.password !== data.confirmPassword) {
            return new Observable(observer => {
                observer.next({
                    success: false,
                    error: {
                        code: 'PASSWORDS_DONT_MATCH',
                        message: 'Las contraseñas no coinciden',
                        timestamp: new Date()
                    }
                });
            });
        }

        return this.mockFirebase.signUp(data).pipe(
            map(userId => ({
                success: true,
                data: { id: userId, ...data } as User,
                message: 'Account created successfully'
            }))
        );
    }

    signInWithGoogle(): Observable<ApiResponse<User>> {
        // Mock Google login
        const mockGoogleUser: CreateUserRequest = {
            email: 'google.user@example.com',
            displayName: 'Google User',
            firstName: 'Google',
            lastName: 'User',
            role: 'user'
        };

        return this.mockFirebase.signUp({ ...mockGoogleUser, password: 'googleauth' }).pipe(
            map(userId => ({
                success: true,
                data: { id: userId, ...mockGoogleUser } as User,
                message: 'Signed in with Google successfully'
            }))
        );
    }

    signOut(): Observable<ApiResponse<void>> {
        return this.mockFirebase.signOut().pipe(
            map(() => {
                this.router.navigate(['/sign-in']);
                return {
                    success: true,
                    message: 'Signed out successfully'
                };
            })
        );
    }

    sendPasswordResetEmail(email: string): Observable<ApiResponse<void>> {
        return this.mockFirebase.sendPasswordResetEmail(email).pipe(
            map(() => ({
                success: true,
                message: 'Password reset email sent'
            }))
        );
    }

    get currentUser(): User | null {
        return this.mockFirebase.currentUser;
    }

    get isAuthenticated(): boolean {
        return this.mockFirebase.isAuthenticated;
    }

    get isLoading(): boolean {
        return this.mockFirebase.isLoading;
    }

    hasRole(role: string): boolean {
        return this.currentUser?.role === role;
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.includes(this.currentUser?.role || '');
    }
}