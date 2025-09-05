import { Route } from '@angular/router';
import { LandingProComponent } from './landing-pro.component';

export const landingProRoutes: Route[] = [
    {
        path: '',
        component: LandingProComponent,
        data: {
            layout: 'empty'
        }
    }
];