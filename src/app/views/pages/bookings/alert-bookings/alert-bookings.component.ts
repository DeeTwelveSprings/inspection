import { Component, OnInit } from '@angular/core';
import { BookingService } from '../booking.service';
import { GlobalConstants } from '../../../../global-constants';
import { DataTable } from "simple-datatables";
import { formatDate } from "@angular/common";
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-alert-bookings',
  templateUrl: './alert-bookings.component.html',
  styleUrls: ['./alert-bookings.component.scss']
})
export class AlertBookingsComponent implements OnInit {

  bookingData: any;

  constructor(private bookingService: BookingService,
    public alertService: AlertService,
    public globals: GlobalConstants) { }

  ngOnInit(): void {
    this.getBookingList();
  }

  public getBookingList(){
    var url = this.globals.alertBookingList;
    

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
          "Square Footage",
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


        let id = "/bookings/update/"+element.id;
        let url = '<a href="'+id+'" title="Update Booking"><i class="feather icon-eye"></i></a>';
       
       
        //console.log(url)
        obj.data[y].push(url);

        //obj.data[y].push(y+1);
        obj.data[y].push(element.firstName+' '+element.lastName);
        obj.data[y].push(element.address);
        obj.data[y].push(element.email);
        obj.data[y].push(this.formatPhoneNumber(element.phone));
        /*if(element.inspectionTime == '09:00:00'){
          var ctime = '09:00 am';
        }else{
          var ctime = '02:00 pm';
        }*/
  
        var ctime = this.parseFromTwentyFourToAmPm(element.inspectionTime);

        obj.data[y].push(element.inspectionDate+' '+ctime);

        obj.data[y].push(element.packageName);
        obj.data[y].push('$'+element.packagePrice);
        obj.data[y].push(element.officerName);
        obj.data[y].push(element.squareFeet);
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

  public parseFromTwentyFourToAmPm(time: string): string {
    const H1 = time.split(':');
    const H = Number(H1[0]);
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "AM" : "PM";
    time = h + ':' + H1[1] + ' ' + ampm;
    return time;
  }

}
