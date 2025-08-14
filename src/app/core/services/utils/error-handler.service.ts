import { Injectable, inject } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { FuseAlertService } from '@fuse/components/alert';

export interface ErrorInfo {
    message: string;
    code?: string;
    timestamp: Date;
    url?: string;
    userId?: string;
    stack?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
    private router = inject(Router);
    private alertService = inject(FuseAlertService);
    private errorLog: ErrorInfo[] = [];

    handleError(error: any): void {
        const errorInfo = this.createErrorInfo(error);
        
        // Log error
        this.logError(errorInfo);
        
        // Handle based on severity
        this.handleBySeverity(errorInfo);
        
        // Show user notification
        this.showUserNotification(errorInfo);
        
        // Report to external service if needed
        this.reportError(errorInfo);
    }

    handleHttpError(error: any): Observable<never> {
        const errorInfo = this.createErrorInfo(error, 'http');
        
        this.logError(errorInfo);
        this.handleBySeverity(errorInfo);
        this.showUserNotification(errorInfo);
        
        return throwError(() => errorInfo);
    }

    handleAsyncError<T>(error: any, fallbackValue?: T): Observable<T> {
        const errorInfo = this.createErrorInfo(error, 'async');
        
        this.logError(errorInfo);
        this.showUserNotification(errorInfo);
        
        if (fallbackValue !== undefined) {
            return of(fallbackValue);
        }
        
        return throwError(() => errorInfo);
    }

    private createErrorInfo(error: any, context?: string): ErrorInfo {
        let message = 'An unexpected error occurred';
        let code = 'UNKNOWN_ERROR';
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

        // Parse different error types
        if (error?.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }

        if (error?.code) {
            code = error.code;
        }

        // Determine severity based on error type
        if (error?.status) {
            switch (error.status) {
                case 400:
                case 422:
                    severity = 'low';
                    break;
                case 401:
                case 403:
                    severity = 'medium';
                    break;
                case 404:
                    severity = 'low';
                    break;
                case 500:
                case 502:
                case 503:
                    severity = 'high';
                    break;
                default:
                    severity = 'medium';
            }
        }

        // Firebase-specific errors
        if (error?.code?.startsWith('auth/')) {
            severity = 'medium';
            message = this.getFirebaseAuthErrorMessage(error.code);
        }

        if (error?.code?.startsWith('firestore/')) {
            severity = 'high';
            message = this.getFirestoreErrorMessage(error.code);
        }

        // JavaScript errors
        if (error instanceof TypeError || error instanceof ReferenceError) {
            severity = 'high';
        }

        return {
            message,
            code,
            timestamp: new Date(),
            url: this.router.url,
            stack: error?.stack,
            severity,
            context: {
                type: context,
                originalError: error
            }
        };
    }

    private logError(errorInfo: ErrorInfo): void {
        // Add to local log
        this.errorLog.push(errorInfo);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }

        // Console logging with appropriate level
        switch (errorInfo.severity) {
            case 'low':
                console.info('Low severity error:', errorInfo);
                break;
            case 'medium':
                console.warn('Medium severity error:', errorInfo);
                break;
            case 'high':
            case 'critical':
                console.error('High/Critical severity error:', errorInfo);
                break;
        }
    }

    private handleBySeverity(errorInfo: ErrorInfo): void {
        switch (errorInfo.severity) {
            case 'critical':
                // Redirect to error page or show critical error dialog
                this.handleCriticalError(errorInfo);
                break;
            case 'high':
                // Show error dialog or notification
                this.handleHighSeverityError(errorInfo);
                break;
            case 'medium':
                // Show notification
                break;
            case 'low':
                // Silent handling or minimal notification
                break;
        }
    }

    private handleCriticalError(errorInfo: ErrorInfo): void {
        // For critical errors, we might want to redirect to an error page
        // or show a modal that doesn't allow continuing
        this.router.navigate(['/error'], {
            queryParams: {
                code: errorInfo.code,
                message: errorInfo.message
            }
        });
    }

    private handleHighSeverityError(errorInfo: ErrorInfo): void {
        // For high severity errors, show a prominent notification
        // but allow the user to continue
        // Note: FuseAlertService only supports show/dismiss by name
        // For now, we'll just log the error. In production, you might want to use
        // a different notification service like MatSnackBar
        console.error('High severity error:', errorInfo.message);
    }

    private showUserNotification(errorInfo: ErrorInfo): void {
        const userFriendlyMessage = this.getUserFriendlyMessage(errorInfo);
        
        let alertType: 'error' | 'warning' | 'info' = 'error';
        
        if (errorInfo.severity === 'low') {
            alertType = 'info';
        } else if (errorInfo.severity === 'medium') {
            alertType = 'warning';
        }

        // Only show notification for non-critical errors (critical handled separately)
        if (errorInfo.severity !== 'critical') {
            // Note: FuseAlertService only supports show/dismiss by name
            // For now, we'll just log the error. In production, you might want to use
            // a different notification service like MatSnackBar
            console.warn(`${alertType.toUpperCase()}: ${userFriendlyMessage}`);
        }
    }

    private getUserFriendlyMessage(errorInfo: ErrorInfo): string {
        // Map technical errors to user-friendly messages
        const friendlyMessages: { [key: string]: string } = {
            'NETWORK_ERROR': 'Please check your internet connection and try again.',
            'UNAUTHORIZED': 'You need to log in to access this feature.',
            'FORBIDDEN': 'You don\'t have permission to perform this action.',
            'NOT_FOUND': 'The requested item could not be found.',
            'VALIDATION_ERROR': 'Please check your input and try again.',
            'SERVER_ERROR': 'We\'re experiencing technical difficulties. Please try again later.',
            'TIMEOUT': 'The request is taking too long. Please try again.',
            'UNKNOWN_ERROR': 'Something went wrong. Please try again.'
        };

        return friendlyMessages[errorInfo.code || ''] || errorInfo.message;
    }

    private getFirebaseAuthErrorMessage(code: string): string {
        const authErrorMessages: { [key: string]: string } = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password is too weak.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.'
        };

        return authErrorMessages[code] || 'Authentication error occurred.';
    }

    private getFirestoreErrorMessage(code: string): string {
        const firestoreErrorMessages: { [key: string]: string } = {
            'firestore/permission-denied': 'You don\'t have permission to access this data.',
            'firestore/not-found': 'The requested document was not found.',
            'firestore/already-exists': 'A document with this ID already exists.',
            'firestore/resource-exhausted': 'Too many requests. Please try again later.',
            'firestore/failed-precondition': 'The operation failed due to a precondition.',
            'firestore/aborted': 'The operation was aborted.',
            'firestore/out-of-range': 'The value is out of range.',
            'firestore/unimplemented': 'This operation is not supported.',
            'firestore/internal': 'Internal server error.',
            'firestore/unavailable': 'The service is temporarily unavailable.',
            'firestore/data-loss': 'Data loss occurred.'
        };

        return firestoreErrorMessages[code] || 'Database error occurred.';
    }

    private reportError(errorInfo: ErrorInfo): void {
        // Only report high and critical errors to external services
        if (errorInfo.severity === 'high' || errorInfo.severity === 'critical') {
            // Here you would integrate with error reporting services like:
            // - Sentry
            // - LogRocket
            // - Bugsnag
            // - Custom logging endpoint
            
            // Example:
            // this.sendToExternalService(errorInfo);
        }
    }

    // Public methods for manual error handling
    reportManualError(message: string, context?: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
        const errorInfo: ErrorInfo = {
            message,
            code: 'MANUAL_ERROR',
            timestamp: new Date(),
            url: this.router.url,
            severity,
            context
        };

        this.handleError(errorInfo);
    }

    getErrorLog(): ErrorInfo[] {
        return [...this.errorLog];
    }

    clearErrorLog(): void {
        this.errorLog = [];
    }

    getErrorsByType(type: string): ErrorInfo[] {
        return this.errorLog.filter(error => error.context?.type === type);
    }

    getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorInfo[] {
        return this.errorLog.filter(error => error.severity === severity);
    }
}