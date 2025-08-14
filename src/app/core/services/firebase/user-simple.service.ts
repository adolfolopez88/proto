import { Injectable, inject } from '@angular/core';
import { FirebaseSimpleService, QueryFilter } from './firebase-simple.service';
import { User, CreateUserRequest } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserSimpleService {
    private firebaseService = inject(FirebaseSimpleService);
    private readonly collectionName = 'users';

    async createUser(userData: CreateUserRequest): Promise<string> {
        try {
            const userId = await this.firebaseService.createDocument(this.collectionName, userData);
            return userId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    async getUser(id: string): Promise<User | null> {
        try {
            const user = await this.firebaseService.getDocument(this.collectionName, id);
            return user as User | null;
        } catch (error) {
            console.error('Error getting user:', error);
            throw new Error('Failed to get user');
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const filters: QueryFilter[] = [
                { field: 'email', operator: '==', value: email }
            ];
            
            const users = await this.firebaseService.getDocuments(this.collectionName, filters);
            
            return users.length > 0 ? users[0] as User : null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw new Error('Failed to get user by email');
        }
    }

    async updateUser(id: string, userData: Partial<User>): Promise<void> {
        try {
            await this.firebaseService.updateDocument(this.collectionName, id, userData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.firebaseService.deleteDocument(this.collectionName, id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    async updateLastLogin(id: string): Promise<void> {
        try {
            const updateData = {
                lastLoginAt: new Date().toISOString()
            };
            await this.updateUser(id, updateData);
        } catch (error) {
            console.error('Error updating last login:', error);
            throw new Error('Failed to update last login');
        }
    }

    async getUsersByRole(role: string): Promise<User[]> {
        try {
            const filters: QueryFilter[] = [
                { field: 'role', operator: '==', value: role }
            ];
            
            const users = await this.firebaseService.getDocuments(this.collectionName, filters);
            return users as User[];
        } catch (error) {
            console.error('Error getting users by role:', error);
            throw new Error('Failed to get users by role');
        }
    }

    async getActiveUsers(): Promise<User[]> {
        try {
            const filters: QueryFilter[] = [
                { field: 'isActive', operator: '==', value: true }
            ];
            
            const users = await this.firebaseService.getDocuments(this.collectionName, filters);
            return users as User[];
        } catch (error) {
            console.error('Error getting active users:', error);
            throw new Error('Failed to get active users');
        }
    }

    async toggleUserStatus(id: string): Promise<void> {
        try {
            const user = await this.getUser(id);
            if (!user) {
                throw new Error('User not found');
            }

            const updateData = {
                isActive: !user.isActive
            };
            
            await this.updateUser(id, updateData);
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw new Error('Failed to toggle user status');
        }
    }

    async searchUsers(searchTerm: string): Promise<User[]> {
        try {
            // Note: Firebase doesn't support text search natively
            // This is a basic implementation that searches by email prefix
            const filters: QueryFilter[] = [
                { field: 'email', operator: '>=', value: searchTerm.toLowerCase() },
                { field: 'email', operator: '<=', value: searchTerm.toLowerCase() + '\uf8ff' }
            ];
            
            const users = await this.firebaseService.getDocuments(this.collectionName, filters);
            return users as User[];
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error('Failed to search users');
        }
    }

    async getUserCount(): Promise<number> {
        try {
            const users = await this.firebaseService.getDocuments(this.collectionName);
            return users.length;
        } catch (error) {
            console.error('Error getting user count:', error);
            throw new Error('Failed to get user count');
        }
    }

    async updateUserProfile(id: string, profileData: {
        displayName?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
        phone?: string;
        address?: string;
        bio?: string;
    }): Promise<void> {
        try {
            await this.updateUser(id, profileData);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update user profile');
        }
    }

    async bulkUpdateUsers(updates: { id: string; data: Partial<User> }[]): Promise<void> {
        try {
            // Since we're using promises, we'll do sequential updates
            // In a real implementation, you might want to use Firebase batch operations
            for (const update of updates) {
                await this.updateUser(update.id, update.data);
            }
        } catch (error) {
            console.error('Error in bulk update users:', error);
            throw new Error('Failed to bulk update users');
        }
    }
}