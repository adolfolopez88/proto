import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { PostcardsComponent } from './postcards.component';

const routes = [{ path: '', component: PostcardsComponent }];

@NgModule({
    declarations: [PostcardsComponent],
    imports: [RouterModule.forChild(routes), SharedModule]
})
export class PostcardsModule {}