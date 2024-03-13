import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InspectorModel } from '../inspector.model';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { InspectorService } from '../inspector.service';
import { GlobalConstants } from '../../../../global-constants';
import { RejectedResponse } from '../../../models/rejected-response';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import swal from 'sweetalert2'; 
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-add-inspector',
  templateUrl: './add-inspector.component.html',
  styleUrls: ['./add-inspector.component.scss']
})
export class AddInspectorComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  item: InspectorModel = new InspectorModel();
  saveLabel = 'Save Inspector';
  addUpdateLabel = 'Add';
  spnnier : boolean = false;

  constructor( private inspectorService: InspectorService,
    public globals: GlobalConstants,
    public alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params:any) => {
      var id = params["id"];
      if (id) {
        console.log(id);
        this.inspectorService.get(this.globals.getInspectorById+'/?id='+id).then((Response: any) => {
          this.item = Response.data;
          this.saveLabel = 'Update Inspector';
          this.addUpdateLabel = 'Update';
        });
      }else{
        
      }
    });
    this.BindFormGroup();
    this.spnnier = true;
  }

  get f() { 
    return this.formGroup.controls; 
  }

  options: any = {
    //types: ['hospital', 'pharmacy', 'bakery', 'country'],
    componentRestrictions: { country: 'US' }
  }  

  handleAddressChange(address: Address) {
    this.item.address = address.formatted_address;
    this.item.latitude = address.geometry.location.lat();
    this.item.longitude = address.geometry.location.lng();
  }

  BindFormGroup(){
    this.formGroup = new FormGroup({
      firstname: new FormControl("", Validators.required),
      lastname: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required,Validators.email]),
      trecnumber: new FormControl(null, Validators.required),
      tdanumber: new FormControl(''),
      colorCode: new FormControl(''),
      status: new FormControl(null, Validators.required)
    });
  }
  
  save(event: any){
    //this.SpinnerService.show();
    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);

    this.submitted = true;
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      button.removeAttribute('disabled');
      //this.SpinnerService.hide();
      return;
    }

    console.log(this.item);
    
    if (this.item.id) {
      this.inspectorService.update(this.globals.updateInspector,this.item).then((response) => {
        this.showToast('Inspector Updated Successfully');
        this.backToList();
        //this.SpinnerService.hide();
      },
        (rejected: RejectedResponse) => {
          this.item.id = '';
          this.alertService.error('There is something wrong',this.options);
          //this.alertService.BindServerErrors(this.formGroup, rejected);
        }
      );
    } else {
      this.inspectorService.create(this.globals.saveInspector,this.item).then((response) => {
        this.showToast('Inspector Inserted Successfully');
        this.backToList();
        //this.SpinnerService.hide();
      },
        (rejected: RejectedResponse) => {
          this.item.id = '';
          this.alertService.error('There is something wrong',this.options);
          //this.alertService.BindServerErrors(this.formGroup, rejected);
        }
      );
    }
  }

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  public backToList(){
    this.router.navigate(['/inspectors']);
  }

}
