import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthModule } from 'app/core/auth/auth.module';
import { IconsModule } from 'app/core/icons/icons.module';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { FirebaseModule } from './firebase.module.simple';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Services
import { ErrorHandlerService } from './services/utils/error-handler.service';

@NgModule({
    imports: [
        AuthModule,
        IconsModule,
        TranslocoCoreModule,
        FirebaseModule
    ],
    providers: [
        // Global Error Handler
        {
            provide: ErrorHandler,
            useClass: ErrorHandlerService
        },
        
        // HTTP Interceptors
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        }
    ]
})
export class CoreModule
{
    /**
     * Constructor
     */
    constructor(
        @Optional() @SkipSelf() parentModule?: CoreModule
    )
    {
        // Do not allow multiple injections
        if ( parentModule )
        {
            throw new Error('CoreModule has already been loaded. Import this module in the AppModule only.');
        }
    }
}
