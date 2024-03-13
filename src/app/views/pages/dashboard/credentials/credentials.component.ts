import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CredentialModel } from '../credential.model';
import { InspectorService } from '../../inspectors/inspector.service';
import { GlobalConstants } from '../../../../global-constants';
import { AlertService } from '../../alert/alert.service';
import { Router } from '@angular/router';
import { RejectedResponse } from '../../../models/rejected-response';
import swal from 'sweetalert2'; 
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  item: CredentialModel = new CredentialModel();
  saveLabel = 'Update';
  spnnier : boolean = false;
  credentialLogData: any = [];


  logData: any = [];
  isLoading = false;
  tableSize = [10, 25, 50, 100];
  order: string = 'createdDate';
  reverse: boolean = false;
  searchText: any = "";
  p: number = 1;
  pagingConfig = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  };
  userFilter: any = { month: '', year: '' };
  noOfRows = this.pagingConfig.itemsPerPage;
  
  constructor(private inspectorService: InspectorService,
    public globals: GlobalConstants,
    private spinner: NgxSpinnerService,
    public alertService: AlertService,
    private router: Router) { }

  ngOnInit(): void {
    this.BindFormGroup();
    this.spnnier = true;

    this.getAllLogList();
    this.getCredentials();
  }

  get f() { 
    return this.formGroup.controls; 
  }

  onTableSizeChange(event: any): void {
    this.pagingConfig.itemsPerPage = event.target.value;
    this.pagingConfig.currentPage = 1;
    this.getAllLogList();
  }
  onTableDataChange(event: any) {
    this.pagingConfig.currentPage = event;    
    this.getAllLogList();
  }

  getCredentials(){
    var url = this.globals.getCredentials;
    this.inspectorService.get(url).then((Response: any) => {
      console.log(Response)
      if(Response.response){
        this.item.id = Response.response[0].id;
        //this.item.loginId = this.decryptionAES(Response.response[0].loginId);
        //this.item.transactionKey = Response.response[0].transactionKey;
        //this.item.clientKey = Response.response[0].clientKey;
      }
    });
  }

  getAllLogList(){
    this.spinner.show();
    const data = {
      page: this.pagingConfig.currentPage,
      size: this.pagingConfig.itemsPerPage,
      sortBy: this.order,
      sortOrder: !this.reverse ? 'DESC' : 'ASC',
      search: this.searchText
    };
    this.isLoading = true;

  
    var url = this.globals.getCredentialLog;
    this.inspectorService.create(url,data).then((Response: any) => {
      this.credentialLogData = Response.content;

      this.isLoading = false;
      this.pagingConfig.totalItems = Response['totalElements'];
      console.log(Response['totalElements']);
      this.spinner.hide();
    });

    
  }

  options: any = {
    //types: ['hospital', 'pharmacy', 'bakery', 'country'],
    componentRestrictions: { country: 'US' }
  }  

  BindFormGroup(){
    this.formGroup = new FormGroup({
      loginId: new FormControl("", Validators.required),
      transactionKey: new FormControl(null, Validators.required),
      clientKey: new FormControl(null, Validators.required)
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
      this.inspectorService.create(this.globals.updateCrendentail,this.item).then((response) => {
        button.removeAttribute('disabled');
        this.showToast('Credential Updated Successfully');
        //this.getAllLogList();
        this.backTo();
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

  backTo(){
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/dashboard/credentials']);
  }
}
