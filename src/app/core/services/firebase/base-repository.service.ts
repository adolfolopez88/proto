import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

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
export abstract class BaseRepositoryService<T> {
    protected abstract collectionName: string;
    protected firestore = inject(AngularFirestore);
    protected collection: AngularFirestoreCollection<T>;

    constructor() {
        // Collection will be initialized when first accessed via getCollection()
    }

    protected getCollection(): AngularFirestoreCollection<T> {
        if (!this.collection) {
            this.collection = this.firestore.collection<T>(this.collectionName);
        }
        return this.collection;
    }

    // Create a new document
    createDocument(data: Partial<T>): Observable<string> {
        const docData = {
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        return from(this.getCollection().add(docData as T)).pipe(
            map(docRef => docRef.id),
            catchError(error => {
                console.error('Error creating document:', error);
                return throwError(() => new Error('Failed to create document'));
            })
        );
    }

    // Get document by ID
    getDocument(id: string): Observable<T | null> {
        return this.getCollection().doc(id).get().pipe(
            map(doc => {
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() } as T;
                }
                return null;
            }),
            catchError(error => {
                console.error('Error getting document:', error);
                return throwError(() => new Error('Failed to get document'));
            })
        );
    }

    // Get documents with filters
    getDocuments(filters: QueryFilter[] = [], options: QueryOptions = {}): Observable<T[]> {
        let query = this.getCollection().ref as firebase.firestore.Query;

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

        return from(query.get()).pipe(
            map(snapshot => 
                snapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                } as T))
            ),
            catchError(error => {
                console.error('Error getting documents:', error);
                return throwError(() => new Error('Failed to get documents'));
            })
        );
    }

    // Get documents with real-time updates
    getDocumentsRealTime(filters: QueryFilter[] = [], options: QueryOptions = {}): Observable<T[]> {
        let query = this.getCollection().ref as firebase.firestore.Query;

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

        return new Observable<T[]>(observer => {
            const unsubscribe = query.onSnapshot(
                snapshot => {
                    const documents = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as T));
                    observer.next(documents);
                },
                error => {
                    console.error('Error in real-time listener:', error);
                    observer.error(new Error('Failed to listen to documents'));
                }
            );

            return () => unsubscribe();
        });
    }

    // Update document
    updateDocument(id: string, data: Partial<T>): Observable<void> {
        const updateData = {
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        return from(this.getCollection().doc(id).update(updateData)).pipe(
            catchError(error => {
                console.error('Error updating document:', error);
                return throwError(() => new Error('Failed to update document'));
            })
        );
    }

    // Delete document
    deleteDocument(id: string): Observable<void> {
        return from(this.getCollection().doc(id).delete()).pipe(
            catchError(error => {
                console.error('Error deleting document:', error);
                return throwError(() => new Error('Failed to delete document'));
            })
        );
    }

    // Batch operations
    batchCreate(documents: Partial<T>[]): Observable<string[]> {
        const batch = this.firestore.firestore.batch();
        const docRefs: firebase.firestore.DocumentReference[] = [];

        documents.forEach(doc => {
            const docRef = this.getCollection().ref.doc();
            const docData = {
                ...doc,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            batch.set(docRef, docData);
            docRefs.push(docRef);
        });

        return from(batch.commit()).pipe(
            map(() => docRefs.map(ref => ref.id)),
            catchError(error => {
                console.error('Error in batch create:', error);
                return throwError(() => new Error('Failed to batch create documents'));
            })
        );
    }

    // Batch update
    batchUpdate(updates: { id: string; data: Partial<T> }[]): Observable<void> {
        const batch = this.firestore.firestore.batch();

        updates.forEach(update => {
            const docRef = this.getCollection().doc(update.id).ref;
            const updateData = {
                ...update.data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            batch.update(docRef, updateData);
        });

        return from(batch.commit()).pipe(
            catchError(error => {
                console.error('Error in batch update:', error);
                return throwError(() => new Error('Failed to batch update documents'));
            })
        );
    }

    // Batch delete
    batchDelete(ids: string[]): Observable<void> {
        const batch = this.firestore.firestore.batch();

        ids.forEach(id => {
            const docRef = this.getCollection().doc(id).ref;
            batch.delete(docRef);
        });

        return from(batch.commit()).pipe(
            catchError(error => {
                console.error('Error in batch delete:', error);
                return throwError(() => new Error('Failed to batch delete documents'));
            })
        );
    }

    // Count documents (requires composite index for complex queries)
    countDocuments(filters: QueryFilter[] = []): Observable<number> {
        return this.getDocuments(filters).pipe(
            map(docs => docs.length)
        );
    }

    // Check if document exists
    documentExists(id: string): Observable<boolean> {
        return this.getCollection().doc(id).get().pipe(
            map(doc => doc.exists)
        );
    }
}