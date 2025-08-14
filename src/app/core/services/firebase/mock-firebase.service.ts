import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, CreateUserRequest } from '../../models/user.model';

// Mock Firebase Service - Remove when real Firebase is working
@Injectable({
    providedIn: 'root'
})
export class MockFirebaseService {
    private users: User[] = [
        {
            id: '1',
            email: 'admin@example.com',
            displayName: 'Admin User',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            lastLoginAt: new Date()
        },
        {
            id: '2',
            email: 'user@example.com',
            displayName: 'Regular User',
            firstName: 'Regular',
            lastName: 'User',
            role: 'user',
            isActive: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02')
        }
    ];

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public currentUser$ = this.currentUserSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();

    // Auth Methods
    signIn(email: string, password: string): Observable<User | null> {
        this.setLoading(true);
        
        return of(null).pipe(
            delay(1000),
            map(() => {
                const user = this.users.find(u => u.email === email);
                if (user && password === 'password123') {
                    this.currentUserSubject.next(user);
                    this.setLoading(false);
                    return user;
                }
                this.setLoading(false);
                throw new Error('Invalid credentials');
            })
        );
    }

    signUp(userData: CreateUserRequest & { password: string }): Observable<string> {
        this.setLoading(true);
        
        return of(null).pipe(
            delay(1000),
            map(() => {
                const existingUser = this.users.find(u => u.email === userData.email);
                if (existingUser) {
                    this.setLoading(false);
                    throw new Error('Email already exists');
                }

                const newUser: User = {
                    id: (this.users.length + 1).toString(),
                    ...userData,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                delete (newUser as any).password;
                this.users.push(newUser);
                this.setLoading(false);
                return newUser.id!;
            })
        );
    }

    signOut(): Observable<void> {
        this.currentUserSubject.next(null);
        return of(undefined).pipe(delay(500));
    }

    sendPasswordResetEmail(email: string): Observable<void> {
        return of(undefined).pipe(delay(1000));
    }

    // User Methods
    getUserByEmail(email: string): Observable<User | null> {
        return of(this.users.find(u => u.email === email) || null).pipe(delay(300));
    }

    getAllUsers(): Observable<User[]> {
        return of([...this.users]).pipe(delay(500));
    }

    getActiveUsers(): Observable<User[]> {
        return of(this.users.filter(u => u.isActive)).pipe(delay(500));
    }

    getUsersByRole(role: string): Observable<User[]> {
        return of(this.users.filter(u => u.role === role)).pipe(delay(500));
    }

    createUser(userData: CreateUserRequest): Observable<string> {
        const newUser: User = {
            id: (this.users.length + 1).toString(),
            ...userData,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.users.push(newUser);
        return of(newUser.id!).pipe(delay(500));
    }

    updateUser(userId: string, userData: Partial<User>): Observable<void> {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...userData,
                updatedAt: new Date()
            };
        }
        return of(undefined).pipe(delay(500));
    }

    deactivateUser(userId: string): Observable<void> {
        return this.updateUser(userId, { isActive: false });
    }

    updateLastLogin(userId: string): Observable<void> {
        return this.updateUser(userId, { lastLoginAt: new Date() });
    }

    getUserStats(): Observable<{total: number, active: number, inactive: number, byRole: any}> {
        const active = this.users.filter(u => u.isActive).length;
        const byRole = this.users.reduce((acc, user) => {
            acc[user.role || 'user'] = (acc[user.role || 'user'] || 0) + 1;
            return acc;
        }, {} as any);

        const stats = {
            total: this.users.length,
            active,
            inactive: this.users.length - active,
            byRole
        };

        return of(stats).pipe(delay(500));
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

    private setLoading(loading: boolean): void {
        this.loadingSubject.next(loading);
    }
}