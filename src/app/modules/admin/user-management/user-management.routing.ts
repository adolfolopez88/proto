import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
    data: {
      title: 'Gestión de Usuarios',
      description: 'Sistema CRUD completo para gestión de usuarios con Firebase Authentication'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }