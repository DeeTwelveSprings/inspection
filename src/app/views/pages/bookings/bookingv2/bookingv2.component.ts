import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BookingModel, agentModel, emailModel, notesModel } from '../booking.model';
import { NgbDateStruct, NgbDatepicker,NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Time } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import { InspectorService } from '../../inspectors/inspector.service';
import { ResourceInput } from '@fullcalendar/resource-common';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-bookingv2',
  templateUrl: './bookingv2.component.html',
  styleUrls: ['./bookingv2.component.scss']
})
export class Bookingv2Component implements OnInit {

  @ViewChild('agentModal') agentModal: any;
  formGroup: FormGroup;
  notesformGroup: FormGroup;
  agentformGroup: FormGroup;
  emailformGroup: FormGroup;
  addUpdateLabel: string;
  submitted: boolean = false;
  agentSubmitted: boolean = false;
  emailSubmitted: boolean = false;
  saveLabel: string;
  item: BookingModel = new BookingModel();
  paymentUrl: string;

  alltabs: any = ['tabclientinfo', 'tabaddress','tabproperty','tabdatetime','tabagent','tabcontract','tabinspectiontype','tabnotes','tabemail']
  tabclientinfo: boolean = true;
  tabaddress: boolean = false;
  tabagent: boolean = false;
  tabcontract: boolean = false;
  tabproperty: boolean =false;
  tabdatetime: boolean = false;
  tabnotes:boolean= false;
  tabinspectiontype: boolean = false;

  tabemail: boolean= false;
  
  templateData: any;
  startDateMonth: any;
  showInspectorName: string;
  inspectorAlert: string='';
  additionalServicesCost: number = 0.00;
  serviceCost: number = 0.00;
  finalServiceCost: number = 0.00;
  subPackage: boolean = false;
  slotBooked: boolean = false;
  showpckg: boolean = false;
  transsectionOn: boolean = false;
  secondaryOn: boolean  =false;
  searching: boolean = false;
  searchList: any;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  invName: string = '';
  invName1: string = '';
  inspectionDate: NgbDateStruct;
  date: { year: number; month: number };
  minDate: any;
  packageType: string = '';
  squarefeetPrice = 0;
  yearBuiltPrice = 0;
  servicesArr: any = [];
  ontheflyInspectorID: number = 0;
  i1: boolean = true;
  i2: boolean = true;
  i3: boolean = true;
  i4: boolean = true;
  i5: boolean = true;
  i6: boolean = true;
  i7: boolean = true;
  i8: boolean = true;

  checkboxArr: any = [];
  checkboxVal: any = [];
  saveButton: boolean = true;
  showDuration: string;
  allofficerData: any;
  currentTodayDate = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

  bsubscribe: string = '';
  basubscribe: string = '';
  sasubscribe: string = '';

  options: any = {
    componentRestrictions: { administrativeArea: 'TX' }
  } 
  contracttext = "<p>THIS CONTRACT LIMITS THE LIABILITY OF THE HOME INSPECTION COMPANY. PLEASE READ CAREFULLY BEFORE SIGNING.</p>    <p>In addition to the limitations in the Standards of Practice, the Inspection of this property is subject to the Limitations and Conditions set out in this Agreement. The Inspection is performed in accordance with the Standards of Practice of our national association.</p>        <p>LIMITATIONS AND CONDITIONS OF THE HOME INSPECTION</p>        <p>There are limitations to the scope of this Inspection. It provides a general overview of the more obvious repairs that may be needed. It is not intended to be an exhaustive list. The ultimate decision of what to repair or replace is yours. One homeowner may decide that certain conditions require repair or replacement, while another will not.</p>        <b>1) THE INSPECTION IS NOT TECHNICALLY EXHAUSTIVE.</b>    <p>The Home Inspection provides you with a basic overview of the condition of the property. Because your Home Inspector has only a limited amount of time to go through the property, the Inspection is not technically exhaustive.</p>    <p>Some conditions noted, such as foundation cracks or other signs of settling in a house, may either be cosmetic or may indicate a potential problem that is beyond the scope of the Home Inspection.</p>    <p>If you are concerned about any conditions noted in the Home Inspection Report, we strongly recommend that you consult a qualified Licensed Contractor or Consulting Engineer. These professionals can provide a more detailed analysis of any conditions noted in the Report at an additional cost.</p>        <b>2) THE INSPECTION IS AN OPINION OF THE PRESENT CONDITION OF THE VISIBLE COMPONENTS.</b>    <p>The Home Inspector's Report is an opinion of the present condition of the property. It is based on a visual examination of the readily accessible features of the building.</p>        <p>A Home Inspection does not include identifying defects that are hidden behind walls, floors or ceilings. This includes wiring, heating, cooling, structure, plumbing and insulation that are hidden or inaccessible.</p>    <p>Some intermittent problems may not be obvious on a Home Inspection because they only happen under certain circumstances. As an example, your Home Inspector may not discover leaks that occur only during certain weather conditions or when a specific tap or appliance is being used in everyday life.</p>    <p>Home Inspectors will not find conditions that may only be visible when storage or furniture is moved. They do not remove wall coverings (including wallpaper) or lift flooring (including carpet) or move storage to look underneath or behind.</p>        <b>3) THE INSPECTION DOES NOT INCLUDE HAZARDOUS MATERIALS.</b>    <p>This includes building materials that are now suspected of posing a risk to health such as phenol-formaldehyde and urea-formaldehyde based insulation, fiberglass insulation and vermiculite insulation. The Inspector does not identify asbestos roofing, siding, wall, ceiling or floor finishes, insulation or fireproofing. We do not look for lead or other toxic metals in such things as pipes, paint or window coverings.</p>    <p>The Inspection does not deal with environmental hazards such as the past use of insecticides, fungicides, herbicides or pesticides. The Home Inspector does not look for, or comment on, the past use of chemical termite treatments in or around the property.</p>        <b>4) WE DO NOT COMMENT ON THE QUALITY OF AIR IN A BUILDING.</b>        <p>The Inspector does not try to determine if there are irritants, pollutants, contaminants, or toxic materials in or around the building.</p>    <p>The Inspection does not include spores, fungus, mold or mildew that may be present. You should note that whenever there is water damage noted in the report, there is a possibility that mold or mildew may be present, unseen behind a wall, floor or ceiling.</p>    <p>If anyone in your home suffers from allergies or heightened sensitivity to quality of air, we strongly recommend that you consult a qualified Environmental Consultant who can test for toxic materials, mold and allergens at additional cost.</p>        <b>5) WE DON'T LOOK FOR BURIED TANKS.</b>    <p>Your Home Inspector does not look for and is not responsible for fuel oil, septic or gasoline tanks that may be buried on the property. If the building had its heating system converted from oil, there will always be the possibility that a tank may remain buried on the property.</p>    <p>If fuel oil or other storage tanks remain on the property, you may be responsible for their removal and the safe disposal of any contaminated soil. If you suspect there is a buried tank, we strongly recommend that you retain a qualified Environmental Consultant to determine whether this is a potential problem.</p>        <b>6) TIME TO INVESTIGATE</b>    <p>We will have no liability for any claim or complaint if conditions have been disturbed, altered, repaired, replaced or otherwise changed before we have had a reasonable period of time to investigate.</p>        <b>7) REPORT IS FOR OUR CLIENT, CLIENT ALSO AGREES FOR THE INSPECTION HOUSE TO RELEASE THE REPORT TO THE REALTOR WORKING WITH OR REPRESENTING THE CLIENT, THIS REPRESENTATION INCLUDES WRITTEN REPRESENTATION BUYER/SELLER AGREEMENT OR VERBAL/IMPLIED REPRESENTATION.</b>        <p>No use of the information by any other party is intended. </p>        <b>8) CANCELLATION FEE</b>    <p>If the inspection is cancelled within 24 hours of the appointment time, a cancellation fee of 50% of the inspection fee will apply.</p>        <b>9) NOT A GUARANTEE, WARRANTY OR INSURANCE POLICY.</b>    <p>The inspection is not a guarantee, warranty or an insurance policy with regard to the fitness of the property.</p>        <b>10) LIMIT OF LIABILITY / LIQUIDATED DAMAGES</b>    <b>11) CLIENT AUTHORIZES CONTACT CONCERNING SECURITY SERVICES</b>    <b>12) CLIENT AGREES THAT ACCEPTANCE OF THE CONTRACT IS ACCEPTANCE OF WORK COMPLETED, AND AGREES TO RENDER PAYMENT IN FULL, AND AGREES TO NOT CHARGEBACK. CLIENT ASSUMES ALL COSTS AND FEES INCLUDING ANY FEES FROM THE PROCESSING COMPANY AND ANY LEGAL FEES INCUREED.</b>    <p>The liability of the Home Inspector and the Home Inspection Company arising out of this Inspection and Report, for any cause of action whatsoever, whether in contract or in negligence is limited to refund of the fees that you have been charged for the inspection.</p>    <p>I hearby accept the terms and conditions of this agreement.</p>";
  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['code-block'],
       //  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
       //  [{ 'direction': 'rtl' }],                         // text direction

       //  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'align': [] }],

       //  ['clean'],                                         // remove formatting button

       //  ['link'],
        ['link', 'image', 'video']
      ],
    },
 } 

  buildingTypeData: any = ['Unknown','Detached','Attached','Row','Semi-Detached','Backsplit','Townhome','Stached Townhome','Condo-High rise','Condo-Townhome','Condo-Stacked','Bi-Level','Tri-Level']
  dwellingData: any = ['Unknown','Single','Duplex','Triplex','Fourplex','Multi-Unit','Single + bsmt apt','Single + Suite']
  storiesData: any = ['Unknown','1','1.5','2','2.5','3','4','5']
  roomsData: any = ['Unknown','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15']
  bedroomData: any = ['Unknown','1','2','3','4','5','6','7','8']
  bathroomData: any = ['Unknown','1','1.5','2','2.5','3','3.5','4','4.5','5','5.5','6','6.5','7','7.5']
  modifiedTime: string;
  notesData: any;
  itemNotes: notesModel = new notesModel();
  modalReference: NgbModalRef;
  itemAgent: agentModel = new agentModel();
  itemEmail: emailModel = new emailModel();

  op1:boolean = false;
  op2:boolean = false;
  op3:boolean = false;
  op4:boolean = false;
  op5:boolean = false;
  op6:boolean = false;
  op7:boolean = false;
  op8:boolean = false;
  updatedPrice: number = 0;
  loadcal: boolean = false;

  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimelineDay',
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: ''
    },
    views: {
      resourceTimelineDay: {
        title: 'dddd, MMMM Do YYYY'
      }
    },
    resourceAreaWidth: 200,
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    contentHeight: 300,
    height: 450,
    eventContent: function( info ) {
      return {html: info.event.title};
    },  
    resourceAreaColumns: [
      {
        field: 'title',
        headerContent: 'Inspectors',
      }
    ],
    nowIndicator: false,
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: false,
    dayMaxEvents: false,
    //select: this.handleDateSelect.bind(this),
    //eventClick: this.handleEventClick.bind(this),
    //eventsSet: this.handleEvents.bind(this),
    //datesSet: this.handleDateChanged.bind(this),
    //eventDidMount: this.handleEventDidMount.bind(this),
    //resourceLabelDidMount: this.labelColor.bind(this)
  };
  bookingData: any;
  blockOffData: any;
  Events: any[] = [];
  inspectorData: any;
  resources: ResourceInput[] = [];
  @ViewChild('fc') calendarComponent: FullCalendarComponent;
  availableUpdate: string;

  isReinspection: boolean = false;
  reinspectionPrice: string;
  isReinspecData: boolean = false;
  checkReInspe: string;
  utilityInfo: any;

  constructor(private calendar: NgbCalendar,
    public globals: GlobalConstants,
    public alertService: AlertService,
    private modalService: NgbModal,
    private el: ElementRef,
    private inspectorService: InspectorService,
    private bookingService: BookingService,
    private http: HttpClient, 
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.bookingService.get(this.globals.getTemplates).then((Response: any) => {
      this.templateData = Response.response;
    });
    
    this.BindFormGroup();

    this.activatedRoute.params.subscribe((params) => {
      var id = params["id"];
      if (id) {
        this.bookingService.get(this.globals.getBookingDataV2+'/?id='+id).then((Response: any) => {
          this.item = Response.response;
          if(Response.utility){
            this.utilityInfo = Response.utility[0];
          }else{
            this.utilityInfo = [];
          }
          
          console.log(this.item)
          this.availableUpdate = this.item.inspectionDate;
          this.addUpdateLabel = 'Update';

          if(this.item.reinspection == 'Yes'){
            this.reinspectionPrice = String(this.item.packagePrice);
            this.isReinspecData = true;
            this.checkReInspe = '1';
          }else{
            this.item.reinspection = 'No';
            this.reinspectionPrice = '175';
            this.checkReInspe = '0';
          }

          if(this.item.paymentStatus == 'PENDING'){
            this.saveButton = true;
            this.saveLabel = 'Save';
            //this.addUpdateLabel = 'Update';
          }else{
            this.saveButton = false;
            //this.addUpdateLabel = 'Create'
          }

          this.saveLabel = 'Save';
          //this.saveButton = false;
          
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

          if(this.item.sellerAgentName != ''){
            this.invName1 = this.item.sellerAgentName;
          }
          const selDat = this.item.inspectionDate.split('-');
          this.startDateMonth = { year :Number(selDat[0]),month: Number(selDat[1])}
          const obj: NgbDateStruct =  { year: Number(selDat[0]), month: Number(selDat[1]), day: Number(selDat[2]) }
          this.inspectionDate = obj;
          if(Response.response.package_type == 'Total Solutions Bundle'){
            this.packageType = '2';
          }else{
            this.packageType = '1';
          }
      
          if(this.item.inspectionType == 'New Construction' || this.item.inspectionType == 'Builder warranty Inspection'){
            this.packageType = '3';
          }
          
          this.showInspectorName = Response.response.officerName;
          this.ontheflyInspectorID = Response.response.officerId;
          this.servicesArr = this.item.additionalServices.slice(0,-1).split(",");

          this.checkboxArr = [];
          this.checkboxVal = [];
          var n1 = this.servicesArr.includes("Swimming Pool/Hot Tub");
          if(n1){
            this.item.op1 = true;
            this.checkboxArr.push('100');
            this.checkboxVal.push('Swimming Pool/Hot Tub')
          }

          var n2 = this.servicesArr.includes("Septic");
          if(n2){
            this.item.op2 = true;
            this.checkboxArr.push('225');
            this.checkboxVal.push('Septic')
          }

          var n3 = this.servicesArr.includes("Storage/Shed w/out Utilities");
          if(n3){
            this.item.op3 = true;
            this.checkboxArr.push('100');
            this.checkboxVal.push('Storage/Shed w/out Utilities')
          }

          var n4 = this.servicesArr.includes("Storage/Shed withUtilities");
          if(n4){
            this.item.op4 = true;
            this.checkboxArr.push('100');
            this.checkboxVal.push('Storage/Shed withUtilities')
          }

          
          var n5 = this.servicesArr.includes("Barn w/out Utilities");
          if(n5){
            this.item.op5 = true;
            this.checkboxArr.push('100');
            this.checkboxVal.push('Barn w/out Utilities')
          }
          var n6 = this.servicesArr.includes("Outdoor Kitchen Appliances");
          if(n6){
            this.item.op6 = true;
            this.checkboxArr.push('50');
            this.checkboxVal.push('Outdoor Kitchen Appliances')
          }
          var n7 = this.servicesArr.includes("Guest House");
          if(n7){
            this.item.op7 = true;
            this.checkboxArr.push('250');
            this.checkboxVal.push('Guest House')
          }
          var n8 = this.servicesArr.includes("Workshop with Utilities");
          if(n8){
            this.item.op2 = true;
            this.checkboxArr.push('100');
            this.checkboxVal.push('Workshop with Utilities')
          }
          
          console.log(this.checkboxArr)
          console.log(this.checkboxVal)


          this.serviceCost = Number(this.item.packagePrice) - Number(this.item.additionalServiceCost);
          this.additionalServicesCost = this.item.additionalServiceCost;
          
          //this.onEditView = '';
          this.itemNotes.bookingId = id;
          
          this.showDuration = this.item.duration;
          /*var dur = this.item.inspectionEndTime.split(':');
          var dur2 =  this.item.inspectionTime.split(':');
          var current_dur = Number(dur[0]) - Number(dur2[0]);
          console.log(current_dur)
          if(dur[1] == '30'){
            this.item.duration = current_dur+':30';
          }else{
            this.item.duration = current_dur+':0';
          }*/

          var dur11 = this.item.duration.split('.');
          if(dur11[1] == '5'){
            this.item.duration = dur11[0]+':30';
          }else{
            this.item.duration = dur11[0]+':0';
          }



          

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
          });

          var mo = this.item.inspectionTime.split(':');
          if(Number(mo[0]) > 11){
            var timepar = 'PM';
          }else{
            var timepar = 'AM';
          }
          //this.modifiedTime = mo[0]+':'+mo[1]+' '+timepar;
          this.modifiedTime = this.parseFromTwentyFourToAmPm(this.item.inspectionTime);
          /*if(this.item.inspectionTime == '09:00:00'){
            this.modifiedTime = '09:00 AM';
          }else{
            this.modifiedTime = '02:00 PM';
          }*/

          this.itemEmail.to = this.item.email;
          this.itemEmail.salutation = 'Hello '+this.item.firstName+' '+this.item.lastName;
          
          this.bsubscribe = this.item.buyerSubscribe;
          this.basubscribe =  this.item.buyerAgentSubscribe;
          this.sasubscribe = this.item.sellerAgentSubscribe;

          this.formGroup.patchValue({address:this.item.address,
            squarefeet:this.item.squareFeet,
            yearbuilt: this.item.yearBuilt,
            inspectiontype: this.item.inspectionType,
            inspectiontime: this.item.inspectionTime,
            reinspection: this.item.reinspection,
            city: this.item.city,
            state: this.item.state,
            packagePrice: this.item.packagePrice,
            packagename: this.item.packageName,
            reportreview: this.item.reportreView,
            zipcode: this.item.zipcode,
            startTime: this.item.inspectionTime,
            duration: this.item.duration
          });
          this.formGroup.updateValueAndValidity();
          //this.getDashboardData(this.availableUpdate,'')
          this.oneditPage(this.availableUpdate);
        });
        //this.getDateWiseOfficer(this.item.inspectionDate);

        

      }else{
        this.inspectionDate = this.calendar.getToday();
        this.startDateMonth = ''; 
        this.saveLabel = 'Save';
        this.item.inspectionDate = this.inspectionDate.year+"-"+('0'+this.inspectionDate.month).slice(-2)+"-"+('0'+this.inspectionDate.day).slice(-2);
        //this.blockBookingSlots(this.item.inspectionDate);
        this.addUpdateLabel = 'Create';
        //this.getDateWiseOfficer(this.currentTodayDate);
        this.loadcal = true;
        this.item.reinspection = 'No';
        this.item.bookingType = 'Admin';
        this.reinspectionPrice = '175';
        this.getDashboardData(this.currentTodayDate,'');
      }
    });

    
  }

  get f() { 
    return this.formGroup.controls; 
  }

  get f1() { 
    return this.notesformGroup.controls; 
  }

  get f2(){
    return this.agentformGroup.controls; 
  }

  get f3(){
    return this.emailformGroup.controls; 
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
      sellerAgentName: new FormControl(''),
      sellerAgentPhone:new FormControl(''),
      sellerAgentEmail:new FormControl('',Validators.email),
      packagename: new FormControl('',Validators.required),
      reportreview: new FormControl('',Validators.required),
      inspectiontime: new FormControl('',Validators.required),
      additionalServices: new FormControl(''),
      packagePrice: new FormControl('',Validators.required),
      buildingType: new FormControl(''),
      dwelling:new FormControl(''),
      stories: new FormControl(''),
      rooms: new FormControl(''),
      bedrooms: new FormControl(''),
      bathrooms: new FormControl(''),
      comments: new FormControl(''),
      reinspection: new FormControl(''),
      reinspectionComments: new FormControl(''),
      op1: new FormControl(''),
      op2: new FormControl(''),
      op3: new FormControl(''),
      op4: new FormControl(''),
      op5: new FormControl(''),
      op6: new FormControl(''),
      op7: new FormControl(''),
      op8: new FormControl(''),
      duration: new FormControl('',Validators.required),
    });

    this.notesformGroup = new FormGroup({
      notes: new FormControl('',Validators.required)
    });

    this.agentformGroup = new FormGroup({
      name: new FormControl('',Validators.required),
      license: new FormControl('',Validators.required),
      phone: new FormControl('',Validators.required),
      email: new FormControl('',Validators.required),
      address: new FormControl(''),
      companyName: new FormControl(''),
      notes: new FormControl('')
    });

    this.emailformGroup = new FormGroup({
      to: new FormControl('',Validators.required),
      cc:new FormControl(''),
      bcc:new FormControl(''),
      subject: new FormControl('',Validators.required),
      message: new FormControl('',Validators.required),
      salutation: new FormControl('',Validators.required),
      address: new FormControl(''),
      time: new FormControl(''),
      fee: new FormControl(''),
      duration: new FormControl(''),
      includeLink: new FormControl(''),
      inspectorName: new FormControl(''),
      inspectorLicense: new FormControl(''),
      consultationTime:  new FormControl('')
    });
  }

  tabon(type: string){
    this.alltabs.forEach((element:any) => {
      (this as any)[element] =  false;
    });
    (this as any)[type] = true;
    
    if(this.item.id && type == 'tabdatetime'){
      //this.getDashboardData(this.availableUpdate);
      this.gotoAvailableDate(this.availableUpdate);
    }
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

    filtersearchseller = (text$: any) =>
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

  selectAgent(event:any){
    if(event.name){
      this.item.agentName = event.name;
      this.item.agentEmail = event.email;
      this.item.agentPhone = event.phone;
    }
  }

  selectSellerAgent(event:any){
    if(event.name){
      this.item.sellerAgentName = event.name;
      this.item.sellerAgentEmail = event.email;
      this.item.sellerAgentPhone = event.phone;
    }
  }

  onSelectionChanged = (event: any) => {
    
  }

  onContentChanged = (event: any) => {
    
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
    this.calculateFinalPrice('calculate')
  }

  changeDate(event: any){
    //console.log(event);
    this.item.inspectionDate = event.year+"-"+('0'+event.month).slice(-2)+"-"+('0'+event.day).slice(-2);
    
    this.startDateMonth = { year :Number(event.year),month: Number(event.month)}
    const obj: NgbDateStruct =  { year: Number(event.year), month: Number(event.month), day: Number(event.day) }
    this.inspectionDate = obj;

    this.item.duration = '';
    //this.getDateWiseOfficer(this.item.inspectionDate);
    
    var month = '';
    var day = '';
    if(event.month < 10){
      month = '0'+event.month;
    }else{
      month = String(event.month);
    }
    if(event.day < 10){
      day = '0'+event.day;
    }else{
      day = String(event.day);
    }
    var selectedDate = event.year+'-'+month+'-'+day;
    console.log(selectedDate)
    this.getDashboardData(selectedDate,'changedate');
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(selectedDate);

    
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

  squareFeetChange(event:any){
    this.calculateFinalPrice('calculate');
  }

  yearBuiltChange(event:any){
    this.calculateFinalPrice('calculate');
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
          console.log(this.item.packagePrice)
          this.updatedPrice = this.item.packagePrice;
          this.item.packagePrice = Number(this.item.additionalServiceCost)+ Number(this.squarefeetPrice) + Number(this.yearBuiltPrice);
          if(Number(this.updatedPrice) != Number(this.item.packagePrice)){
            this.item.packagePrice = this.updatedPrice;
          }
          console.log(this.item.packagePrice);
          this.save();
        }else{
          this.item.packagePrice = Number(this.item.packagePrice) + Number(this.item.additionalServiceCost)+ Number(this.squarefeetPrice) + Number(this.yearBuiltPrice);
        }
      });
    }
  }
  
  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  showErrorToast(msg:string){
    swal.fire({ showConfirmButton: false, timer: 2000, title: 'Error!', text: msg, icon: 'error', });
  }

  public backToList(){
    this.router.navigate(['/bookings']);
  }

  getExtracPrice(event: any){
  
    if(!this.item.firstName){
      this.alertService.error('Please enter first name','');
      return;
    }
    if(!this.item.lastName){
      this.alertService.error('Please enter last name','');
      return;
    }
    if(!this.item.email){
      this.alertService.error('Please enter email','');
      return;
    }
    if(!this.item.phone){
      this.alertService.error('Please enter phone number','');
      return;
    }
    if(!this.item.address){
      this.alertService.error('Please enter inspection address','');
      return;
    }
    if(!this.item.city){
      this.alertService.error('Please enter your city','');
      return;
    }
    if(!this.item.state){
      this.alertService.error('Please enter your state','');
      return;
    }
    if(!this.item.zipcode){
      this.alertService.error('Please enter your zipcode','');
      return;
    }
    if(!this.item.squareFeet){
      this.alertService.error('Please enter square footage','');
      return;
    }
    if(!this.item.yearBuilt){
      this.alertService.error('Please enter year built','');
      return;
    }
    if(!this.item.inspectionTime){
      this.alertService.error('Please select inspection time','');
      return;
    }
    if(!this.item.duration){
      this.alertService.error('Please select duration','');
      return;
    }
    if(!this.item.inspectionType){
      this.alertService.error('Please select inspection type','');
      return;
    }
    if(!this.item.packageName){
      this.alertService.error('Please select package','');
      return;
    }
    if(!this.item.reportreView){
      this.alertService.error('Please select your report review','');
      return;
    }

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

    if(this.ontheflyInspectorID == 0){
      alert('Inspector not assigned yet')
      return;
    }


    if(this.item.reinspection == 'Yes' && this.checkReInspe == '0'){
      this.saveReinspection();
    }else{
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

      if(!this.item.sellerAgentName){
        this.item.sellerAgentName = this.invName1;
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
  }

  save(){
    //this.item.bookingType = 'Admin';
    
    var duration = this.item.duration.split(':');
    if(duration[1]=='0'){
      this.item.duration = duration[0];
    }else{
      this.item.duration = duration[0]+'.5';
    }
    this.updatedPrice = 0;

    console.log(this.item);

    if (this.item.id) {
      this.bookingService.update(this.globals.updateBookingv2,this.item).then((response) => {
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
      this.bookingService.create(this.globals.saveBookingv2,this.item).then((response) => {
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

  saveNotes(event: any){
    console.log(this.notesformGroup)
    //this.notesubmitted = true;
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
    this.router.navigate(['/bookings/update/'+id]);
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
          obj.data[y].push(element.createdDate);
          y = y+1;
        }); 
        let dataTable = new DataTable("#dataTableExample", {
          data: obj,
        });  
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

  saveAgent(event: any){
    console.log(this.agentformGroup)
    this.agentSubmitted = true;
    this.agentformGroup.markAllAsTouched();
    if (this.agentformGroup.invalid) {
      return;
    }

    if (this.itemAgent.id) {
      
    } else{
      this.bookingService.create(this.globals.saveAgent,this.itemAgent).then((response) => {
        this.showToast('Agent Saved Successfully');
        this.closePopup();
      },
        (rejected: RejectedResponse) => {
          this.itemAgent.id = '';
          this.alertService.error('There is something wrong',this.options);
          //this.alertService.BindServerErrors(this.formGroup, rejected);
        }
      );
    }
  }

  openAgentPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }
  
  closePopup(){
    this.modalReference.close();
    this.formGroup.reset();
    this.agentformGroup.reset();
  }

  sendEmail(event:any){
    this.emailSubmitted = true;
    this.emailformGroup.markAllAsTouched();
    if (this.emailformGroup.invalid) {
      return;
    }
    this.bookingService.create(this.globals.sendConfirmationEmail,this.itemEmail).then((response) => {
      this.showToast('Email send Successfully');
    },
      (rejected: RejectedResponse) => {
        this.alertService.error('There is something wrong',this.options);
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

  subjectChange(event:any){
    const info = this.templateData.find((x: any) => x.id == event.target.value);
    this.itemEmail.message = info.body;
    this.itemEmail.templateId = event.target.value;
    this.itemEmail.bookingId = this.item.id;
  }

  changeBuildingType(event:any){
    this.item.buildingType = event.target.value;
  }

  changeNewTime(event:any){
    this.item.inspectionTime = event.target.value;
    this.modifiedTime = this.parseFromTwentyFourToAmPm(this.item.inspectionTime);
    this.item.duration = '';
  }

  changeDuration(event:any){
    console.log(this.item.inspectionTime)
    if(!this.item.inspectionTime){
      this.item.duration = '';
      alert('Please select start time');
      return;
    }
    let splitduration = event.target.value.split(':');
    if(splitduration[1] == 0){
      this.item.duration = event.target.value;
      var hrtobeadded:number = splitduration[0]-1;
      var minutes = '59';
      var finalminutes = '00';
    }else{
      this.item.duration = event.target.value;
      var hrtobeadded:number = Number(splitduration[0]);
      var minutes:string = '30';
      var finalminutes = '30';
    }
    
    const splitedtime = this.item.inspectionTime.split(':');
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
    var finalendtime = finalhr+':'+minutes+':00';
    this.item.inspectionEndTime = dfinalhr+':'+finalminutes+':00';
    console.log('database-'+this.item.inspectionEndTime);
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
    });
  }

  getDateWiseOfficer(date: any){
    this.bookingService.get(this.globals.dashboardBookingList+'?date='+date).then((response:any)=>{
      this.allofficerData = response.response;
    })
  }

  formatDateTime(time: any){
    var timesplit = time.split(':');
    let timemain: number = 0;
    if(Number(timesplit[0]) > 11){
      var timesec = "PM";
      timemain = Number(timesplit[0]) - 12;
    }else{
      timemain = timesplit[0];
      var timesec = "AM";
    }
    return timemain+':'+timesplit[1]+' '+timesec;
  }

  private BindMasterCalendarhData(date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.bookingService.get(this.globals.dashboardBookingList+'?date='+date),
        this.bookingService.get(this.globals.getBlockOffList+'?date='+date),
        this.inspectorService.get(this.globals.getInspectorList)
      ]).then(function (response: any) {
        current.bookingData = response[0].response;
        current.blockOffData = response[1].data;
        current.inspectorData = response[2].data;
        var i = 0;
        current.inspectorData.forEach((element :any) => {
          if(element.status == 'Active'){
            current.resources[i] = {
              id: element.id,
              title: element.firstName+ ' '+element.lastName
            }
            i = i +1;
          }
        });
        resolve();
      });
    });
  }

  getDashboardData(currentTodayDate: string,changedate: string){
    this.BindMasterCalendarhData(currentTodayDate).then(() => {
      console.log(this.bookingData)
      console.log(this.inspectorData)
      this.Events = [];
      this.bookingData.forEach((element: any,index:any) => {

        let backcolorinfo = this.inspectorData.filter((x:any) => x.id == element.officerId);

        /*if(element.inspectionTime == '09:00:00'){
          var endtime = element.inspectionDate+'T13:00:00';
        }else{
          var endtime = element.inspectionDate+'T18:00:00';
        }*/
        let arr: any = [];
        
        arr.id = element.id;
        arr.start = element.inspectionDate+'T'+element.inspectionTime;
        arr.end = element.inspectionDate+'T'+element.inspectionEndTime;
        arr.backgroundColor = '#A49A9A';
        
        // arr.title = '<div class="mcontent" id="ctm'+element.id+'">&nbsp;<span class="eventbox"><span class="'+contractclass+'">C</span>&nbsp;<span class="'+contractclass+'">$</span></span>&nbsp;'+element.address+'</div><div class="iconcontent">'+iconcontent+'</div></div>';
        arr.title = '<div class="mcontent">Booked</div>';
        arr.borderColor = '#797878';
        arr.resourceId = element.officerId;
        arr.textEscape = false;

        this.Events.push(arr);
      });

      this.blockOffData.forEach((element: any,index:any) => {
        let arr2:any = [];
        arr2.id = 'O-'+element.id;
        arr2.start = element.startDate+'T'+element.startTime;
        arr2.end = element.endDate+'T'+element.endTime;
        
        arr2.backgroundColor =  '#A49A9A';
        arr2.title = '<div class="mcontent">Booked</div>';
        arr2.borderColor = '#797878';
        arr2.resourceId = element.inspectorId;
        arr2.textEscape = false;
        this.Events.push(arr2);
      });
      
      
      console.log(this.Events);
      this.calendarOptions.events = this.Events;
      this.calendarOptions.resources = this.resources;
      //this.setEvents(this.Events);
      
      if(this.item.id && changedate == 'changedate'){
        //this.gotoAvailableDate(this.availableUpdate);
      }

    });
  }
  
  gotoAvailableDate(date: string){
    //alert(date);
    this.loadcal = true;
    console.log(date);
    //this.getDashboardData(date);
    setTimeout(() => {
      let calendarApi = this.calendarComponent.getApi();
      calendarApi.gotoDate(date);
    },2000);
    
  }

  oneditPage(selectedDate:string){
    this.getDashboardData(selectedDate,'changedate');
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(selectedDate);
  }

  changeReInspection(event: any){
    console.log(event.target.value);
    console.log(event.value); 
    if(event.target.value == 'Yes'){
      this.isReinspecData = true;
    } else {
      this.isReinspecData = false;
      this.item.reinspectionComments = '';
    }
  }

  changeRePrice(event:any){
    this.reinspectionPrice = event.target.value;
  }

  saveReinspection(){

    this.item.additionalServiceCost = 0;
    this.item.additionalServices = '';
    if(!this.item.agentName){
      this.item.agentName = this.invName;
    }
    
    if(this.item.officerId == ''){
      this.showErrorToast('Inpsector Not Available');
      //button.removeAttribute('disabled');
      return;
    }
    this.item.id = '';
    this.item.calculatedPrice = Number(this.reinspectionPrice);
    this.item.packagePrice =  Number(this.reinspectionPrice);
    this.item.bookingType = 'Admin';
    
    var duration = this.item.duration.split(':');
    if(duration[1]=='0'){
      this.item.duration = duration[0];
    }else{
      this.item.duration = duration[0]+'.5';
    }
    this.updatedPrice = 0;

    console.log(this.item);
    this.bookingService.create(this.globals.reinspectionAPIV2,this.item).then((response) => {
      this.showToast('Re-Inspection Added Successfully');
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

  public parseFromTwentyFourToAmPm(time: string): string {
    const H1 = time.split(':');
    const H = Number(H1[0]);
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "AM" : "PM";
    time = h + ':' + H1[1] + ' ' + ampm;
    return time;
  }

  changeDurationNew(event:any){
    console.log(this.item.inspectionTime)
    if(!this.item.inspectionTime){
      this.item.duration = '';
      alert('Please select start time');
      return;
    }

    this.item.duration = event.target.value;
    let splitduration = event.target.value.split(':');
    
    if(splitduration[1] == 0){
      var minutes = '00';
    }else{
      var minutes:string = '30';
    }

    var calendtime = splitduration[0]+':'+minutes+':00';
    const totaltime = this.addTimes(this.item.inspectionTime,calendtime);
    this.item.inspectionEndTime = totaltime;

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

    if(this.item.id){
      var bkid = this.item.id;
    }else{
      var bkid = '0';
    }

    this.bookingService.get(this.globals.blockSlotAPIv2+'?date='+this.item.inspectionDate+'&time='+this.item.inspectionTime+'&lat='+this.item.latitude+'&long='+this.item.longitude+'&endtime='+modifiedendtime+'&bookingId='+bkid).then((response:any) => {
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

  trackorder(){
    this.router.navigate(['/bookings/track/'+this.item.id]);
  }

  sendForm(){
    this.bookingService.get(this.globals.sendFormPetUtility+'/?id='+this.item.id).then((response) => {
      this.showToast('Pet/Utility Form Email send Successfully');
      this.backToEditList(this.item.id);
    },
      (rejected: RejectedResponse) => {
        this.item.id = '';
        this.alertService.error('There is something wrong',this.options);
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

}
