import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Shared
import { SharedModule } from 'app/shared/shared.module';

// Components
import { ProductsComponent } from './products.component';
import { productsRoutes } from './products.routing';

@NgModule({
    declarations: [
        ProductsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(productsRoutes),
        
        // Angular Material
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        
        // Shared
        SharedModule
    ]
})
export class ProductsModule {}