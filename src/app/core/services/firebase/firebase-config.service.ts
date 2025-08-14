import { Injectable } from '@angular/core';

export interface FirebaseAppConfig {
    useMockServices: boolean;
    useEmulators: boolean;
    emulatorConfig?: {
        auth: { host: string; port: number };
        firestore: { host: string; port: number };
        storage: { host: string; port: number };
    };
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseConfigService {
    
    private config: FirebaseAppConfig = {
        // Set to false to use real Firebase, true to use mock services
        useMockServices: true, // Change this to switch between mock and real
        useEmulators: false,
        emulatorConfig: {
            auth: { host: 'localhost', port: 9099 },
            firestore: { host: 'localhost', port: 8080 },
            storage: { host: 'localhost', port: 9199 }
        }
    };

    getConfig(): FirebaseAppConfig {
        return this.config;
    }

    isUsingMockServices(): boolean {

          console.log(this.config);
        return this.config.useMockServices;
    }

    isUsingEmulators(): boolean {
        return this.config.useEmulators;
    }

    switchToRealFirebase(): void {
        this.config.useMockServices = false;
        console.log('🔥 Switched to Real Firebase Services');
    }

    switchToMockServices(): void {
        this.config.useMockServices = true;
        console.log('🔧 Switched to Mock Services');
    }

    enableEmulators(): void {
        this.config.useEmulators = true;
        console.log('🔧 Firebase Emulators enabled');
    }

    disableEmulators(): void {
        this.config.useEmulators = false;
        console.log('🔥 Firebase Emulators disabled - using production Firebase');
    }
}