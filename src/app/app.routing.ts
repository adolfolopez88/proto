import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/firebase-migration'
    {path: '', pathMatch : 'full', redirectTo: 'firebase-migration'},

    // Redirect signed in user to the '/firebase-migration'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'firebase-migration'},

    // Auth routes for guests
   {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        data: {
            layout: 'empty'
        },
        children   : [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'foundation', loadChildren: () => import('app/modules/landing/foundation/foundation.module').then(m => m.LandingFoundationModule)},
        ]
    },
    
    // Admin routes
    {
        path       : '',
        canActivate: [],
        canActivateChild: [],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
            {path: 'firebase-example', loadChildren: () => import('app/modules/admin/example/firebase-example/firebase-example.module').then(m => m.FirebaseExampleModule)},
            {path: 'firebase-migration', loadChildren: () => import('app/modules/admin/example/firebase-migration/firebase-migration.module').then(m => m.FirebaseMigrationModule)},
            {path: 'user-management', loadChildren: () => import('app/modules/admin/user-management/user-management.module').then(m => m.UserManagementModule)},
            
            // Card Examples
            {path: 'cards/products', loadChildren: () => import('app/modules/admin/cards/products/products.module').then(m => m.ProductsModule)},
            {path: 'cards/postcards', loadChildren: () => import('app/modules/admin/cards/postcards/postcards.module').then(m => m.PostcardsModule)},
            {path: 'cards/characters', loadChildren: () => import('app/modules/admin/cards/characters/characters.module').then(m => m.CharactersModule)},
        ]
    },

    // Catch all route - must be last
    {
        path: '**',
        redirectTo: 'firebase-migration'
    }
];
