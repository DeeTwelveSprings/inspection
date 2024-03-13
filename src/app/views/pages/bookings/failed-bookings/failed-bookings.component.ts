import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BookingService } from '../booking.service';
import { GlobalConstants } from '../../../../global-constants';
import { DataTable } from "simple-datatables";
import { formatDate } from "@angular/common";
import { AlertService } from '../../alert/alert.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { RejectedResponse } from '../../../models/rejected-response';

@Component({
  selector: 'app-failed-bookings',
  templateUrl: './failed-bookings.component.html',
  styleUrls: ['./failed-bookings.component.scss']
})
export class FailedBookingsComponent implements OnInit {

  bookingData: any;
  cancelId: number;
  modalReference: NgbModalRef;
  @ViewChild('deleteModal') deleteModal: any;

  constructor(private bookingService: BookingService,
    public alertService: AlertService,
    private router: Router,
    private modalService: NgbModal,
    public globals: GlobalConstants) { }

  ngOnInit(): void {
    this.getBookingList();
  }

  public getBookingList(){
    var url = this.globals.pendingBookingList;
    

    //this.SpinnerService.show();
    this.bookingService.get(url).then((Response: any) => {
      this.bookingData = Response.response;
      //this.checkval = true;
      //this.SpinnerService.hide();
    
      let obj: any = {
        // Quickly get the headings
        headings: [
          "Action",
          "Full Name",
          "Address",
          "Email",
          "Phone",
          "Inspection Date/Time",
          "Package Name",
          "Package Price",
          "Inspector Name",
          "Payment Status",
          "Agreement",
          'Booking Type',
          'Status',
          "Created At",
          
        ],
        data: []
      };

      let y = 0;
      this.bookingData.forEach((element: any) => {
        obj.data[y] = [];

        var popupdelete = "&nbsp;&nbsp;&nbsp;&nbsp;<span id='' style='cursor: pointer;' class='"+element.id+"' title='Cancel Booking'><i class='feather icon-delete'></i></span>";
        
        let id = "/bookings/update/"+element.id;
        let url = '<a href="'+id+'" title="Update Booking"><i class="feather icon-eye"></i></a>'+popupdelete;
       
       
        //console.log(url)
        obj.data[y].push(url);

        //obj.data[y].push(y+1);
        obj.data[y].push(element.firstName+' '+element.lastName);
        obj.data[y].push(element.address);
        obj.data[y].push('<i class="feather icon-mail" title="'+element.email+'"></i>');

        var phn = this.formatPhoneNumber(element.phone);

        obj.data[y].push('<i class="feather icon-phone" title="'+phn+'"></i>');
        /*if(element.inspectionTime == '09:00:00'){
          var ctime = '09:00 am';
        }else{
          var ctime = '02:00 pm';
        }*/

        var ctime = this.parseFromTwentyFourToAmPm(element.inspectionTime);
        
        if(element.inspectionDate != ''){
          obj.data[y].push(this.formatDate(element.inspectionDate)+' '+ctime);
        }else{
          obj.data[y].push('');
        }

        if(element.packageName == 'Total Solutions Bundle'){
          var pckname = 'TSB';
        }else{
          var pckname = 'T5';
        }
        obj.data[y].push(pckname);
        obj.data[y].push('$'+element.packagePrice);
        obj.data[y].push(element.officerName);
        //obj.data[y].push(element.squareFeet);
        /*if(element.paymentStatus == 'PENDING'){
          element.paymentStatus = '<a id="" name="'+element.id+'" (click)="updatePaymentStatus('+element.id+')"><span>Awaiting</span></a>';
        }*/
        obj.data[y].push(element.paymentStatus);
        let vid = "/bookings/agreement/"+element.id;
        if(element.paymentStatus == 'PAID'){
          var agreementurl = '<a href="'+vid+'">View Agreement</a>';
        }else{
          var agreementurl = '';
        }
        obj.data[y].push(agreementurl);
        obj.data[y].push(element.bookingType);
        obj.data[y].push(element.status);
        obj.data[y].push(element.createdDate);
        
        y = y+1;
      });   
      let dataTable = new DataTable("#dataTableExample", {
        data: obj,
      });
    });
    
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

  openModal(event: any){
    const dataId = event.target.parentElement.id;
    const cancelsatus = Number(event.target.parentElement.className);
    if(dataId != ''){
      
    }else if(cancelsatus > 0){
      this.cancelId = cancelsatus;
      this.openCancelPopup(this.deleteModal);
    }else {
      
    }
  }

  openCancelPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  closePopup(){
    this.modalReference.close();
  }

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  errorshowToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Error!', text: msg, icon: 'error', });
  }

  cancelBooking(id: number){
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

  backtoList() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/bookings']);
  }

  public parseFromTwentyFourToAmPm(time: string): string {
    const H1 = time.split(':');
    const H = Number(H1[0]);
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "AM" : "PM";
    time = h + ':' + H1[1] + ' ' + ampm;
    return time;
  }
}
