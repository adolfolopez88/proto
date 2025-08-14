import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockFirebaseService } from './mock-firebase.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private mockFirebase = inject(MockFirebaseService);

    getUserByEmail(email: string): Observable<User | null> {
        return this.mockFirebase.getUserByEmail(email);
    }

    getActiveUsers(): Observable<User[]> {
        return this.mockFirebase.getActiveUsers();
    }

    getUsersByRole(role: string): Observable<User[]> {
        return this.mockFirebase.getUsersByRole(role);
    }

    createUser(userData: CreateUserRequest): Observable<string> {
        return this.mockFirebase.createUser(userData);
    }

    updateUser(userId: string, userData: UpdateUserRequest): Observable<void> {
        return this.mockFirebase.updateUser(userId, userData);
    }

    deactivateUser(userId: string): Observable<void> {
        return this.mockFirebase.deactivateUser(userId);
    }

    updateLastLogin(userId: string): Observable<void> {
        return this.mockFirebase.updateLastLogin(userId);
    }

    getUsersCreatedAfter(date: Date): Observable<User[]> {
        return this.mockFirebase.getAllUsers();
    }

    searchUsersByName(searchTerm: string): Observable<User[]> {
        return this.mockFirebase.getAllUsers();
    }

    getUserStats(): Observable<{total: number, active: number, inactive: number, byRole: any}> {
        return this.mockFirebase.getUserStats();
    }

    // Alias para compatibilidad con BaseRepository
    getDocuments(filters: any[] = []): Observable<User[]> {
        return this.mockFirebase.getAllUsers();
    }
}