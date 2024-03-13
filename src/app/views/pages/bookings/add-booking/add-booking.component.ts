import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BookingModel, notesModel } from '../booking.model';
import { NgbDateStruct, NgbDatepicker,NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../../,,/../../global-constants';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2'; 
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable, OperatorFunction, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { BookingService } from '../booking.service';
import { RejectedResponse } from '../../../models/rejected-response';
import { AlertService } from '../../alert/alert.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataTable } from "simple-datatables";

@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.scss']
})
export class AddBookingComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  transsectionOn: boolean = false;
  secondaryOn: boolean  =false;
  item: BookingModel = new BookingModel();
  saveLabel = 'Add Booking';
  addUpdateLabel = 'Update Inspector';
  inspectionDate: NgbDateStruct;
  date: { year: number; month: number };
  minDate: any;
  saveButton: boolean = true;
  invName: string = '';
  packageType: string = '';
  squarefeetPrice = 0;
  yearBuiltPrice = 0;
  servicesArr: any = [];

  checkboxArr: any = [];
  checkboxVal: any = [];

  searching: boolean = false;
  searchList: any;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  term: string = '';
  i1: boolean = true;
  i2: boolean = true;
  i3: boolean = true;
  i4: boolean = true;
  i5: boolean = true;
  i6: boolean = true;
  i7: boolean = true;
  i8: boolean = true;
  showInspectorName: string;
  additionalServicesCost: number = 0.00;
  serviceCost: number = 0.00;
  finalServiceCost: number = 0.00;
  subPackage: boolean = false;
  slotBooked: boolean = false;
  showpckg: boolean = false;
  ontheflyInspectorID: number = 0;
  inspectorAlert: string='';
  defaultNavActiveId = 1;
  onEditView: string = 'disabled';

  itemNotes: notesModel = new notesModel();
  notesformGroup: FormGroup;
  notesData: any;
  paymentUrl: string;
  
  constructor(private calendar: NgbCalendar,
    public globals: GlobalConstants,
    public alertService: AlertService,
    private bookingService: BookingService,
    private http: HttpClient, 
    private activatedRoute: ActivatedRoute,
    private router: Router) { 
      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      var id = params["id"];
      if (id) {
        this.bookingService.get(this.globals.getBookingById+'/?id='+id).then((Response: any) => {
          this.item = Response.response;
          this.saveButton = false;
          if(this.item.inspectionType == 'Phased'){
            this.subPackage = true;
          }
          if(this.item.transFullName){
            this.transsectionOn = true;
          }
          if(this.item.secondaryFullName){
            this.secondaryOn = true;
          }
          if(this.item.agentName != ''){
            this.invName = this.item.agentName;
          }
          const [year, month, day] = this.item.inspectionDate.split('-');
          const obj = { year: Number(year), month: Number(month), day: Number(day.split(' ')[0].trim()) };
          this.inspectionDate = obj;
          this.showInspectorName = Response.response.officerName;
          this.servicesArr = this.item.additionalServices.slice(0,-1).split(",");

          this.serviceCost = Number(this.item.packagePrice) - Number(this.item.additionalServiceCost);
          this.additionalServicesCost = this.item.additionalServiceCost;
          
          this.onEditView = '';
          this.itemNotes.bookingId = id;
          //this.getNotesList(id);
          let url = "https://www.theinspectionhouse.com/payment/?td=";
          let convertid = btoa(id);
          this.paymentUrl = url+convertid;
          
          this.bookingService.get(this.globals.getBookingNotes+'?id='+id).then((Response: any) => {
            this.notesData = Response.response;
            
            let obj: any = {
              headings: [
                "No",
                "Notes",
                "Created By"
              ],
              data: []
            };
      
            let y = 0;
           
              this.notesData.forEach((element: any) => {
                obj.data[y] = [];
                obj.data[y].push(y+1);
                obj.data[y].push(element.notes);
                obj.data[y].push(element.createdBy);
                y = y+1;
              }); 
              console.log(obj)
              /*let dataTable = new DataTable("#dataTableExample1", {
                data: obj,
              });*/  
           
            
          });
          //this.finalServiceCost = this.item.packagePrice;

          //this.saveLabel = 'Update Inspector';
          //this.addUpdateLabel = 'Update';
        });
      }else{
        this.inspectionDate = this.calendar.getToday();
        //console.log(this.inspectionDate);
        this.item.inspectionDate = this.inspectionDate.year+"-"+('0'+this.inspectionDate.month).slice(-2)+"-"+('0'+this.inspectionDate.day).slice(-2);
        this.blockBookingSlots(this.item.inspectionDate);
        /*let timeZone;
        if (typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function') {
          timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          this.item.timeZone = timeZone;
          //console.log(timeZone)
        }*/
      }
    });
    this.BindFormGroup();
   
   
  }

  get f() { 
    return this.formGroup.controls; 
  }

  get f1() { 
    return this.notesformGroup.controls; 
  }

  options: any = {
    //types: ['hospital', 'pharmacy', 'bakery', 'country'],
    componentRestrictions: { country: 'US' }
  }  

  handleAddressChange(address: Address) {
    //console.log(address)
    this.item.address = address.formatted_address;
    for (const component of address.address_components) {
      const componentType = component.types[0];
  
      switch (componentType) {
        case "street_number": {
          //address1 = `${component.long_name} ${address1}`;
          break;
        }
  
        case "route": {
          //address1 += component.short_name;
          break;
        }
  
        case "postal_code": {
          this.item.zipcode = component.long_name;
          break;
        }
  
        case "postal_code_suffix": {
          //postcode = `${postcode}-${component.long_name}`;
          break;
        }
  
        case "locality":{
          this.item.city = component.long_name;
          break;
        }
  
        case "administrative_area_level_1": {
          this.item.state = component.short_name;
          break;
        }
        
        case "country":
          //document.querySelector("#country").value = component.long_name;
          break;
      }
    }
  
    this.item.address = address.formatted_address;
    this.item.latitude = String(address.geometry.location.lat());
    this.item.longitude = String(address.geometry.location.lng());
  }

  selectAgent(event:any){
    if(event.name){
      this.item.agentName = event.name;
      this.item.agentEmail = event.email;
      this.item.agentPhone = event.phone;
    }
  }

  BindFormGroup(){
    this.formGroup = new FormGroup({
      inspectiontype: new FormControl("", Validators.required),
      inspectionSubType: new FormControl(''),
      address: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      unit: new FormControl(''),
      state: new FormControl(null, Validators.required),
      zipcode: new FormControl(null, Validators.required),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      yearbuilt: new FormControl(null, [Validators.required,Validators.pattern("^[0-9]*$")]),
      squarefeet: new FormControl(null, [Validators.required,Validators.max(6000), Validators.min(0),Validators.pattern("^[0-9]*$")]),
      foundation: new FormControl(null),
      secondaryfullname: new FormControl(null),
      secondaryPhone: new FormControl(null),
      secondaryEmail: new FormControl(null),
      trans_full_name: new FormControl(''),
      trans_phone: new FormControl(''),
      trans_email: new FormControl('',Validators.email),
      phone: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required,Validators.email]),
      ccemail: new FormControl(null, [Validators.email]),
      agentname: new FormControl(''),
      agentphone: new FormControl(''),
      agentemail: new FormControl('',Validators.email),
      packagename: new FormControl('',Validators.required),
      reportreview: new FormControl('',Validators.required),
      inspectiontime: new FormControl('',Validators.required),
      additionalServices: new FormControl(''),
      packagePrice: new FormControl('',Validators.required),
      comments: new FormControl('')
    });

    this.notesformGroup = new FormGroup({
      notes: new FormControl('',Validators.required)
    });
  }

  checkValue(event:any){
    
    if(event.target.checked){
      //console.log(event);
      //console.log(event.target.value)
      this.checkboxArr.push(event.target.value);
      this.checkboxVal.push(event.target.dataset.id)
    }else{
      const index: number = this.checkboxArr.indexOf(event.target.value);
      this.checkboxArr.splice(index, 1);

      const index1: number = this.checkboxVal.indexOf(event.target.dataset.id);
      this.checkboxVal.splice(index, 1);
    }

  }

  packageChange(event: any){
    if(event.target.value == 'Total Solutions Bundle'){
      this.item.packagePrice = 0;
      this.packageType = '2';
    }else{
      this.item.packagePrice = 0;
      this.packageType = '1';
    }

    if(this.item.inspectionType == 'New Construction' || this.item.inspectionType == 'Builder warranty Inspection'){
      this.packageType = '3';
    }
    this.calculateFinalPrice('calculate');
  }

  filtersearch = (text$: any) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        //this.filterData = [];
      }),
      switchMap((term: string) => (term === '' || term.toString().length < 3) ? [] :
        new Promise((resolve, reject) => {
          term = term.toLowerCase();
          //console.log(term)
          this.BindMasterAllSearchData(term)
            .then(() => {
              resolve(this.searchList);
              return this.searchList;
            });

        })
      ), catchError(() => {
        //this.searchFailed = true;
        //this.searching = false;
        return [];
      })
    );
  
  private BindMasterAllSearchData(term : string): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.bookingService.get(this.globals.getAgentList+'/?name='+term)
      ]).then(function (response: any) {
        current.searchList = response[0].data;
        resolve();
      });
    });
  }

  formatter(value: any) {
    if (value.name) {
      return value.name;
    } else {
      return value;
    }
  }

  onTimeChange(event:any){
    this.item.inspectionTime = event.target.value;
    this.bookingService.get(this.globals.getInspectorDetalils+'?date='+this.item.inspectionDate+'&time='+this.item.inspectionTime+'&lat='+this.item.latitude+'&long='+this.item.longitude).then((response:any) => {
      if(response.response.inspector_name == 0){
        this.showInspectorName = 'Sorry! No Inspectors are Available';
        this.inspectorAlert = 'inspectorAlert';
        this.item.officerId = '';
        this.ontheflyInspectorID = 0;
      }else{
        this.item.officerId = response.response.inspector_id;
        this.showInspectorName = response.response.inspector_name;
        this.ontheflyInspectorID = response.response.inspector_id;
      }
    });
  }

  /*search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>

        this.bookingService.get(this.globals.getBookingList).then((Response: any) => {
          return of([]);
        });
        this.bookingService.search(term).pipe(
          //tap(() => this.searchFailed = false),
          catchError(() => {
            //this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )*/
  
  save(){
    //this.SpinnerService.show();
    /*const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);

    console.log(this.formGroup)
    this.submitted = true;
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      button.removeAttribute('disabled');
      //this.SpinnerService.hide();
      //this.eventSave.event.srcElement.disabled = false;
      return;
    }

    var cost = 0;
    var services = '';
    this.checkboxArr.forEach((element:any) => {
      cost += Number(element);
    });
    this.checkboxVal.forEach((element:any) => {
      services += element+',';
    });
    this.item.additionalServiceCost = cost;
    this.item.additionalServices = services;
    if(this.invName != ''){
      this.item.agentName = this.invName;
    }

    this.item.packagePrice = Number(this.item.packagePrice) + Number(this.item.additionalServiceCost);*/
    this.item.bookingType = 'Admin';
   
    if (this.item.id) {
      this.bookingService.update(this.globals.updateBooking,this.item).then((response) => {
        this.showToast('Booking Updated Successfully');
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
      this.bookingService.create(this.globals.saveBooking,this.item).then((response) => {
        this.showToast('Booking Inserted Successfully');
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
    this.router.navigate(['/bookings']);
  }

  changeDate(event: any){
    //console.log(event);
    this.item.inspectionDate = event.year+"-"+('0'+event.month).slice(-2)+"-"+('0'+event.day).slice(-2);
    //console.log(this.item.inspectionDate)
    this.item.inspectionTime = '';
    this.blockBookingSlots(this.item.inspectionDate);
  }

  blockBookingSlots(date: string){
    this.i1 = true;
    this.i6 = true;
    this.bookingService.get(this.globals.getAvailableSlots+'?date='+date).then((Response: any) => {
      //console.log(Response);

      if(Response.response && Response.response.length == 2){
        this.slotBooked = true;
      }else{
        this.slotBooked = false;
      }

      if(Response.response && Response.response.length > 0){
        Response.response.forEach((element: any) => {
          if(element == '09:00:00'){
            this.i1 = false;
          }else if(element == '10:00:00'){
            this.i2 = false;
          }else if(element == '11:00:00'){
            this.i3 = false;
          }else if(element == '12:00:00'){
            this.i4 = false;
          }else if(element == '13:00:00'){
            this.i5 = false;
          }else if(element == '14:00:00'){
            this.i6 = false;
          }else if(element == '15:00:00'){
            this.i7 = false;
          }else if(element == '16:00:00'){
            this.i8 = false;
          }else {
            /*this.i1 = true;
            this.i2 = true;
            this.i3 = true;
            this.i4 = true;
            this.i5 = true;
            this.i6 = true;
            this.i7 = true;
            this.i8 = true;*/
          }
        });
      }else{
        this.i1 = true;
        this.i2 = true;
        this.i3 = true;
        this.i4 = true;
        this.i5 = true;
        this.i6 = true;
        this.i7 = true;
        this.i8 = true;
      }
    });
  }

  trans_check(event: any){
    if(event.target.checked){
      this.transsectionOn = true;
    }else{
      this.transsectionOn = false;
      this.item.transFullName = '';
      this.item.transPhone = '';
      this.item.transEmail = '';
    }
  }

  secondary_check(event: any){
    if(event.target.checked){
      this.secondaryOn = true;
    }else{
      this.secondaryOn = false;
      this.item.secondaryFullName = '';
      this.item.secondaryPhone = '';
      this.item.secondaryEmail = '';
    }
  }

  changeInspc(event: any){
    this.item.packageName = '';
    if(event.target.value == 'Phased'){
      this.subPackage = true;
    }else{
      this.subPackage = false;
    }

    if(event.target.value == 'New Construction' || event.target.value == 'Phased' || event.target.value == 'Builder warranty Inspection'){
      this.showpckg = false;
    }else{
      this.showpckg = true;
    }
    
  }

  getExtracPrice(event: any){
    
    if(this.ontheflyInspectorID == 0){
      return;
    }

    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);

    //console.log(this.formGroup)
    this.submitted = true;
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      button.removeAttribute('disabled');
      //this.SpinnerService.hide();
      //this.eventSave.event.srcElement.disabled = false;
      return;
    }

    var cost = 0;
    var services = '';
    this.checkboxArr.forEach((element:any) => {
      cost += Number(element);
    });
    this.checkboxVal.forEach((element:any) => {
      services += element+',';
    });
    this.item.additionalServiceCost = cost;
    this.item.additionalServices = services;
    if(!this.item.agentName){
      this.item.agentName = this.invName;
    }

    if(this.item.officerId == ''){
      this.showErrorToast('Inpsector Not Available');
      button.removeAttribute('disabled');
      return;
    }
    /*let url = '?package_type='+this.packageType+'&squarefeet='+this.item.squareFeet+'&yearbuilt='+this.item.yearBuilt;
    this.bookingService.get(this.globals.getPricing+url).then((Response: any) => {
      //console.log(Response);
      this.squarefeetPrice = Response.package_sqft;
      this.yearBuiltPrice = Response.package_additional;
      this.item.packagePrice = Number(this.item.packagePrice) + Number(this.item.additionalServiceCost)+ Number(this.squarefeetPrice) + Number(this.yearBuiltPrice);
      this.save();
    });*/
    this.calculateFinalPrice('finalsave');
  }

  calculateFinalPrice(type: string){
    var cost = 0;
    this.checkboxArr.forEach((element:any) => {
      cost += Number(element);
    });
    this.item.additionalServiceCost = cost; 
    this.additionalServicesCost = cost;
    if(type == 'calculate'){
      this.item.packagePrice = 0;
    }else{
      this.item.packagePrice =  Number(this.item.packagePrice);
    }
    if(this.packageType != '' && this.item.squareFeet != '' && this.item.yearBuilt != ''){
      let url = '?package_type='+this.packageType+'&squarefeet='+this.item.squareFeet+'&yearbuilt='+this.item.yearBuilt;
      this.bookingService.get(this.globals.getPricing+url).then((Response: any) => {
        this.squarefeetPrice = Response.package_sqft;
        this.yearBuiltPrice = Response.package_additional;
        this.serviceCost = Number(this.squarefeetPrice) + Number(this.yearBuiltPrice)
        //this.item.packagePrice = Number(this.item.packagePrice) + Number(this.item.additionalServiceCost)+ Number(this.squarefeetPrice) + Number(this.yearBuiltPrice);
        this.finalServiceCost = Number(this.serviceCost) + Number(this.item.additionalServiceCost);
        this.item.calculatedPrice = this.finalServiceCost;
        if(type == 'finalsave'){
          this.save();
        }else{
          this.item.packagePrice = Number(this.item.packagePrice) + Number(this.item.additionalServiceCost)+ Number(this.squarefeetPrice) + Number(this.yearBuiltPrice);
        }
      });
    }
  }

  changePrice(event:any){
    console.log(event)
  }

  saveNotes(event: any){
    console.log(this.notesformGroup)
    this.submitted = true;
    this.notesformGroup.markAllAsTouched();
    if (this.notesformGroup.invalid) {
      return;
    }

    if (this.itemNotes.bookingId) {
      this.bookingService.create(this.globals.saveBookingNotes,this.itemNotes).then((response) => {
        this.showToast('Notes added Successfully');
        this.backToEditList(this.itemNotes.bookingId);
      },
        (rejected: RejectedResponse) => {
          this.item.id = '';
          this.alertService.error('There is something wrong',this.options);
          //this.alertService.BindServerErrors(this.formGroup, rejected);
        }
      );
    } 
  }

  backToEditList(id: string){
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/bookings/edit/'+id]);
  }

  public getNotesList(id: string){
    this.bookingService.get(this.globals.getBookingNotes+'?id='+id).then((Response: any) => {
      this.notesData = Response.response;
      
      let obj: any = {
        headings: [
          "No",
          "Notes",
          "Created By"
        ],
        data: []
      };

      let y = 0;
     if(this.notesData.length > 0){
        this.notesData.forEach((element: any) => {
          obj.data[y] = [];
          obj.data[y].push(y+1);
          obj.data[y].push(element.notes);
          obj.data[y].push(element.createdBy);
          y = y+1;
        }); 
        let dataTable = new DataTable("#dataTableExample", {
          data: obj,
        });  
     }
      
    });
    
  }

  showErrorToast(msg:string){
    swal.fire({ showConfirmButton: false, timer: 2000, title: 'Error!', text: msg, icon: 'error', });
  }

  copyURL(){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.paymentUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  
}
