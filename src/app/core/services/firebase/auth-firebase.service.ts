import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, map, switchMap, catchError, of, tap } from 'rxjs';
import { FirebaseRealService } from './firebase-real.service';
import { UserFirebaseService } from './user-firebase.service';
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
export class AuthFirebaseService {
    private firebaseService = inject(FirebaseRealService);
    private userService = inject(UserFirebaseService);
    private router = inject(Router);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public currentUser$ = this.currentUserSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();

    constructor() {
        this.initializeAuthStateListener();
    }

    private initializeAuthStateListener(): void {
        this.firebaseService.authState$.subscribe((firebaseUser) => {
            if (firebaseUser) {
                this.loadUserProfile(firebaseUser);
            } else {
                this.currentUserSubject.next(null);
            }
        });
    }

    private loadUserProfile(firebaseUser: firebase.default.User): void {
        this.userService.getUserByEmail(firebaseUser.email!)
            .subscribe({
                next: (user) => {
                    this.currentUserSubject.next(user);
                    if (user) {
                        this.userService.updateLastLogin(user.id!).subscribe();
                    }
                },
                error: (error) => {
                    console.error('Error loading user profile:', error);
                    this.currentUserSubject.next(null);
                }
            });
    }

    signIn(credentials: LoginCredentials): Observable<ApiResponse<User>> {
        this.setLoading(true);
        
        return this.firebaseService.signInWithEmailAndPassword$(credentials.email, credentials.password).pipe(
            switchMap(userCredential => 
                this.userService.getUserByEmail(userCredential.user!.email!).pipe(
                    map(user => ({
                        success: true,
                        data: user,
                        message: 'Signed in successfully'
                    }))
                )
            ),
            tap(response => {
                this.setLoading(false);
                if (response.success) {
                    this.router.navigate(['/signed-in-redirect']);
                }
            }),
            catchError(error => {
                this.setLoading(false);
                return of(this.handleAuthError(error));
            })
        );
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
        
        return this.firebaseService.createUserWithEmailAndPassword$(data.email, data.password).pipe(
            switchMap(userCredential => {
                // Update Firebase Auth profile
                if (data.displayName && userCredential.user) {
                    userCredential.user.updateProfile({
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

                return this.userService.createUser(userData).pipe(
                    switchMap(() => this.userService.getUserByEmail(data.email)),
                    map(user => ({
                        success: true,
                        data: user,
                        message: 'Account created successfully'
                    }))
                );
            }),
            tap(response => {
                this.setLoading(false);
            }),
            catchError(error => {
                this.setLoading(false);
                return of(this.handleAuthError(error));
            })
        );
    }

    signInWithGoogle(): Observable<ApiResponse<User>> {
        this.setLoading(true);
        
        return this.firebaseService.signInWithGoogle$().pipe(
            switchMap(result => {
                return this.userService.getUserByEmail(result.user!.email!).pipe(
                    switchMap(existingUser => {
                        if (!existingUser) {
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
                            
                            return this.userService.createUser(userData).pipe(
                                switchMap(() => this.userService.getUserByEmail(result.user!.email!))
                            );
                        }
                        return of(existingUser);
                    }),
                    map(user => ({
                        success: true,
                        data: user,
                        message: 'Signed in with Google successfully'
                    }))
                );
            }),
            tap(response => {
                this.setLoading(false);
                if (response.success) {
                    this.router.navigate(['/signed-in-redirect']);
                }
            }),
            catchError(error => {
                this.setLoading(false);
                return of(this.handleAuthError(error));
            })
        );
    }

    signOut(): Observable<ApiResponse<void>> {
        this.setLoading(true);
        
        return this.firebaseService.signOut$().pipe(
            map(() => ({
                success: true,
                message: 'Signed out successfully'
            })),
            tap(response => {
                this.setLoading(false);
                if (response.success) {
                    this.router.navigate(['/sign-in']);
                }
            }),
            catchError(error => {
                this.setLoading(false);
                return of(this.handleAuthError(error));
            })
        );
    }

    sendPasswordResetEmail(email: string): Observable<ApiResponse<void>> {
        this.setLoading(true);
        
        return this.firebaseService.sendPasswordResetEmail$(email).pipe(
            map(() => ({
                success: true,
                message: 'Password reset email sent'
            })),
            tap(() => this.setLoading(false)),
            catchError(error => {
                this.setLoading(false);
                return of(this.handleAuthError(error));
            })
        );
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