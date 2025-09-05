import { Route } from '@angular/router';
import { PromptManagementComponent } from './prompt-management.component';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptFormComponent } from './components/prompt-form/prompt-form.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { PromptCategoriesComponent } from './components/prompt-categories/prompt-categories.component';
import { PromptStatsComponent } from './components/prompt-stats/prompt-stats.component';

export const promptManagementRoutes: Route[] = [
    {
        path: '',
        component: PromptManagementComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: PromptListComponent,
                data: {
                    title: 'Lista de Prompts'
                }
            },
            {
                path: 'create',
                component: PromptFormComponent,
                data: {
                    title: 'Crear Prompt',
                    mode: 'create'
                }
            },
            {
                path: 'edit/:id',
                component: PromptFormComponent,
                data: {
                    title: 'Editar Prompt',
                    mode: 'edit'
                }
            },
            {
                path: 'detail/:id',
                component: PromptDetailComponent,
                data: {
                    title: 'Detalle del Prompt'
                }
            },
            {
                path: 'categories',
                component: PromptCategoriesComponent,
                data: {
                    title: 'Gestión de Categorías'
                }
            },
            {
                path: 'stats',
                component: PromptStatsComponent,
                data: {
                    title: 'Estadísticas de Prompts'
                }
            }
        ]
    }
];