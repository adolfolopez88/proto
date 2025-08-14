import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseRealService, QueryFilter, BaseDocument } from './firebase-real.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserFirebaseService {
    private firebaseService = inject(FirebaseRealService);
    private readonly collectionName = 'users';

    getUserByEmail(email: string): Observable<User | null> {
        const filters: QueryFilter[] = [
            { field: 'email', operator: '==', value: email }
        ];
        return this.firebaseService.getDocuments$<User>(this.collectionName, filters).pipe(
            map(users => users.length > 0 ? users[0] : null)
        );
    }

    getAllUsers(): Promise<User[]> {
        return this.firebaseService.getDocuments<User>(this.collectionName);
    }

    getAllUsers$(): Observable<User[]> {
        return this.firebaseService.getDocuments$<User>(this.collectionName);
    }

    getActiveUsers(): Promise<User[]> {
        const filters: QueryFilter[] = [
            { field: 'isActive', operator: '==', value: true }
        ];
        return this.firebaseService.getDocuments<User>(this.collectionName, filters);
    }

    getActiveUsers$(): Observable<User[]> {
        const filters: QueryFilter[] = [
            { field: 'isActive', operator: '==', value: true }
        ];
        return this.firebaseService.getDocuments$<User>(this.collectionName, filters);
    }

    getUsersByRole(role: string): Promise<User[]> {
        const filters: QueryFilter[] = [
            { field: 'role', operator: '==', value: role }
        ];
        return this.firebaseService.getDocuments<User>(this.collectionName, filters);
    }

    createUser(userData: CreateUserRequest): Observable<string> {
        const user: User = {
            ...userData,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        return this.firebaseService.createDocument$<User>(this.collectionName, user);
    }

    updateUser(userId: string, userData: UpdateUserRequest): Observable<void> {
        const updateData = {
            ...userData,
            updatedAt: new Date()
        };
        
        return this.firebaseService.updateDocument$<User>(this.collectionName, userId, updateData);
    }

    deactivateUser(userId: string): Observable<void> {
        return this.firebaseService.updateDocument$<User>(this.collectionName, userId, {
            isActive: false,
            updatedAt: new Date()
        });
    }

    updateLastLogin(userId: string): Observable<void> {
        return this.firebaseService.updateDocument$<User>(this.collectionName, userId, {
            lastLoginAt: new Date(),
            updatedAt: new Date()
        });
    }

    getUsersCreatedAfter(date: Date): Observable<User[]> {
        const filters: QueryFilter[] = [
            { field: 'createdAt', operator: '>=', value: date }
        ];
        return this.firebaseService.getDocuments$<User>(this.collectionName, filters);
    }

    searchUsersByName(searchTerm: string): Observable<User[]> {
        // Firestore doesn't support text search, so we'll get all users and filter client-side
        // For production, consider using Algolia or Elasticsearch
        const searchTermLower = searchTerm.toLowerCase();
        
        return this.firebaseService.getDocuments$<User>(this.collectionName).pipe(
            map(users => users.filter(user => 
                (user.displayName?.toLowerCase().includes(searchTermLower)) ||
                (user.firstName?.toLowerCase().includes(searchTermLower)) ||
                (user.lastName?.toLowerCase().includes(searchTermLower))
            ))
        );
    }

    getUserStats(): Observable<{total: number, active: number, inactive: number, byRole: any}> {
        return this.firebaseService.getDocuments$<User>(this.collectionName).pipe(
            map(users => {
                const active = users.filter(u => u.isActive).length;
                const byRole = users.reduce((acc, user) => {
                    acc[user.role || 'user'] = (acc[user.role || 'user'] || 0) + 1;
                    return acc;
                }, {} as any);

                return {
                    total: users.length,
                    active,
                    inactive: users.length - active,
                    byRole
                };
            })
        );
    }

    /*
    // Real-time methods
    getUsersRealTime(): Observable<User[]> {
        return this.firebaseService.getDocumentsRealTime<User>(this.collectionName);
    }

    getActiveUsersRealTime(): Observable<User[]> {
        const filters: QueryFilter[] = [
            { field: 'isActive', operator: '==', value: true }
        ];
        return this.firebaseService.getDocumentsRealTime<User>(this.collectionName, filters);
    }

    getUsersByRoleRealTime(role: string): Observable<User[]> {
        const filters: QueryFilter[] = [
            { field: 'role', operator: '==', value: role }
        ];
        return this.firebaseService.getDocumentsRealTime<User>(this.collectionName, filters);
    }*/

    /*
    // Alias methods for compatibility
    getDocuments(filters: QueryFilter[] = []): Observable<User[]> {
        return this.firebaseService.getDocuments<User>(this.collectionName, filters);
    }

    getDocumentsRealTime(filters: QueryFilter[] = []): Observable<User[]> {
        return this.firebaseService.getDocumentsRealTime<User>(this.collectionName, filters);
    }

    createDocument(data: Partial<User>): Observable<string> {
        return this.firebaseService.createDocument<User>(this.collectionName, data);
    }

    updateDocument(id: string, data: Partial<User>): Observable<void> {
        return this.firebaseService.updateDocument<User>(this.collectionName, id, data);
    }

    deleteDocument(id: string): Observable<void> {
        return this.firebaseService.deleteDocument(this.collectionName, id);
    }*/
}