import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, BehaviorSubject } from 'rxjs';
import { 
    Storage, 
    ref, 
    uploadBytes, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject,
    listAll,
    getMetadata,
    updateMetadata,
    UploadTask,
    UploadTaskSnapshot
} from '@angular/fire/storage';
import { ApiResponse } from '../../../shared/interfaces';

export interface FileUploadProgress {
    progress: number;
    snapshot: UploadTaskSnapshot;
    downloadURL?: string;
}

export interface FileMetadata {
    name: string;
    fullPath: string;
    size: number;
    contentType?: string;
    timeCreated: string;
    updated: string;
    downloadURL?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private storage = inject(Storage);
    private uploadProgressSubject = new BehaviorSubject<FileUploadProgress | null>(null);
    public uploadProgress$ = this.uploadProgressSubject.asObservable();

    uploadFile(
        file: File, 
        path: string, 
        metadata?: any
    ): Observable<ApiResponse<{ downloadURL: string; fullPath: string }>> {
        const storageRef = ref(this.storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        return new Observable(observer => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.uploadProgressSubject.next({
                        progress,
                        snapshot
                    });
                },
                (error) => {
                    observer.error({
                        success: false,
                        error: {
                            code: error.code,
                            message: error.message,
                            details: error,
                            timestamp: new Date()
                        }
                    });
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        this.uploadProgressSubject.next({
                            progress: 100,
                            snapshot: uploadTask.snapshot,
                            downloadURL
                        });
                        
                        observer.next({
                            success: true,
                            data: {
                                downloadURL,
                                fullPath: uploadTask.snapshot.ref.fullPath
                            },
                            message: 'File uploaded successfully'
                        });
                        observer.complete();
                    } catch (error: any) {
                        observer.error({
                            success: false,
                            error: {
                                code: 'DOWNLOAD_URL_ERROR',
                                message: 'Failed to get download URL',
                                details: error,
                                timestamp: new Date()
                            }
                        });
                    }
                }
            );
        });
    }

    uploadFileSimple(file: File, path: string): Observable<ApiResponse<string>> {
        const storageRef = ref(this.storage, path);
        
        return from(uploadBytes(storageRef, file)).pipe(
            map(async (snapshot) => {
                const downloadURL = await getDownloadURL(snapshot.ref);
                return {
                    success: true,
                    data: downloadURL,
                    message: 'File uploaded successfully'
                };
            }),
            catchError(this.handleError.bind(this))
        );
    }

    deleteFile(path: string): Observable<ApiResponse<void>> {
        const storageRef = ref(this.storage, path);
        
        return from(deleteObject(storageRef)).pipe(
            map(() => ({
                success: true,
                message: 'File deleted successfully'
            })),
            catchError(this.handleError.bind(this))
        );
    }

    getDownloadURL(path: string): Observable<ApiResponse<string>> {
        const storageRef = ref(this.storage, path);
        
        return from(getDownloadURL(storageRef)).pipe(
            map((url) => ({
                success: true,
                data: url
            })),
            catchError(this.handleError.bind(this))
        );
    }

    getFileMetadata(path: string): Observable<ApiResponse<FileMetadata>> {
        const storageRef = ref(this.storage, path);
        
        return from(getMetadata(storageRef)).pipe(
            map(async (metadata) => {
                let downloadURL;
                try {
                    downloadURL = await getDownloadURL(storageRef);
                } catch (error) {
                    // Download URL might not be available
                }

                return {
                    success: true,
                    data: {
                        name: metadata.name,
                        fullPath: metadata.fullPath,
                        size: metadata.size,
                        contentType: metadata.contentType,
                        timeCreated: metadata.timeCreated,
                        updated: metadata.updated,
                        downloadURL
                    } as FileMetadata
                };
            }),
            catchError(this.handleError.bind(this))
        );
    }

    listFiles(path: string): Observable<ApiResponse<FileMetadata[]>> {
        const storageRef = ref(this.storage, path);
        
        return from(listAll(storageRef)).pipe(
            map(async (result) => {
                const files: FileMetadata[] = [];
                
                for (const itemRef of result.items) {
                    try {
                        const metadata = await getMetadata(itemRef);
                        const downloadURL = await getDownloadURL(itemRef);
                        
                        files.push({
                            name: metadata.name,
                            fullPath: metadata.fullPath,
                            size: metadata.size,
                            contentType: metadata.contentType,
                            timeCreated: metadata.timeCreated,
                            updated: metadata.updated,
                            downloadURL
                        });
                    } catch (error) {
                        console.warn(`Failed to get metadata for ${itemRef.fullPath}:`, error);
                    }
                }
                
                return {
                    success: true,
                    data: files,
                    metadata: {
                        timestamp: new Date(),
                        totalCount: files.length
                    }
                };
            }),
            catchError(this.handleError.bind(this))
        );
    }

    updateFileMetadata(path: string, metadata: any): Observable<ApiResponse<void>> {
        const storageRef = ref(this.storage, path);
        
        return from(updateMetadata(storageRef, metadata)).pipe(
            map(() => ({
                success: true,
                message: 'File metadata updated successfully'
            })),
            catchError(this.handleError.bind(this))
        );
    }

    // Utility methods
    generateFileName(originalName: string, prefix?: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const extension = originalName.split('.').pop();
        const name = originalName.split('.').slice(0, -1).join('.');
        
        return prefix 
            ? `${prefix}/${timestamp}_${random}_${name}.${extension}`
            : `${timestamp}_${random}_${name}.${extension}`;
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    isImageFile(filename: string): boolean {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        return imageExtensions.includes(this.getFileExtension(filename));
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private handleError(error: any): Observable<ApiResponse<any>> {
        console.error('Storage error:', error);
        
        let message = 'A storage error occurred';
        
        switch (error.code) {
            case 'storage/object-not-found':
                message = 'File not found';
                break;
            case 'storage/unauthorized':
                message = 'User does not have permission to access this file';
                break;
            case 'storage/canceled':
                message = 'Upload was canceled';
                break;
            case 'storage/unknown':
                message = 'Unknown error occurred';
                break;
            default:
                message = error.message || message;
        }

        return new Observable(observer => {
            observer.error({
                success: false,
                error: {
                    code: error.code || 'STORAGE_ERROR',
                    message,
                    details: error,
                    timestamp: new Date()
                }
            });
        });
    }
}