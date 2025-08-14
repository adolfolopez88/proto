import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { User, CreateUserRequest } from '../../models/user.model';

export interface BaseDocument {
    id?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface QueryFilter {
    field: string;
    operator: firebase.firestore.WhereFilterOp;
    value: any;
}

export interface QueryOptions {
    orderBy?: { field: string; direction: 'asc' | 'desc' }[];
    limit?: number;
    startAfter?: any;
    endBefore?: any;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseRealService {
    private firestore = inject(AngularFirestore);
    private afAuth = inject(AngularFireAuth);
    
    // Auth Methods - Promise-based
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
    
    async getCurrentUser(): Promise<firebase.User | null> {
        return this.afAuth.currentUser;
    }
    
    
    onAuthStateChanged(callback: (user: firebase.User | null) => void) {
        // Use native Firebase auth to avoid AngularFire Promise issues
        const auth = this.afAuth;
        return auth.onAuthStateChanged(callback);
    }
    
    // Alternative AngularFire async version
    async onAuthStateChangedAsync(callback: (user: firebase.User | null) => void): Promise<() => void> {
        return this.afAuth.onAuthStateChanged(callback);
    }
    
    // Most reliable method using native Firebase SDK
    onAuthStateChangedNative(callback: (user: firebase.User | null) => void): () => void {
        const auth = firebase.auth();
        return auth.onAuthStateChanged(callback);
    }
    
    // Get auth state as Observable for reactive patterns
    get authState$(){
        return this.afAuth.authState;
    }
    
    // Firestore Methods
    getCollection<T extends BaseDocument>(collectionName: string): AngularFirestoreCollection<T> {
        return this.firestore.collection<T>(collectionName);
    }
    
    async createDocument<T extends BaseDocument>(collectionName: string, data: Partial<T>): Promise<string> {
        try {
            const docData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await this.getCollection<T>(collectionName).add(docData as T);
            return docRef.id;
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }
    }

    async getDocument<T extends BaseDocument>(collectionName: string, id: string): Promise<T | null> {
        try {
            // Method 1: Using AngularFire with better error handling
            const docRef = this.getCollection<T>(collectionName).doc(id);
            const docSnapshot = await docRef.get().toPromise();
            
            if (docSnapshot && docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data) {
                    return { 
                        id: docSnapshot.id, 
                        ...data 
                    } as T;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw new Error('Failed to get document');
        }
    }
    
    // Alternative method using native Firebase SDK to avoid RxJS conflicts
    async getDocumentNative<T extends BaseDocument>(collectionName: string, id: string): Promise<T | null> {
        try {
            // Use native Firebase SDK directly
            const db = this.firestore.firestore;
            const docRef = db.collection(collectionName).doc(id);
            const docSnapshot = await docRef.get();
            
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data) {
                    return { 
                        id: docSnapshot.id, 
                        ...data 
                    } as T;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting document (native):', error);
            throw new Error('Failed to get document');
        }
    }
    
    async getDocuments<T extends BaseDocument>(
        collectionName: string, 
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): Promise<T[]> {
        try {
            let query = this.getCollection<T>(collectionName).ref as firebase.firestore.Query;
            
            // Apply filters
            filters.forEach(filter => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
            
            // Apply ordering
            if (options.orderBy) {
                options.orderBy.forEach(order => {
                    query = query.orderBy(order.field, order.direction);
                });
            }
            
            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            // Apply pagination
            if (options.startAfter) {
                query = query.startAfter(options.startAfter);
            }
            if (options.endBefore) {
                query = query.endBefore(options.endBefore);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as T));

        } catch (error) {
            console.error('Error getting documents:', error);
            throw new Error('Failed to get documents');
        }
    }
    
    // Alternative method using native Firebase SDK
    async getDocumentsNative<T extends BaseDocument>(
        collectionName: string, 
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): Promise<T[]> {
        try {
            // Use native Firebase SDK directly
            const db = this.firestore.firestore;
            let query: firebase.firestore.Query = db.collection(collectionName);
            
            // Apply filters
            filters.forEach(filter => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
            
            // Apply ordering
            if (options.orderBy) {
                options.orderBy.forEach(order => {
                    query = query.orderBy(order.field, order.direction);
                });
            }
            
            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            // Apply pagination
            if (options.startAfter) {
                query = query.startAfter(options.startAfter);
            }
            if (options.endBefore) {
                query = query.endBefore(options.endBefore);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as T));
        } catch (error) {
            console.error('Error getting documents (native):', error);
            throw new Error('Failed to get documents');
        }
    }
    
    async updateDocument<T extends BaseDocument>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
        try {
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.getCollection<T>(collectionName).doc(id).update(updateData);
        } catch (error) {
            console.error('Error updating document:', error);
            throw new Error('Failed to update document');
        }
    }
    
    // Alternative native method for update
    async updateDocumentNative<T extends BaseDocument>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
        try {
            const db = this.firestore.firestore;
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection(collectionName).doc(id).update(updateData);
        } catch (error) {
            console.error('Error updating document (native):', error);
            throw new Error('Failed to update document');
        }
    }
    
    async deleteDocument(collectionName: string, id: string): Promise<void> {
        try {
            await this.getCollection(collectionName).doc(id).delete();
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete document');
        }
    }
    
    // Alternative native method for delete
    async deleteDocumentNative(collectionName: string, id: string): Promise<void> {
        try {
            const db = this.firestore.firestore;
            await db.collection(collectionName).doc(id).delete();
        } catch (error) {
            console.error('Error deleting document (native):', error);
            throw new Error('Failed to delete document');
        }
    }
    
    // Real-time subscriptions - Using callback pattern to avoid RxJS
    onDocumentsChanged<T extends BaseDocument>(
        collectionName: string, 
        callback: (documents: T[]) => void,
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): () => void {
        let query = this.getCollection<T>(collectionName).ref as firebase.firestore.Query;
        
        // Apply filters
        filters.forEach(filter => {
            query = query.where(filter.field, filter.operator, filter.value);
        });
        
        // Apply ordering
        if (options.orderBy) {
            options.orderBy.forEach(order => {
                query = query.orderBy(order.field, order.direction);
            });
        }
        
        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        return query.onSnapshot(
            snapshot => {
                const documents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as T));
                callback(documents);
            },
            error => {
                console.error('Error in real-time listener:', error);
            }
        );
    }
    
    // ============================================================================
    // OBSERVABLE VERSIONS - For reactive patterns
    // ============================================================================
    
    // Auth Observable versions
    signInWithEmailAndPassword$(email: string, password: string): Observable<firebase.auth.UserCredential> {
        return from(this.signInWithEmailAndPassword(email, password));
    }
    
    createUserWithEmailAndPassword$(email: string, password: string): Observable<firebase.auth.UserCredential> {
        return from(this.createUserWithEmailAndPassword(email, password));
    }
    
    signOut$(): Observable<void> {
        return from(this.signOut());
    }
    
    sendPasswordResetEmail$(email: string): Observable<void> {
        return from(this.sendPasswordResetEmail(email));
    }
    
    signInWithGoogle$(): Observable<firebase.auth.UserCredential> {
        return from(this.signInWithGoogle());
    }
    
    getCurrentUser$(): Observable<firebase.User | null> {
        return from(this.getCurrentUser());
    }
    
    // Firestore Observable versions
    createDocument$<T extends BaseDocument>(collectionName: string, data: Partial<T>): Observable<string> {
        return from(this.createDocument<T>(collectionName, data));
    }
    
    getDocument$<T extends BaseDocument>(collectionName: string, id: string): Observable<T | null> {
        return from(this.getDocument<T>(collectionName, id));
    }
    
    getDocuments$<T extends BaseDocument>(
        collectionName: string, 
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): Observable<T[]> {
        return from(this.getDocuments<T>(collectionName, filters, options));
    }
    
    updateDocument$<T extends BaseDocument>(collectionName: string, id: string, data: Partial<T>): Observable<void> {
        return from(this.updateDocument<T>(collectionName, id, data));
    }
    
    deleteDocument$(collectionName: string, id: string): Observable<void> {
        return from(this.deleteDocument(collectionName, id));
    }
    
    // Real-time Observable version (alternative to callback pattern)
    getDocumentsRealTime$<T extends BaseDocument>(
        collectionName: string, 
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): Observable<T[]> {
        return new Observable<T[]>(observer => {
            const unsubscribe = this.onDocumentsChanged<T>(
                collectionName,
                (documents) => observer.next(documents),
                filters,
                options
            );
            
            return () => unsubscribe();
        });
    }
    
    // ============================================================================
    // NATIVE FIREBASE SDK OBSERVABLES - For ultimate compatibility
    // ============================================================================
    
    getDocumentNative$<T extends BaseDocument>(collectionName: string, id: string): Observable<T | null> {
        return from(this.getDocumentNative<T>(collectionName, id));
    }
    
    getDocumentsNative$<T extends BaseDocument>(
        collectionName: string, 
        filters: QueryFilter[] = [], 
        options: QueryOptions = {}
    ): Observable<T[]> {
        return from(this.getDocumentsNative<T>(collectionName, filters, options));
    }
    
    updateDocumentNative$<T extends BaseDocument>(collectionName: string, id: string, data: Partial<T>): Observable<void> {
        return from(this.updateDocumentNative<T>(collectionName, id, data));
    }
    
    deleteDocumentNative$(collectionName: string, id: string): Observable<void> {
        return from(this.deleteDocumentNative(collectionName, id));
    }
}