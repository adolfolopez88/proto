import { Route } from '@angular/router';
import { CharactersComponent } from './characters.component';
import { CharacterDetailComponent } from './character-detail/character-detail.component';
import { CharacterFormComponent } from './character-form/character-form.component';

export const charactersRoutes: Route[] = [
    {
        path: '',
        component: CharactersComponent,
        data: {
            title: 'Caracteres'
        }
    },
    {
        path: 'create',
        component: CharacterFormComponent,
        data: {
            title: 'Crear Personaje',
            mode: 'create'
        }
    },
    {
        path: 'detail/:id',
        component: CharacterDetailComponent,
        data: {
            title: 'Detalle del Personaje'
        }
    },
    {
        path: 'edit/:id',
        component: CharacterFormComponent,
        data: {
            title: 'Editar Personaje',
            mode: 'edit'
        }
    }
];