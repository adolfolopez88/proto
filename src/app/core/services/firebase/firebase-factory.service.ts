import { Injectable, inject } from '@angular/core';
import { FirebaseConfigService } from './firebase-config.service';
import { AuthService } from './auth.service';
import { AuthFirebaseService } from './auth-firebase.service';
import { AuthSimpleService } from './auth-simple.service';
import { UserService } from './user.service';
import { UserFirebaseService } from './user-firebase.service';
import { UserSimpleService } from './user-simple.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseFactoryService {
    private configService = inject(FirebaseConfigService);
    private authMockService = inject(AuthService);
    private authRealService = inject(AuthFirebaseService);
    private authSimpleService = inject(AuthSimpleService);
    private userMockService = inject(UserService);
    private userRealService = inject(UserFirebaseService);
    private userSimpleService = inject(UserSimpleService);

    getAuthService(): AuthService | AuthFirebaseService {
        if (this.configService.isUsingMockServices()) {
            console.log('🔧 Using Mock Auth Service');
            return this.authMockService;
        } else {
            console.log('🔥 Using Real Firebase Auth Service');
            return this.authRealService;
        }
    }

    getAuthSimpleService(): AuthService | AuthSimpleService {
        if (this.configService.isUsingMockServices()) {
            console.log('🔧 Using Mock Auth Service');
            return this.authMockService;
        } else {
            console.log('🔥 Using Simple Firebase Auth Service (Promise-based)');
            return this.authSimpleService;
        }
    }

    getUserService(): UserService | UserFirebaseService {
        if (this.configService.isUsingMockServices()) {
            console.log('🔧 Using Mock User Service');
            return this.userMockService;
        } else {
            console.log('🔥 Using Real Firebase User Service');
            return this.userRealService;
        }
    }

    getUserSimpleService(): UserService | UserSimpleService {
        if (this.configService.isUsingMockServices()) {
            console.log('🔧 Using Mock User Service');
            return this.userMockService;
        } else {
            console.log('🔥 Using Simple Firebase User Service (Promise-based)');
            return this.userSimpleService;
        }
    }

    switchToReal(): void {
        this.configService.switchToRealFirebase();
        console.log('🔄 Services switched to Real Firebase');
    }

    switchToMock(): void {
        this.configService.switchToMockServices();
        console.log('🔄 Services switched to Mock');
    }

    switchToSimple(): void {
        this.configService.switchToRealFirebase();
        console.log('🔄 Services switched to Simple Firebase (Promise-based)');
    }
}