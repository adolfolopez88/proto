import { Injectable, inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { BaseDocument } from './firebase-real.service';

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
export abstract class BaseRepositoryService<T extends BaseDocument> {
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
    async createDocument(data: Partial<T>): Promise<string> {
        try {
            const docData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.getCollection().add(docData as T);
            return docRef.id;
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }
    }

    // Get document by ID
    async getDocument(id: string): Promise<T | null> {
        try {
            const doc = await this.getCollection().doc(id).get().toPromise();
            if (doc && doc.exists) {
                return { id: doc.id, ...doc.data() } as T;
            }
            return null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw new Error('Failed to get document');
        }
    }

    // Get documents with filters
    async getDocuments(filters: QueryFilter[] = [], options: QueryOptions = {}): Promise<T[]> {
        try {
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

    // Get documents with real-time updates - Using callback pattern
    onDocumentsChanged(callback: (documents: T[]) => void, filters: QueryFilter[] = [], options: QueryOptions = {}): () => void {
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

    // Update document
    async updateDocument(id: string, data: Partial<T>): Promise<void> {
        try {
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.getCollection().doc(id).update(updateData);
        } catch (error) {
            console.error('Error updating document:', error);
            throw new Error('Failed to update document');
        }
    }

    // Delete document
    async deleteDocument(id: string): Promise<void> {
        try {
            await this.getCollection().doc(id).delete();
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete document');
        }
    }

    // Batch operations
    async batchCreate(documents: Partial<T>[]): Promise<string[]> {
        try {
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

            await batch.commit();
            return docRefs.map(ref => ref.id);
        } catch (error) {
            console.error('Error in batch create:', error);
            throw new Error('Failed to batch create documents');
        }
    }

    // Batch update
    async batchUpdate(updates: { id: string; data: Partial<T> }[]): Promise<void> {
        try {
            const batch = this.firestore.firestore.batch();

            updates.forEach(update => {
                const docRef = this.getCollection().doc(update.id).ref;
                const updateData = {
                    ...update.data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                batch.update(docRef, updateData);
            });

            await batch.commit();
        } catch (error) {
            console.error('Error in batch update:', error);
            throw new Error('Failed to batch update documents');
        }
    }

    // Batch delete
    async batchDelete(ids: string[]): Promise<void> {
        try {
            const batch = this.firestore.firestore.batch();

            ids.forEach(id => {
                const docRef = this.getCollection().doc(id).ref;
                batch.delete(docRef);
            });

            await batch.commit();
        } catch (error) {
            console.error('Error in batch delete:', error);
            throw new Error('Failed to batch delete documents');
        }
    }

    // Count documents (requires composite index for complex queries)
    async countDocuments(filters: QueryFilter[] = []): Promise<number> {
        const docs = await this.getDocuments(filters);
        return docs.length;
    }

    // Check if document exists
    async documentExists(id: string): Promise<boolean> {
        const doc = await this.getCollection().doc(id).get().toPromise();
        return doc ? doc.exists : false;
    }
}