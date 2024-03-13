import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertModule } from '../alert/alert.module';
import { FeatherIconModule } from '../../../core/feather-icon/feather-icon.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ListUsersComponent } from './list-users/list-users.component';

const routes: Routes = [
  {
    path: '',
    component: ListUsersComponent,
    children: [
      {
        path: '',
        component: ListUsersComponent
      },
      /*{
        path: 'blockslot/:id',
        component: BookingSlotComponent
      },
      {
        path: 'blockslot/edit/:id/:editId',
        component: BookingSlotComponent
      }*/
    ]
  }
]



@NgModule({
  declarations: [
    ListUsersComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskModule.forRoot({ validation: true}), // Ngx-mask
    AlertModule,
    GooglePlaceModule,
    FeatherIconModule,
    NgxDatatableModule 
  ]
})
export class UsersModule { }
