import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { MessagingComponent } from './messaging.component';

const routes = [{ path: '', component: MessagingComponent }];

@NgModule({
    declarations: [MessagingComponent],
    imports: [RouterModule.forChild(routes), SharedModule]
})
export class MessagingModule {}