import { BaseDocument } from '../services/firebase/firebase-real.service';

export interface User extends BaseDocument {
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: 'admin' | 'user' | 'moderator';
    isActive?: boolean;
    phone?: string;
    address?: string ;
    bio?: string ;
    lastLoginAt?: any;
    preferences?: {
        theme?: string;
        language?: string;
        notifications?: boolean;
    };
}

export interface CreateUserRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    password?: string;
}

export interface UpdateUserRequest extends Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>> {}