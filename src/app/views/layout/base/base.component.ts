import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import swal from 'sweetalert2';
import { RejectedResponse } from '../../models/rejected-response';
import { NgbCalendar, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../../global-constants';
import { BookingService } from '../../pages/bookings/booking.service';
import { reassignModel } from '../../pages/bookings/booking.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InspectorService } from '../../pages/inspectors/inspector.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {

  @ViewChild('basicModal11') basicModal: any;
  @ViewChild('deleteModal11') deleteModal: any;
  isLoading: boolean;
  modalReference: NgbModalRef;
  cancelId: number;
  formGroup: FormGroup;
  item: reassignModel = new reassignModel();
  submitted:boolean=false;
  inspectionNewDate: NgbDateStruct;
  minDate: any;
  inspectorData: any;
  reassignTitle: string;
  deleteId: number;

  @ViewChild('basicModalBlock') basicModalBlock: any;

  constructor(private router: Router,
    private bookingService: BookingService,
    private inspectorService: InspectorService,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public globals: GlobalConstants) { 

      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    // Spinner for lazyload modules
    router.events.forEach((event) => { 
      if (event instanceof RouteConfigLoadStart) {
        this.isLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isLoading = false;
      }
    });

    
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      inspectionNewDate: new FormControl(""),
      inspectionNewTime: new FormControl(""),
      inspectionNewDuration: new FormControl(""),
      inspectorId: new FormControl(""),
    });
  }

  get f() { 
    return this.formGroup.controls; 
  }

  workorder(event:any){
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    var id = contextMenu.getAttribute('data-id');
    console.log(id);
    contextMenu.style.display = 'none';
    this.router.navigate(['/bookings/update/'+id]);
  }

  openModal(){
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    var id = Number(contextMenu.getAttribute('data-id'));
    this.cancelId = id;
    this.openCancelPopup(this.deleteModal);
    contextMenu.style.display = 'none';
  }

  closewindow(event:any){
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    contextMenu.style.display = 'none';
  }

  closewindowOff(event:any){
    const contextMenuOff = (<HTMLInputElement>document.getElementById('contextMenuOff'));
    contextMenuOff.style.display = 'none';
  }

  openCancelPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  closePopup(){
    this.modalReference.close();
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    contextMenu.style.display = 'none';
  }

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  errorshowToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Error!', text: msg, icon: 'error', });
  }

  cancelBooking(id: number){
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    this.modalReference.close();
    let item: any;
    this.bookingService.create(this.globals.cancelBooking+'?id='+id+'&status=Cancelled',item).then((response) => {
      this.showToast('Booking Cancelled Successfully');
      this.backtoList();
      //this.SpinnerService.hide();
    },
      (rejected: RejectedResponse) => {
        
      }
    );
  }

  reassign(){
    this.openPopup('reassign');
  }
  reschedule(){
    this.openPopup('reschedule');
  }

  openPopup(type:string){
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    var id = contextMenu.getAttribute('data-id');
    this.item.bookingId = String(id);
    this.changeType(type);
    if(type == 'reassign'){
      this.reassignTitle = 'Re-Assign Inspector';
      this.item.type = 'Reassign';
      this.bookingService.get(this.globals.getReassignOfficer+'?id='+id).then((Response: any) => {
        this.inspectorData = Response.response;
        //this.changeType('Reassign');
      });
    }else{
      this.reassignTitle = 'Reschedule Booking';
      this.item.type = 'Reschedule';
      //this.changeType('Reschedule');
    }
    this.openCancelPopup(this.basicModal);
    contextMenu.style.display = 'none';
  }

  reassignSave(event: any){
    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
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

  changeType(type: string){
    if(type == 'reassign'){
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
  
  backtoList() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/dashboard']);
  }

  deleteBlockOff(event:any){
    console.log(event);
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenuOff'));
    var id = Number(contextMenu.getAttribute('data-id'));
    this.deleteId = id;
    if(this.deleteId != 0){
      contextMenu.style.display = 'none';
      this.openPopupBlock(this.basicModalBlock);
    }
  }

  deleteSlotDe(id:number){
    this.modalReference.close();
    this.inspectorService.create(this.globals.deleteBlockSlot+'?id='+id,this.item).then((response) => {
      this.showToast('Delete Successfully');
      this.backtoList();
    },
      (rejected: RejectedResponse) => {
        
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

  openPopupBlock(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  closePopupBlock(){
    this.modalReference.close();
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
