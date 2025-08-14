export interface User {
    id?: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: 'admin' | 'user' | 'moderator';
    isActive?: boolean;
    createdAt?: any;
    updatedAt?: any;
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