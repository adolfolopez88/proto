import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { FuseLoadingService } from '@fuse/services/loading';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
    private loadingService = inject(FuseLoadingService);
    private activeRequests = 0;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Skip loading for certain requests if needed
        if (req.headers.get('X-Skip-Loading') === 'true') {
            return next.handle(req);
        }

        // Start loading
        if (this.activeRequests === 0) {
            this.loadingService.show();
        }
        this.activeRequests++;

        return next.handle(req).pipe(
            finalize(() => {
                this.activeRequests--;
                if (this.activeRequests === 0) {
                    this.loadingService.hide();
                }
            })
        );
    }
}