import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../booking.service';
import { GlobalConstants } from '../../../,,/../../global-constants';
import { BookingModel } from '../booking.model';
import { formatDate } from "@angular/common";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-booking-agreement',
  templateUrl: './booking-agreement.component.html',
  styleUrls: ['./booking-agreement.component.scss']
})
export class BookingAgreementComponent implements OnInit {

  @ViewChild('showinvoice') basicModal: any;
  item: BookingModel = new BookingModel();
  signdatetime: string;
  invoicepdf: boolean =false;
  modalReference: NgbModalRef;
  
  constructor(private activatedRoute: ActivatedRoute,
    private bookingService: BookingService,
    private modalService: NgbModal,
    public globals: GlobalConstants) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      var id = params["id"];
      if (id) {
        this.bookingService.get(this.globals.getBookingById+'/?id='+id).then((Response: any) => {
          this.item = Response.response;
          this.signdatetime = this.formatDate(Response.response.createdDate)
          /*this.saveButton = false;
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
          this.finalServiceCost = this.item.packagePrice;
          */
        });
      }
    });
  }

  public formatDate(date: any){
    const format = 'MM/dd/yyyy H:mm:s';
    const locale = 'en-US';
    const formattedDate = formatDate(date, format, locale);
    return formattedDate;
  }

  printThisPage() {
    window.print();
  }

  downloadInvoice() {
    //let DATA : any = '<div class="card-body" id="invoiceData"> <div class="container-fluid d-flex justify-content-between"> <div class="col-lg-3 ps-0"> <p class="mt-1 mb-1"><img src="assets/images/others/Logo.png" width="250px;"></p> <p>Client: '+this.item.firstName+' '+this.item.lastName+'</p> <h5 class="mt-5 mb-2 text-muted">For inspection at: :</h5> <p>'+this.item.address+'</p> </div> <div class="col-lg-3 pe-0"> <h4 class="fw-bold text-uppercase text-end mt-4 mb-2">invoice</h4> <h6 class="text-end mb-5 pb-4"># INV-'+this.item.id+'</h6> <h4 class="text-end fw-normal">$ '+this.item.packagePrice+'</h4> <h6 class="mb-0 mt-3 text-end fw-normal mb-2"><span class="text-muted">Invoice Date :</span> '+this.item.inspectionDate+'</h6> </div> </div> <div class="container-fluid mt-5 d-flex justify-content-center w-100"> <div class="table-responsive w-100"> <table class="table table-bordered"> <thead> <tr> <th>#</th> <th>Description</th> <th class="text-end">Quantity</th> <th class="text-end">Unit cost</th> <th class="text-end">Total</th> </tr> </thead> <tbody> <tr class="text-end"> <td class="text-start">1</td> <td class="text-start">Home Inspection '+this.item.squareFeet+'sq ft.</td> <td>01</td> <td>$'+this.item.packagePrice+'</td> <td>$'+this.item.packagePrice+'</td> </tr> </tbody> </table> </div> </div> <div class="container-fluid mt-5 w-100"> <div class="row"> <div class="col-md-6 ms-auto"> <div class="table-responsive"> <table class="table"> <tbody> <tr> <td></td> <td class="text-end"><b>Total :</b><b> $'+this.item.packagePrice+'</b></td> </tr> </tbody> </table> </div> </div> </div> </div> </div>';
    let DATA: any = document.getElementById('invoiceData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('invoice.pdf');
    });
    //this.invoicepdf = false;
    this.modalReference.close();
  }

  exportToPDF() {
    const htmlWidth = 500;
    const htmlHeight = 1000;

    const topLeftMargin = 15;

    let pdfWidth = htmlWidth + (topLeftMargin * 2);
    let pdfHeight = (pdfWidth * 1.5) + (topLeftMargin * 2);

    const canvasImageWidth = htmlWidth;
    const canvasImageHeight = htmlHeight;

    const totalPDFPages = Math.ceil(htmlHeight / pdfHeight) - 1;

    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA, { allowTaint: true }).then(canvas => {

      canvas.getContext('2d');
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      let pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'png', topLeftMargin, topLeftMargin, canvasImageWidth, canvasImageHeight);

      for (let i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([pdfWidth, pdfHeight], 'p');
        pdf.addImage(imgData, 'png', topLeftMargin, - (pdfHeight * i) + (topLeftMargin * 4), canvasImageWidth, canvasImageHeight);
      }

      pdf.save(`Contract ${new Date().toLocaleString()}.pdf`);
    });
  }

  showInvoice(){
    this.openPopup(this.basicModal);
  }
  openPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content,{windowClass: 'my-modal-popup',size: "lg",});
  }
}
