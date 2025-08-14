import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat/app';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { firebaseConfig } from './config/firebase.config';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireAuthModule,
        AngularFirestoreModule.enablePersistence({
            synchronizeTabs: true
        }),
        AngularFireStorageModule
    ],
    providers: [
        // Firebase services are automatically provided by the modules above
    ]
})
export class FirebaseRealModule {
    constructor() {
        console.log('🔥 Firebase Real Module initialized');
        console.log('📧 Auth Domain:', firebaseConfig.authDomain);
        console.log('🗄️ Project ID:', firebaseConfig.projectId);
    }
}