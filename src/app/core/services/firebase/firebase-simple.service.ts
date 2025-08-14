import { Injectable, inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { User } from '../../models/user.model';
import { firstValueFrom } from 'rxjs';

export interface QueryFilter {
    field: string;
    operator: firebase.firestore.WhereFilterOp;
    value: any;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseSimpleService {
    private firestore = inject(AngularFirestore);
    private afAuth = inject(AngularFireAuth);
    
    // Auth Methods - Return Promises to avoid RxJS conflicts
    async signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInWithEmailAndPassword(email, password);
    }
    
    async createUserWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.createUserWithEmailAndPassword(email, password);
    }
    
    async signOut(): Promise<void> {
        return this.afAuth.signOut();
    }
    
    async sendPasswordResetEmail(email: string): Promise<void> {
        return this.afAuth.sendPasswordResetEmail(email);
    }
    
    async signInWithGoogle(): Promise<firebase.auth.UserCredential> {
        const provider = new firebase.auth.GoogleAuthProvider();
        return this.afAuth.signInWithPopup(provider);
    }
    
    // Auth state as Promise-based method
    async getCurrentUser(): Promise<firebase.User | null> {
        return this.afAuth.currentUser;
    }
    
    // For components that need auth state, use this method
    onAuthStateChanged(callback: (user: firebase.User | null) => void) {
        return this.afAuth.onAuthStateChanged(callback);
    }
    
    // Firestore Methods - Simplified to avoid RxJS conflicts
    getCollection(collectionName: string): AngularFirestoreCollection<any> {
        return this.firestore.collection(collectionName);
    }
    
    async createDocument(collectionName: string, data: any): Promise<string> {
        const docData = {
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await this.getCollection(collectionName).add(docData);
        return docRef.id;
    }
    
    async getDocument(collectionName: string, id: string): Promise<any | null> {
        const doc = await this.getCollection(collectionName).doc(id).get().toPromise();
        if (doc && doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    }
    
    async getDocuments(collectionName: string, filters: QueryFilter[] = []): Promise<any[]> {
        let query: any = this.getCollection(collectionName).ref;
    
        // Apply filters
        filters.forEach(filter => {
            query = query.where(filter.field, filter.operator, filter.value);
        });
        
        const snapshot = await query.get();
        
        if (!snapshot || !snapshot.docs) {
            return [];
        }
        
        return snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    
    async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
        const updateData = {
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        return this.getCollection(collectionName).doc(id).update(updateData);
    }
    
    async deleteDocument(collectionName: string, id: string): Promise<void> {
        return this.getCollection(collectionName).doc(id).delete();
    }
    
    // Real-time subscriptions - Use native Firebase onSnapshot
    onDocumentsChanged(collectionName: string, filters: QueryFilter[] = [], callback: (docs: any[]) => void): () => void {
        let query: any = this.getCollection(collectionName).ref;
        
        // Apply filters
        filters.forEach(filter => {
            query = query.where(filter.field, filter.operator, filter.value);
        });
        
        return query.onSnapshot((snapshot: any) => {
            if (!snapshot || !snapshot.docs) {
                callback([]);
                return;
            }
            
            const docs = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(docs);
        });
    }
}