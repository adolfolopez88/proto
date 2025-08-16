import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FirebaseFactoryService } from '../../../../core/services/firebase/firebase-factory.service';
import { FirebaseConfigService } from '../../../../core/services/firebase/firebase-config.service';
import { User } from '../../../../core/models/user.model';
import { UserFirebaseService } from 'app/core/services/firebase/user-firebase.service';

@Component({
    selector: 'app-firebase-migration',
    templateUrl: './firebase-migration.compoment.html'
})
export class FirebaseMigrationComponent implements OnInit, OnDestroy {
    isUsingMock = true;
    isLoading = false;
    testResults: any[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        public firebaseFactory: FirebaseFactoryService,
        public configService: FirebaseConfigService
    ) {}

    ngOnInit(): void {
        this.refreshServices();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    refreshServices(): void {
        this.isUsingMock = this.configService.isUsingMockServices();
        console.log(this.isUsingMock);
        this.logResult('info', 'Services refreshed', { 
            mock: this.isUsingMock,
            emulators: this.configService.isUsingEmulators()
        });
    }

    switchToMock(): void {
        this.firebaseFactory.switchToMock();
        this.refreshServices();
        this.logResult('info', 'Switched to Mock Services', null, true);
    }

    switchToReal(): void {
        this.firebaseFactory.switchToReal();
        this.refreshServices();
        this.logResult('info', 'Switched to Real Firebase', null, true);
    }

    toggleEmulators(): void {
        if (this.configService.isUsingEmulators()) {
            this.configService.disableEmulators();
        } else {
            this.configService.enableEmulators();
        }
        this.logResult('info', 'Emulators toggled', { enabled: this.configService.isUsingEmulators() }, true);
    }

    testLogin(): void {
        this.isLoading = true;
        const authService = this.firebaseFactory.getAuthService();
        
        const credentials = {
            email: 'admin@example.com',
            password: 'password123'
        };

        authService.signIn(credentials)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.logResult('test', 'Login Test', response, response.success);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.logResult('test', 'Login Test', null, false, error.message);
                }
            });
    }

    testRegister(): void {
        this.isLoading = true;
        const authService = this.firebaseFactory.getAuthService();
        
        const registerData = {
            email: 'adolfolopez88@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            firstName: 'Adolfo',
            lastName: 'Lopez',
            displayName: 'adolfolopez88',
            phone: '933761400',
            address: 'Angel Guarello 2943',
            bio: "NO APLICA"
        };

        authService.signUp(registerData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.logResult('test', 'Register Test', response, response.success);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.logResult('test', 'Register Test', null, false, error.message);
                }
            });
    }

    testGoogleAuth(): void {
        this.isLoading = true;
        const authService = this.firebaseFactory.getAuthService();

        authService.signInWithGoogle()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.logResult('test', 'Google Auth Test', response, response.success);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.logResult('test', 'Google Auth Test', null, false, error.message);
                }
            });
    }

    testGetUsers(): void {
        this.isLoading = true;
        const userService = this.firebaseFactory.getUserService();

        if ('getAllUsers' in userService) {
            userService.getAllUsers$()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (users) => {
                        this.isLoading = false;
                        this.logResult('test', 'Get All Users Test', { count: users.length, users }, true);
                    },
                    error: (error) => {
                        this.isLoading = false;
                        this.logResult('test', 'Get All Users Test', null, false, error.message);
                    }
                });
        } else {
            // Para el servicio mock, usar getDocuments
            (userService as any).getDocuments([])
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (users: User[]) => {
                        this.isLoading = false;
                        this.logResult('test', 'Get All Users Test', { count: users.length, users }, true);
                    },
                    error: (error: any) => {
                        this.isLoading = false;
                        this.logResult('test', 'Get All Users Test', null, false, error.message);
                    }
                });
        }
    }

    testGetActiveUsers(): void {
        this.isLoading = true;
        const userService = this.firebaseFactory.getUserService() as UserFirebaseService;

        userService.getActiveUsers$()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (users) => {
                    this.isLoading = false;
                    this.logResult('test', 'Get Active Users Test', { count: users.length, users }, true);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.logResult('test', 'Get Active Users Test', null, false, error.message);
                }
            });
    }

    testUserStats(): void {
        this.isLoading = true;
        const userService = this.firebaseFactory.getUserService();

        userService.getUserStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.isLoading = false;
                    this.logResult('test', 'User Stats Test', stats, true);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.logResult('test', 'User Stats Test', null, false, error.message);
                }
            });
    }

    private logResult(type: string, action: string, data: any, success: boolean = true, error?: string): void {
        this.testResults.unshift({
            timestamp: new Date(),
            type,
            action,
            data,
            success,
            error
        });
        
        // Mantener solo los últimos 20 resultados
        if (this.testResults.length > 20) {
            this.testResults = this.testResults.slice(0, 20);
        }
    }

    clearResults(): void {
        this.testResults = [];
    }

    trackByIndex(index: number): number {
        return index;
    }
}