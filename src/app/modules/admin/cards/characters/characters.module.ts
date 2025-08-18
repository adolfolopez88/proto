import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { CharactersComponent } from './characters.component';

const routes = [{ path: '', component: CharactersComponent }];

@NgModule({
    declarations: [CharactersComponent],
    imports: [RouterModule.forChild(routes), SharedModule]
})
export class CharactersModule {}