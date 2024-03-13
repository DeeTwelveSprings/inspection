import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BookingModel } from '../booking.model';
import { GlobalConstants } from '../../../../global-constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from '../booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTable } from "simple-datatables";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-track-booking',
  templateUrl: './track-booking.component.html',
  styleUrls: ['./track-booking.component.scss']
})
export class TrackBookingComponent implements OnInit {

  @ViewChild('smsModal') smsModal: any;
  @ViewChild('emailModel') emailModel: any;
  item: BookingModel = new BookingModel();
  backurl: string= '';
  modalReference: NgbModalRef;
  bookingData: any;
  smsContent: any;
  emailContent: any;
  public safeValue: SafeHtml;
  
  constructor(public globals: GlobalConstants,
    private modalService: NgbModal,
    private el: ElementRef,
    private bookingService: BookingService,
    private activatedRoute: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      var id = params["id"];
      if (id) {
        this.bookingService.get(this.globals.getBookingDataV2+'/?id='+id).then((Response: any) => {
          this.item = Response.response;
        });

        var url = this.globals.getEmailSMSlog;
        this.bookingService.get(url+'/?id='+id).then((Response: any) => {
          this.bookingData = Response.response;
          //this.checkval = true;
          //this.SpinnerService.hide();
        
          let obj: any = {
            // Quickly get the headings
            headings: [
              "Action",
              "Type",
              "Subject",
              "Sent At"
            ],
            data: []
          };
    
          let y = 0;
          this.bookingData.forEach((element: any) => {
            obj.data[y] = [];
    
            //let detailurl = "/bookings/abandoned/detail/"+element.id;
            var popupdelete = "<a id='"+btoa(JSON.stringify(element))+"'><i class='feather icon-eye' title='View Detail'></i></a></span>";
            let url = popupdelete;
            obj.data[y].push(url);
            obj.data[y].push(element.logType);
            obj.data[y].push(element.subject);
            obj.data[y].push(element.createdDate);
            
            y = y+1;
          });   
          let dataTable = new DataTable("#dataTableExample", {
            data: obj,
          });
        });
        this.backurl = '/bookings/update/'+id;
      }
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

  openModal(event: any){
    this.smsContent = '';
    this.emailContent = '';
    const dataId = atob(event.target.parentElement.id);
    var alldata = JSON.parse(dataId);
    console.log(alldata.emailContent)
    if(alldata.logType == 'Email'){
      this.emailContent = alldata.emailContent;
      this.openEmailPopup(this.emailModel);
    }else{
      this.smsContent = alldata.emailContent;
      this.openPopup(this.smsModal);
    }
    
  }

  openPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  openEmailPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content,{windowClass: 'emailPopup'});
  }


  closePopup(){
    this.modalReference.close();
  }

  getSafeHtml(){
    return this.safeValue = this.sanitizer.bypassSecurityTrustHtml(this.emailContent);
  }


}
