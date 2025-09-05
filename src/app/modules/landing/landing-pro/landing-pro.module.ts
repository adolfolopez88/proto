import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

// Fuse Components
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';

// Component
import { LandingProComponent } from './landing-pro.component';
import { landingProRoutes } from './landing-pro.routing';

@NgModule({
    declarations: [
        LandingProComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(landingProRoutes),
        
        // Angular Material
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        
        // Fuse
        FuseCardModule,
        FuseAlertModule
    ]
})
export class LandingProModule
{
}