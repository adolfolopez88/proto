import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirebaseMigrationComponent } from './firebase-migration.component';
import { firebaseMigrationRoutes } from './firebase-migration.routing';

@NgModule({
    declarations: [
        FirebaseMigrationComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(firebaseMigrationRoutes),
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ]
})
export class FirebaseMigrationModule {}