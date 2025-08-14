import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseFactoryService } from './firebase-factory.service';
import { AuthSimpleService } from './auth-simple.service';
import { UserSimpleService } from './user-simple.service';
import { User, CreateUserRequest } from '../../models/user.model';

@Component({
    selector: 'app-firebase-simple-demo',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="firebase-simple-demo p-6">
            <h2 class="text-2xl font-bold mb-4">Firebase Simple Demo (Promise-based)</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Service Switching -->
                <div class="card">
                    <h3 class="text-lg font-semibold mb-3">Service Control</h3>
                    <div class="space-y-2">
                        <button 
                            (click)="switchToMock()" 
                            class="btn btn-outline w-full">
                            Use Mock Services
                        </button>
                        <button 
                            (click)="switchToSimple()" 
                            class="btn btn-primary w-full">
                            Use Simple Firebase (Promise-based)
                        </button>
                    </div>
                </div>

                <!-- Auth Demo -->
                <div class="card">
                    <h3 class="text-lg font-semibold mb-3">Authentication Demo</h3>
                    <div class="space-y-2">
                        <button 
                            (click)="testLogin()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Test Login
                        </button>
                        <button 
                            (click)="testGoogleAuth()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Test Google Auth
                        </button>
                        <button 
                            (click)="testLogout()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Test Logout
                        </button>
                    </div>
                </div>

                <!-- User Demo -->
                <div class="card">
                    <h3 class="text-lg font-semibold mb-3">User Management Demo</h3>
                    <div class="space-y-2">
                        <button 
                            (click)="testCreateUser()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Create Test User
                        </button>
                        <button 
                            (click)="testGetUsers()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Get All Users
                        </button>
                        <button 
                            (click)="testSearchUsers()" 
                            class="btn btn-outline w-full"
                            [disabled]="loading">
                            Search Users
                        </button>
                    </div>
                </div>

                <!-- Results -->
                <div class="card">
                    <h3 class="text-lg font-semibold mb-3">Results</h3>
                    <div class="bg-gray-100 p-3 rounded min-h-[200px] overflow-auto">
                        <pre>{{ results | json }}</pre>
                    </div>
                    <div class="mt-2">
                        <button 
                            (click)="clearResults()" 
                            class="btn btn-sm btn-outline">
                            Clear Results
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading Overlay -->
            <div *ngIf="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .card {
            @apply bg-white p-4 rounded-lg shadow-md;
        }
        .btn {
            @apply px-4 py-2 rounded font-medium transition-colors;
        }
        .btn-primary {
            @apply bg-blue-600 text-white hover:bg-blue-700;
        }
        .btn-outline {
            @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
        }
        .btn-sm {
            @apply px-3 py-1 text-sm;
        }
        .btn:disabled {
            @apply opacity-50 cursor-not-allowed;
        }
    `]
})
export class FirebaseSimpleDemoComponent implements OnInit {
    private factory = inject(FirebaseFactoryService);
    private authService!: AuthSimpleService;
    private userService!: UserSimpleService;

    loading = false;
    results: any = {};

    ngOnInit() {
        this.switchToSimple();
    }

    switchToMock(): void {
        this.factory.switchToMock();
        this.results = { message: 'Switched to Mock services' };
    }

    switchToSimple(): void {
        this.factory.switchToSimple();
        this.authService = this.factory.getAuthSimpleService() as AuthSimpleService;
        this.userService = this.factory.getUserSimpleService() as UserSimpleService;
        this.results = { message: 'Switched to Simple Firebase services (Promise-based)' };
    }

    async testLogin(): Promise<void> {
        this.loading = true;
        try {
            // Since AuthSimpleService returns Observables, we convert to Promise
            const result = await this.authService.signIn({
                email: 'test@example.com',
                password: 'password123'
            }).toPromise();

            this.results = {
                action: 'Login Test',
                success: result?.success,
                message: result?.message,
                user: result?.data
            };
        } catch (error: any) {
            this.results = {
                action: 'Login Test',
                error: error.message || 'Login failed'
            };
        } finally {
            this.loading = false;
        }
    }

    async testGoogleAuth(): Promise<void> {
        this.loading = true;
        try {
            const result = await this.authService.signInWithGoogle().toPromise();

            this.results = {
                action: 'Google Auth Test',
                success: result?.success,
                message: result?.message,
                user: result?.data
            };
        } catch (error: any) {
            this.results = {
                action: 'Google Auth Test',
                error: error.message || 'Google auth failed'
            };
        } finally {
            this.loading = false;
        }
    }

    async testLogout(): Promise<void> {
        this.loading = true;
        try {
            const result = await this.authService.signOut().toPromise();

            this.results = {
                action: 'Logout Test',
                success: result?.success,
                message: result?.message
            };
        } catch (error: any) {
            this.results = {
                action: 'Logout Test',
                error: error.message || 'Logout failed'
            };
        } finally {
            this.loading = false;
        }
    }

    async testCreateUser(): Promise<void> {
        this.loading = true;
        try {
            const userData: CreateUserRequest = {
                email: `test${Date.now()}@example.com`,
                displayName: 'Test User',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                isActive: true
            };

            const userId = await this.userService.createUser(userData);

            this.results = {
                action: 'Create User Test',
                success: true,
                userId: userId,
                userData: userData
            };
        } catch (error: any) {
            this.results = {
                action: 'Create User Test',
                error: error.message || 'Failed to create user'
            };
        } finally {
            this.loading = false;
        }
    }

    async testGetUsers(): Promise<void> {
        this.loading = true;
        try {
            const users = await this.userService.getActiveUsers();

            this.results = {
                action: 'Get Users Test',
                success: true,
                count: users.length,
                users: users.slice(0, 5) // Show first 5 users
            };
        } catch (error: any) {
            this.results = {
                action: 'Get Users Test',
                error: error.message || 'Failed to get users'
            };
        } finally {
            this.loading = false;
        }
    }

    async testSearchUsers(): Promise<void> {
        this.loading = true;
        try {
            const users = await this.userService.searchUsers('test');

            this.results = {
                action: 'Search Users Test',
                success: true,
                searchTerm: 'test',
                count: users.length,
                users: users.slice(0, 3) // Show first 3 results
            };
        } catch (error: any) {
            this.results = {
                action: 'Search Users Test',
                error: error.message || 'Failed to search users'
            };
        } finally {
            this.loading = false;
        }
    }

    clearResults(): void {
        this.results = {};
    }
}