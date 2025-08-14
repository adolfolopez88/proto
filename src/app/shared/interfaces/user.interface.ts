import { BaseEntity } from './base-entity.interface';

export interface User extends BaseEntity {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    roles: UserRole[];
    permissions: Permission[];
    profile?: UserProfile;
    preferences?: UserPreferences;
}

export interface UserRole {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
}

export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
}

export interface UserProfile {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    department?: string;
    position?: string;
    location?: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: NotificationPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
}