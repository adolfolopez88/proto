import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Skip interception for Firebase API calls
        if (req.url.includes('googleapis.com') || req.url.includes('firebase.com')) {
            return next.handle(req);
        }

        // Pass through all requests without modification
        // TODO: Add authentication headers when Firebase is properly configured
        return next.handle(req);
    }
}