import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';

import { LandingFoundationComponent } from './foundation.component';
import { foundationRoutes } from './foundation.routing';

@NgModule({
    declarations: [
        LandingFoundationComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(foundationRoutes),
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        FuseCardModule,
        FuseAlertModule
    ]
})
export class LandingFoundationModule
{
}