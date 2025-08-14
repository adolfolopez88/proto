import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseRepositoryService } from './base-repository.service';
import { User } from '../../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService extends BaseRepositoryService<any> {
    protected collectionName = '';

    constructor() {
        super(inject(Firestore));
    }

    // Generic method to work with any collection
    collection<T>(collectionName: string) {
        return new CollectionService<T>(this.firestore, collectionName);
    }
}

export class CollectionService<T> extends BaseRepositoryService<T> {
    protected collectionName: string;

    constructor(firestore: Firestore, collectionName: string) {
        super(firestore);
        this.collectionName = collectionName;
    }
}

// Specific services for different entities
@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseRepositoryService<User> {
    protected collectionName = 'users';

    constructor() {
        super(inject(Firestore));
    }

    // User-specific methods can be added here
    async createUserProfile(uid: string, userData: Partial<User>) {
        return this.create({ ...userData, uid } as any);
    }

    getUserByEmail(email: string) {
        return this.getAll({
            filters: [{ field: 'email', operator: '==', value: email }],
            limit: 1
        });
    }

    getUsersByRole(roleId: string) {
        return this.getAll({
            filters: [{ field: 'roles', operator: 'array-contains', value: roleId }]
        });
    }
}