import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MessagingDemoComponent } from './messaging-demo/messaging-demo.component';

const routes = [
    {
        path: '',
        component: MessagingDemoComponent
    }
];

@NgModule({
    declarations: [
        MessagingDemoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule
    ]
})
export class MessagingModule { }