import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListInspectorsComponent } from './list-inspectors/list-inspectors.component';
import { RouterModule, Routes } from '@angular/router';
import { InspectorsComponent } from './inspectors.component';
import { AddInspectorComponent } from './add-inspector/add-inspector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertModule } from '../alert/alert.module';
import { FeatherIconModule } from '../../../core/feather-icon/feather-icon.module';
import { BookingSlotComponent } from './booking-slot/booking-slot.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const routes: Routes = [
  {
    path: '',
    component: InspectorsComponent,
    children: [
      {
        path: '',
        component: ListInspectorsComponent
      },
      {
        path: 'add',
        component: AddInspectorComponent
      },
      {
        path: 'edit/:id',
        component: AddInspectorComponent
      },
      {
        path: 'blockslot/:id',
        component: BookingSlotComponent
      },
      {
        path: 'blockslot/edit/:id/:editId',
        component: BookingSlotComponent
      }
    ]
  }
]



@NgModule({
  declarations: [
    InspectorsComponent,
    ListInspectorsComponent,
    AddInspectorComponent,
    BookingSlotComponent
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
export class InspectorsModule { }
