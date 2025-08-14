import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FuseAlertService } from '@fuse/components/alert';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private router = inject(Router);
    private alertService = inject(FuseAlertService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleError(error);
                return throwError(() => error);
            })
        );
    }

    private handleError(error: HttpErrorResponse): void {
        let message = 'An unexpected error occurred';
        let type: 'error' | 'warning' | 'info' | 'success' = 'error';

        switch (error.status) {
            case 0:
                message = 'Network error. Please check your connection.';
                break;
            case 400:
                message = 'Bad request. Please check your input.';
                break;
            case 401:
                message = 'You are not authorized to access this resource.';
                this.router.navigate(['/sign-in']);
                break;
            case 403:
                message = 'You do not have permission to access this resource.';
                this.router.navigate(['/unauthorized']);
                break;
            case 404:
                message = 'The requested resource was not found.';
                break;
            case 409:
                message = 'Conflict: The resource already exists or is in use.';
                type = 'warning';
                break;
            case 422:
                message = 'Validation failed. Please check your input.';
                type = 'warning';
                break;
            case 429:
                message = 'Too many requests. Please wait before trying again.';
                type = 'warning';
                break;
            case 500:
                message = 'Internal server error. Please try again later.';
                break;
            case 502:
                message = 'Bad gateway. The server is temporarily unavailable.';
                break;
            case 503:
                message = 'Service unavailable. Please try again later.';
                break;
            case 504:
                message = 'Gateway timeout. Please try again.';
                break;
            default:
                if (error.error?.message) {
                    message = error.error.message;
                } else if (error.message) {
                    message = error.message;
                }
        }

        // Show alert using Fuse Alert Service
        // Note: FuseAlertService only supports show/dismiss by name
        // For now, we'll just log the error. In production, you might want to use
        // a different notification service like MatSnackBar
        console.error(`HTTP Error ${error.status}: ${message}`);

        // Log error for debugging
        console.error('HTTP Error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url,
            error: error.error
        });
    }
}