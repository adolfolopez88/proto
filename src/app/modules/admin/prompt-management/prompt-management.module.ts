import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Fuse
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseConfirmationModule } from '@fuse/services/confirmation';

// Shared
import { SharedModule } from 'app/shared/shared.module';

// Components
import { PromptManagementComponent } from './prompt-management.component';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptFormComponent } from './components/prompt-form/prompt-form.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { PromptCategoriesComponent } from './components/prompt-categories/prompt-categories.component';
import { PromptExecutorComponent } from './components/prompt-executor/prompt-executor.component';
import { PromptPreviewComponent } from './components/prompt-preview/prompt-preview.component';
import { PromptVariablesComponent } from './components/prompt-variables/prompt-variables.component';
import { PromptExamplesComponent } from './components/prompt-examples/prompt-examples.component';
import { PromptStatsComponent } from './components/prompt-stats/prompt-stats.component';

// Routing
import { promptManagementRoutes } from './prompt-management.routing';

@NgModule({
    declarations: [
        PromptManagementComponent,
        PromptListComponent,
        PromptFormComponent,
        PromptDetailComponent,
        PromptCategoriesComponent,
        PromptExecutorComponent,
        PromptPreviewComponent,
        PromptVariablesComponent,
        PromptExamplesComponent,
        PromptStatsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(promptManagementRoutes),

        // Angular Material
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatChipsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatBadgeModule,
        MatTooltipModule,

        // Fuse
        FuseCardModule,
        FuseAlertModule,
        FuseConfirmationModule,

        // Shared
        SharedModule
    ]
})
export class PromptManagementModule { }