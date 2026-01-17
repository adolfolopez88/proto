import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

export interface ImageUploadResult {
    url: string;
    fileName: string;
    size: number;
    uploadedAt: Date;
}

export interface ImageUploadProgress {
    progress: number;
    state: 'uploading' | 'completed' | 'error';
}

@Injectable({
    providedIn: 'root'
})
export class ImageUploadService {

    constructor(private storage: AngularFireStorage) {}

    /**
     * Upload image with progress tracking
     */
    uploadImage(file: File, path: string): Observable<ImageUploadResult> {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${path}/${fileName}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, file);

        return uploadTask.snapshotChanges().pipe(
            finalize(() => {
                return fileRef.getDownloadURL();
            }),
            switchMap(() => fileRef.getDownloadURL()),
            switchMap(url => from(Promise.resolve({
                url,
                fileName,
                size: file.size,
                uploadedAt: new Date()
            })))
        );
    }

    /**
     * Upload multiple images
     */
    uploadMultipleImages(files: File[], path: string): Observable<ImageUploadResult[]> {
        const uploads = files.map(file => this.uploadImage(file, path));
        return from(Promise.all(uploads.map(upload => upload.toPromise())));
    }

    /**
     * Delete image
     */
    deleteImage(url: string): Promise<void> {
        return this.storage.storage.refFromURL(url).delete();
    }

    /**
     * Validate image file
     */
    validateImage(file: File): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            errors.push('Tipo de archivo no permitido. Use JPEG, PNG o WebP.');
        }

        if (file.size > maxSize) {
            errors.push('El archivo es demasiado grande. Máximo 5MB.');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Compress image before upload
     */
    compressImage(file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, file.type, quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}