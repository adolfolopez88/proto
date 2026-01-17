import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'environments/environment';
import { AppModule } from 'app/app.module';

if ( environment.production )
{
    enableProdMode();
}

// Error handler global
const handleBootstrapError = (err: any) => {
    console.error('Bootstrap error:', err);
};

// Bootstrap function
const bootstrap = () => {
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch(handleBootstrapError);
};

// Asegurar que el DOM está listo antes de bootstrap
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        // DOM ya está listo
        bootstrap();
    }
} else {
    // Fallback para entornos sin DOM (SSR, etc)
    bootstrap();
}
