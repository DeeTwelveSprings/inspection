import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BookingService } from '../booking.service';
import { NgbCalendar, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../alert/alert.service';
import { GlobalConstants } from '../../../../global-constants';
import { formatDate } from "@angular/common";
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2'; 
import { reassignModel } from '../booking.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RejectedResponse } from '../../../models/rejected-response';

@Component({
  selector: 'app-filterbooking',
  templateUrl: './filterbooking.component.html',
  styleUrls: ['./filterbooking.component.scss']
})
export class FilterbookingComponent implements OnInit {

  bookingData: any;
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


  minDate: any;
  currentYear: any;
  currentMonth: any;
  allyear: any;
  alldata: any = [];
  formGroup: FormGroup;
  item: reassignModel = new reassignModel();

  @ViewChild('basicModal') basicModal: any;
  @ViewChild('deleteModal') deleteModal: any;
  @ViewChild('emailModal') emailModal: any;

  displayStyle = "none";
  inspectorData: any;
  submitted: boolean = false;
  modalReference: NgbModalRef;

  inspectionNewDate: NgbDateStruct;
  date: { year: number; month: number };
  cancelId: number = 0;
  sendEmailId: number = 0;
  filterType: string= '';
  

  constructor(private bookingService: BookingService,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    private router: Router,
    private spinner: NgxSpinnerService,
    public alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    public globals: GlobalConstants) { 
      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    }

  ngOnInit(): void {

    this.formGroup = new FormGroup({
      type: new FormControl("", Validators.required),
      inspectionNewDate: new FormControl(""),
      inspectionNewTime: new FormControl(""),
      inspectionNewDuration: new FormControl(""),
      inspectorId: new FormControl(""),
    });
    
    this.currentYear = String(new Date().getFullYear());
    this.currentMonth = String((new Date().getMonth() + 1)).length > 1 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1);
    this.allyear = this.getList();

    this.getAllBookingList();
  }

  get f() { 
    return this.formGroup.controls; 
  }

  public formatPhoneNumber(phoneNumberString: string) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
  }

  public formatDate(date: any){
    const format = 'MM/dd/yyyy';
    const locale = 'en-US';
    const formattedDate = formatDate(date, format, locale);
    return formattedDate;
  }

  getList(){
    const resultArr = [];
    let year = 2021;
    while (year <= this.currentYear) {
        resultArr.push(year);
        ++year;
    }
    return resultArr;
  }

  onTableSizeChange(event: any): void {
    this.pagingConfig.itemsPerPage = event.target.value;
    this.pagingConfig.currentPage = 1;
    this.getAllBookingList();
  }
  onTableDataChange(event: any) {
    this.pagingConfig.currentPage = event;    
    this.getAllBookingList();
  }

  filterMonth(){
    console.log(this.currentMonth);
    console.log(this.currentYear);
    this.pagingConfig.currentPage = 1;
    this.getAllBookingList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
    this.getAllBookingList();
  }

  mainsearch(){
    this.pagingConfig.currentPage = 1
    this.getAllBookingList();    
  }

  getAllBookingList(){
    this.spinner.show();
    const data = {
      page: this.pagingConfig.currentPage,
      size: this.pagingConfig.itemsPerPage,
      sortBy: this.order,
      sortOrder: !this.reverse ? 'DESC' : 'ASC',
      search: this.searchText,
      month: this.currentMonth,
      year: this.currentYear
    };
    this.isLoading = true;

  
    var url = this.globals.getBookingListFilter;
    this.bookingService.create(url,data).then((Response: any) => {
      this.bookingData = Response.content;

      let y = 0;
      this.alldata = [];
      this.bookingData.forEach((element: any) => {
        this.alldata[y] = [];


        let id = "/bookings/update/"+element.id;
        var popup = "<a id='"+element.id+"'  (click)='openReassingBox('"+element.id+"')' title='Re-Assign Inspector / Reschedule Booking'><i class='feather icon-user'></i></a>";
        var popupdelete = "&nbsp;&nbsp;&nbsp;&nbsp;<span id='' style='cursor: pointer;' class='"+element.id+"' nm='22' title='Cancel Booking'><i class='feather icon-delete'></i></span>";
        var sendmail = "&nbsp;&nbsp;&nbsp;&nbsp;<a id='' class='' name='"+element.id+"'  style='cursor: pointer;' title='Resend Email'><i class='feather icon-mail'></i></a>";
        
        let url = '<a href="'+id+'" title="View Booking"><i class="feather icon-eye"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;'+popup+popupdelete+sendmail;
       
       
        //console.log(url)
        this.alldata[y].push(element.id);

        //obj.data[y].push(y+1);
        this.alldata[y].push(element.firstName+' '+element.lastName);
        this.alldata[y].push(element.address);
        this.alldata[y].push('<i class="feather icon-mail" title="'+element.email+'"></i>');

        var phn = this.formatPhoneNumber(element.phone);

        this.alldata[y].push('<i class="feather icon-phone" title="'+phn+'"></i>');
        /*if(element.inspectionTime == '09:00:00'){
          var ctime = '09:00 am';
        }else{
          var ctime = '02:00 pm';
        }*/

        var ctime = this.parseFromTwentyFourToAmPm(element.inspectionTime);
        
        if(element.inspectionDate != ''){
          this.alldata[y].push(this.formatDate(element.inspectionDate)+' '+ctime);
        }else{
          this.alldata[y].push(element.inspectionDate);
        }

        if(element.packageName == 'Total Solutions Bundle'){
          var pckname = 'TSB';
        }else{
          var pckname = 'T5';
        }
        this.alldata[y].push(pckname);
        this.alldata[y].push('$'+element.packagePrice);
        this.alldata[y].push(element.officerName);
        //obj.data[y].push(element.squareFeet);
        /*if(element.paymentStatus == 'PENDING'){
          element.paymentStatus = '<a id="" name="'+element.id+'" (click)="updatePaymentStatus('+element.id+')"><span>Awaiting</span></a>';
        }*/
        this.alldata[y].push(element.paymentStatus);
        let vid = "/bookings/agreement/"+element.id;
        if(element.paymentStatus == 'PAID'){
          var agreementurl = '<a href="'+vid+'">View Agreement</a>';
        }else{
          var agreementurl = '';
        }
        this.alldata[y].push(agreementurl);
        this.alldata[y].push(element.bookingType);
        this.alldata[y].push(element.status);
        this.alldata[y].push(element.createdDate);
        
        y = y+1;
      }); 



      console.log(this.alldata);
      this.isLoading = false;
      this.pagingConfig.totalItems = Response['totalElements'];
      console.log(Response['totalElements']);
      this.spinner.hide();
    });
    /*this.dashboardService.getFarmerList(data).subscribe(
      (res) => {
        console.log(res);
        this.isLoading = false;
        this.farmerData = res['content'];
        this.pagingConfig.totalItems = res['totalElements'];
        this.spinner.hide();
      },
      (err) => {
        this.isLoading = false;
        this.spinner.hide();
        this.alertService.clear();
        this.farmerData = [];
        this.pagingConfig.totalItems = 0;
        this.alertService.error(err.error.errors[0]);
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        console.error('catch', err);
      }
    );*/
  }


  /*openModal(event: any){
    this.item = new reassignModel();
    const target  = event.target || event.srcElement || event.currentTarget;
    const dataId = event.target.parentElement.id;
    const sendemail = Number(event.target.parentElement.name);
    const cancelsatus = Number(event.target.parentElement.className);
    if(dataId != ''){
      //console.log(event.target.parentElement.id);
      //console.log('ss')
      this.bookingService.get(this.globals.getReassignOfficer+'?id='+dataId).then((Response: any) => {
        this.inspectorData = Response.response;
        //console.log(Response.response);
      });
      this.item.bookingId = dataId;
      this.openPopup(this.basicModal);
    }else if(cancelsatus > 0){
      this.cancelId = cancelsatus;
      this.openCancelPopup(this.deleteModal);
    }else if(sendemail > 0){
      this.sendEmailId = sendemail;
      this.openMailPopup(this.emailModal);
    }else{
      
    }
   
  }*/

  openReassingBox(id:any){
    this.item = new reassignModel();
    this.bookingService.get(this.globals.getReassignOfficer+'?id='+id).then((Response: any) => {
      this.inspectorData = Response.response;
      //console.log(Response.response);
    });
    this.item.bookingId = id;
    this.openPopup(this.basicModal);
  }
  openCancelBox(id:number){
    this.cancelId = id;
    this.openCancelPopup(this.deleteModal);
  }
  openSendMail(id:number){
    this.sendEmailId = id;
    this.openMailPopup(this.emailModal);
  }

  openPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
     /*this.modalService.open(content, {}).result.then((result) => {
      console.log(result);
    }).catch((res) => {});*/
  }

  closePopup(){
    this.modalReference.close();
    this.formGroup.reset();
  }

  reassignSave(event: any){
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
    //console.log(this.item);
    //return false;
    if (this.item.bookingId) {
      if(this.item.type == 'Reassign'){
        var url = this.globals.updateBookingInspection+'?id='+this.item.bookingId+'&officerId='+this.item.inspectorId;
        var msg = "Inspector Re-assigned Successfully";
      }else{
        var url = this.globals.updateBookingReschedule;
        var msg = "Booking has been Rescheduled";
      }
      
      this.bookingService.create(url,this.item).then((response: any) => {
        if(response.status){
          this.showToast(msg);
        }else{
          this.errorshowToast(response.responseMessage);
        }
        
        this.modalReference.close();
        this.backtoList();
      },
        (rejected: RejectedResponse) => {
          this.item.bookingId = '';
        }
      );
    }
  }

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  errorshowToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Error!', text: msg, icon: 'error', });
  }

  backtoList() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/bookings']);
  }

  changeType(event: any){
    if(event.target.value == 'Reassign'){
      this.formGroup.controls['inspectorId'].setValidators([Validators.required]);
      this.formGroup.controls['inspectionNewTime'].setValidators(null); 
      this.formGroup.controls['inspectionNewDate'].setValidators(null);
      this.formGroup.controls['inspectionNewDuration'].setValidators(null); 
      this.formGroup.controls["inspectionNewTime"].updateValueAndValidity();
      this.formGroup.controls["inspectionNewDate"].updateValueAndValidity();
      this.formGroup.controls["inspectionNewDuration"].updateValueAndValidity();
      this.item.inspectionNewDate = '';
      this.item.inspectionNewTime = '';
      this.item.inspectionNewDuration = '';
    }else{
      this.item.inspectorId = '';
      this.inspectionNewDate = this.calendar.getToday();
      this.item.inspectionNewDate = this.inspectionNewDate.year+"-"+('0'+this.inspectionNewDate.month).slice(-2)+"-"+('0'+this.inspectionNewDate.day).slice(-2);
      this.formGroup.controls['inspectionNewTime'].setValidators([Validators.required]);
      this.formGroup.controls['inspectionNewDate'].setValidators([Validators.required]);
      this.formGroup.controls['inspectionNewDuration'].setValidators([Validators.required]);
      this.formGroup.controls['inspectorId'].setValidators(null);
      this.formGroup.controls["inspectorId"].updateValueAndValidity();
    }
    this.formGroup.updateValueAndValidity();
  }

  changeDate(event: any){
    this.item.inspectionNewDate = event.year+"-"+('0'+event.month).slice(-2)+"-"+('0'+event.day).slice(-2);
  }

  /*onTimeChange(event:any){
    this.item.inspectionNewTime = event.target.value;
    this.bookingService.get(this.globals.getInspectorDetalils+'?date='+this.item.inspectionNewDate+'&time='+this.item.inspectionNewTime+'&lat='+this.item.latitude+'&long='+this.item.longitude).then((response:any) => {
      this.showInspectorName = response.response.inspector_name;
    });
    
  }*/

  updatePaymentStatus(id: string){
    console.log(id)
  }

  openCancelPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  cancelBooking(id: number){
    this.modalReference.close();
    this.bookingService.create(this.globals.cancelBooking+'?id='+id+'&status=Cancelled',this.item).then((response) => {
      this.showToast('Booking Cancelled Successfully');
      this.backtoList();
      //this.SpinnerService.hide();
    },
      (rejected: RejectedResponse) => {
        this.item.bookingId = '';
        //this.alertService.error('There is something wrong',this.options);
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

  openMailPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  sendEmail(id: number){
    this.modalReference.close();
    this.bookingService.create(this.globals.sendEmail+'?id='+id,this.item).then((response) => {
      this.showToast('Email has been send Successfully');
      this.backtoList();
      //this.SpinnerService.hide();
    },
      (rejected: RejectedResponse) => {
        this.item.bookingId = '';
        //this.alertService.error('There is something wrong',this.options);
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

  public parseFromTwentyFourToAmPm(time: string): string {
    const H1 = time.split(':');
    const H = Number(H1[0]);
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "AM" : "PM";
    time = h + ':' + H1[1] + ' ' + ampm;
    return time;
  }

  changeDuration(event:any){
    /*console.log(this.item.inspectionTime)
    if(!this.item.inspectionTime){
      this.item.duration = '';
      alert('Please select start time');
      return;
    }*/

    let splitduration = event.target.value.split(':');
    this.item.inspectionNewDuration = event.target.value;
    if(splitduration[1] == 0){
      this.item.saveDuration = splitduration[0];
      var hrtobeadded:number = splitduration[0]-1;
      var minutes = '59';
      var finalminutes = '00';
    }else{
      this.item.saveDuration = splitduration[0]+'.5';
      var hrtobeadded:number = Number(splitduration[0]);
      var minutes:string = '30';
      var finalminutes = '30';
    }
    
    const splitedtime = this.item.inspectionNewTime.split(':');
    var databasehr = Number(splitedtime[0]) + Number(splitduration[0]);
    var dfinalhr;
    if(databasehr < 10){
      dfinalhr = '0'+databasehr;
    }else{
      dfinalhr = databasehr;
    }

    console.log(splitedtime[0])
    var hr = Number(splitedtime[0]) + Number(hrtobeadded);
      //console.log(hr)
      var finalhr;
      if(hr < 10){
        finalhr = '0'+hr;
      }else{
        finalhr = hr;
      }
      console.log(minutes)
    this.item.inspectionNewEndTime = finalhr+':'+minutes+':00';
    console.log(dfinalhr+':'+finalminutes+':00');
    this.item.saveEndTime = dfinalhr+':'+finalminutes+':00';

    



    /*console.log('database-'+this.item.inspectionEndTime);
    console.log('api-'+finalendtime);

    if(this.item.id){
      var bkid = this.item.id;
    }else{
      var bkid = '0';
    }
    this.bookingService.get(this.globals.blockSlotAPIv2+'?date='+this.item.inspectionDate+'&time='+this.item.inspectionTime+'&lat='+this.item.latitude+'&long='+this.item.longitude+'&endtime='+finalendtime+'&bookingId='+bkid).then((response:any) => {
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
    });*/
  }

  changeDurationNew(event:any){
    this.item.inspectionNewDuration = event.target.value;
    let splitduration = event.target.value.split(':');
    
    if(splitduration[1] == 0){
      var minutes = '00';
      this.item.saveDuration = splitduration[0];
    }else{
      var minutes:string = '30';
      this.item.saveDuration = splitduration[0]+'.5';
    }

    var calendtime = splitduration[0]+':'+minutes+':00';
    const totaltime = this.addTimes(this.item.inspectionNewTime,calendtime);
    this.item.saveEndTime = totaltime;

    console.log(totaltime);
    
    const splitedtime = totaltime.split(':');
    let modifiedendtime = '';
    if(splitedtime[1] == '00'){
      var newtime = Number(splitedtime[0])-1;
      let addedtime;
      if(newtime < 10){
        addedtime = '0'+newtime;
      }else{
        addedtime = newtime;
      }
      modifiedendtime = addedtime+':59:00';
    }else{
      modifiedendtime = splitedtime[0]+':29:00';
    }
    this.item.inspectionNewEndTime = modifiedendtime;

    console.log(this.item);
    
  }
  
  addTimes(start:string, end: string) {
    var a = start.split(":");
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    var b = end.split(":");
    var seconds2 = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
  
    var date = new Date(1970, 0, 1);
    date.setSeconds(seconds + seconds2);
    var c = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    return c;
  }
}
