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
        AngularFirestoreModule,
        AngularFireStorageModule
    ]
})
export class FirebaseModule {}