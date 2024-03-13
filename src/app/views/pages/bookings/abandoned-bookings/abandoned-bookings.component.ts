import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BookingService } from '../booking.service';
import { AlertService } from '../../alert/alert.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../../../global-constants';
import { RejectedResponse } from '../../../models/rejected-response';
import { DataTable } from "simple-datatables";
import { formatDate } from "@angular/common";
import swal from 'sweetalert2';

@Component({
  selector: 'app-abandoned-bookings',
  templateUrl: './abandoned-bookings.component.html',
  styleUrls: ['./abandoned-bookings.component.scss']
})
export class AbandonedBookingsComponent implements OnInit {

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
    var url = this.globals.abandonedList;
    

    //this.SpinnerService.show();
    this.bookingService.get(url).then((Response: any) => {
      this.bookingData = Response.data;
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
          "Created At"
        ],
        data: []
      };

      let y = 0;
      this.bookingData.forEach((element: any) => {
        obj.data[y] = [];

        let detailurl = "/bookings/abandoned/detail/"+element.id;
        var popupdelete = "<a href='"+detailurl+"'><i class='feather icon-eye' title='View Detail'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;<span id='' style='cursor: pointer;' class='"+element.id+"' title='Delete Entry'><i class='feather icon-delete'></i></span>";
        let url = popupdelete;
        obj.data[y].push(url);

        obj.data[y].push(element.firstName+' '+element.lastName);
        obj.data[y].push(element.address);
        obj.data[y].push(element.email);

        var phn = this.formatPhoneNumber(element.phone);

        obj.data[y].push(phn);
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
    this.bookingService.update(this.globals.deleteAbondonedList+'?id='+id,item).then((response) => {
      this.showToast('Entry Deleted Successfully');
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
    this.router.navigate(['/bookings/abandoned']);
  }

}
