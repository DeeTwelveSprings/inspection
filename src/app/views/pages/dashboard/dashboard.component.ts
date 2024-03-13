import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { NgbDateStruct, NgbCalendar, NgbDate, NgbModalRef, NgbModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from '../bookings/booking.service';
import { GlobalConstants } from '../../../global-constants';
import { InspectorService } from '../inspectors/inspector.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { DOCUMENT, formatDate } from "@angular/common";

import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, FullCalendarComponent, Calendar } from '@fullcalendar/angular';
import { ResourceInput } from '@fullcalendar/resource-common';
import { throws } from 'assert';
import { ActivatedRoute } from '@angular/router';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  preserveWhitespaces: true
})
export class DashboardComponent implements OnInit,OnDestroy  {

  @ViewChild('fc') calendarComponent: FullCalendarComponent;
  @ViewChild(MapInfoWindow, { static: false }) info!: MapInfoWindow
  @ViewChild(NgbDropdown, { static: true })  public dropdown: NgbDropdown

  modalReference: NgbModalRef;
  resources: ResourceInput[] = [];
  currentEvents: EventApi[] = [];
  calendarInst?: Calendar;
  Events: any[] = [];
  bookingData: any;
  infoContent: string;
  sidebarCounts: any = [];
  blockOffData: any;

  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimelineDay',
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'resourceTimelineDay'
    },
    views: {
      resourceTimelineDay: {
        title: 'dddd, MMMM Do YYYY'
      }
    },
    resourceAreaWidth: 200,
    slotMinTime: "07:00:00",
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
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    datesSet: this.handleDateChanged.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this),
    resourceLabelDidMount: this.labelColor.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };

  currentDate: NgbDateStruct;
  totalInspector: number = 0;
  totalBookings: number = 0;
  todayBooking: number = 0;
  thisweekBooking: number = 0;
  thismonthBooking: number = 0;
  workorderToday: number = 0;
  workorderWeek: number = 0;
  availableslots:number = 0;

  inspectorData: any;
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  filterData: any = [];
  public columns: Array<object>;
  TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
  currentTodayDate = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
  todayCheck: number = 0;

  currentDynamicDate = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

  @ViewChild("fc") fc: NgbCalendar;
  @ViewChild('basicModal') basicModal: any;

  center: google.maps.LatLngLiteral = {
    lat: 32.779167,
    lng: -96.808891
  };
  zoom = 8;
  display: any;
  mapMarkers: any = [];
  map: google.maps.Map;
  
  constructor(private calendar: NgbCalendar,
    private bookingService: BookingService,
    private inspectorService: InspectorService,
    private modalService: NgbModal,
    private router: Router,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    public globals: GlobalConstants) {}

  ngOnInit(): void {
    this.currentDate = this.calendar.getToday();
    this.BindMaster();
  }

  ngOnDestroy():void{
    const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
    contextMenu.style.display = 'none';
    const contextMenuOff = (<HTMLInputElement>document.getElementById('contextMenuOff'));
    contextMenuOff.style.display = 'none';
  }
  
  private BindMaster(): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.inspectorService.get(this.globals.getInspectorList),
        this.bookingService.get(this.globals.getDashboard)
      ]).then(function (response: any) {
        console.log(response)
        current.inspectorData = response[0].data;
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
        current.totalInspector = response[1].officerCount;
        current.totalBookings = response[1].bookingCount;
        current.todayBooking = response[1].todaybooking;
        current.workorderToday = response[1].todayworkorder;
        current.workorderWeek = response[1].thisweekbooking;
        current.availableslots = response[1].availableSlots;
        localStorage.setItem('alert',response[1].alertCounts);
        localStorage.setItem('pending',response[1].pendingCount);
        localStorage.setItem('website',response[1].websiteCount);
        current.sidebarCounts.alertCount = response[1].alertCounts;
        current.sidebarCounts.pendingCount = response[1].pendingCount;
        current.sidebarCounts.websiteCount = response[1].websiteCount;
        current.inspectorService.alertCount.next(current.sidebarCounts);
        current.getDashboardData(current.currentTodayDate)
        resolve();
      });
    });
  }

  getDashboardData(currentTodayDate: string){
    this.BindMasterAllSearchData(currentTodayDate).then(() => {
      console.log(this.bookingData)
      console.log(this.inspectorData)
      this.Events = [];
      this.mapMarkers = [];
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
        if(element.paymentStatus == 'PAID'){
          arr.backgroundColor = '#e0f6f6';
          var contractclass = "eventContract1";
        }else{
          arr.backgroundColor =  'rgba(1,104,250, .15)';
          var contractclass = "eventContract2"
        }
        if(element.reportreview == 'In Person Day of Inspection'){
          var iconcontent = '<i class="feather icon-user"></i>';
        }else{
          var iconcontent = '<i class="feather icon-phone"></i>';
        }
        arr.title = '<div class="mcontent" id="ctm'+element.id+'">&nbsp;<span class="eventbox"><span class="'+contractclass+'">C</span>&nbsp;<span class="'+contractclass+'">$</span></span>&nbsp;'+element.address+'</div><div class="iconcontent">'+iconcontent+'</div></div>';
       
        arr.borderColor = backcolorinfo[0].colorCode; //'#0168fa';
        arr.resourceId = element.officerId;
        arr.textEscape = false;
        this.addMarker(element.latitude,element.longitude,element.address);
        
        this.Events.push(arr);
      });

      this.blockOffData.forEach((element: any,index:any) => {
        let arr2:any = [];
        arr2.id = 'O-'+element.id;
        arr2.start = element.startDate+'T'+element.startTime;
        arr2.end = element.endDate+'T'+element.endTime;
        
        arr2.backgroundColor =  '#A49A9A';
        arr2.title = '<div class="mcontent" id="res'+element.id+'">Off</div>';
        arr2.borderColor = '#797878';
        arr2.resourceId = element.inspectorId;
        arr2.textEscape = false;
        this.Events.push(arr2);
      });
      
      
      console.log(this.Events);
      this.calendarOptions.events = this.Events;
      this.calendarOptions.resources = this.resources;
      //this.setEvents(this.Events);
    });
  }

  private BindMasterAllSearchData(date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.bookingService.get(this.globals.dashboardBookingList+'?date='+date),
        this.bookingService.get(this.globals.getBlockOffList+'?date='+date)
      ]).then(function (response: any) {
        current.bookingData = response[0].response;
        current.blockOffData = response[1].data;
        resolve();
      });
    });
  }

  

  /*getTodayData(event: any){
    console.log(event.target.value);
    if(event.target.value != '--'){
      var id = event.target.value;
    }else{
      var id = null;
    }
    this.filterData = [];
    this.inspectorService.get(this.globals.dashboardFilter+'?id='+id).then((Response: any) => {
      Response.response.forEach((element:any) => {
        if(element.inspectionTime == '09:00:00'){
          element.inspectionTimeChange = '09:00 am';
        }else{
          element.inspectionTimeChange = '02:00 pm';
        }
        this.filterData.push(element);
      });
    });
  }*/

  handleCalendarToggle() {
    console.log('333');
    //this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    console.log('222');
    /*const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;*/
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log('111');
    /*const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        //id: createEventId(),
        resourceId: selectInfo.resource?.id,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }*/
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log('444');
    console.log(clickInfo.event);
    console.log(clickInfo.event['_def'].publicId);

    var chk = clickInfo.event['_def'].publicId.split('-');
    if(chk[0] == 'O'){
      return;
    }

    var bookingId = clickInfo.event['_def'].publicId;
    this.router.navigate(['/bookings/update/'+bookingId]);
    var id = clickInfo.event['_def'].publicId;
    let classinfo = 'show'+id;
    this.inspectorData.forEach((element:any) => {
      if(element.status == 'Active'){
        console.log(element);
        let vid = 'show'+element.id;
        //(<HTMLInputElement>document.getElementById(vid)).style.display = 'none';
      }
    });
    //<HTMLInputElement>document.getElementsByClassName('dropdown-menu')).style.display = 'none';
    //(<HTMLInputElement>document.getElementById(classinfo)).style.display = 'block';
    //thisdropdown.open();
    /*if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }*/
    //this.router.navigate(['/update/'+element.id])
  }

  handleEvents(events: any) {
    //this.currentEvents = events;
    
    
  }

  handleDateChanged(event: any){
    //const calendarApi = this.calendarComponent.getApi();
    //const currentDate = calendarApi.getDate();
    var curDate = this.formatDate(event.startStr);
    console.log(this.todayCheck)
    this.currentDynamicDate = curDate;
    if(curDate == this.currentTodayDate){
      if(this.todayCheck == 1){
        this.getDashboardData(curDate);
      }
    }else{
      //console.log("The current date of the calendar is " + this.formatDate(event.startStr));
      //console.log(event);
      this.getDashboardData(curDate);
      this.todayCheck = 1;
    }
    //calendarApi.gotoDate(selectedDate);
  }

  public formatDate(date: any){
    const format = 'yyyy-MM-dd';
    const locale = 'en-US';
    const formattedDate = formatDate(date, format, locale);
    return formattedDate;
  }

  onDateSelection(date: NgbDate) {
    console.log(date);
    var month = '';
    var day = '';
    if(date.month < 10){
      month = '0'+date.month;
    }else{
      month = String(date.month);
    }
    if(date.day < 10){
      day = '0'+date.day;
    }else{
      day = String(date.day);
    }
    var selectedDate = date.year+'-'+month+'-'+day;
    console.log(selectedDate)
    this.getDashboardData(selectedDate);
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(selectedDate);
  }

  openMap(){
    this.openPopup(this.basicModal);
  }

  openPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content,{size:'lg'});
  }

  
  moveMap(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  move(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  addMarker(latitude: any,longitude : any,title: string) {
    this.mapMarkers.push({
      position: {
        lat: Number(latitude),
        lng: Number(longitude),
      },
      label: {
        color: 'red',
        //text: 'Marker label ' + (this.mapMarkers.length + 1),
      },
      info: title,
      title: title,
      //options: { animation: google.maps.Animation.BOUNCE },
    });
    console.log(this.mapMarkers)
  }

  openInfo(marker: MapMarker, content: string) {
    this.infoContent = content;
    this.info.open(marker);
  }

  handleEventMouseEnter(e:any) {
    //alert('dd');
    console.log(e);
    const event = e.event,
      startdate = event.start,
      enddate = event.end ? event.end : null,
      
      header = document.createElement("header"),
      footer = document.createElement("footer");

    
    if (event.classNames.length) {
      const classes = event.classNames;
      if (classes.indexOf('hasattention') > -1) {
        let iconImage = new Image(20, 20);
        iconImage.src = '/assets/icons/jina-svg/exclamation-icon.svg';
        footer.appendChild(iconImage);
      }
      if (classes.indexOf('hasdescr') > -1) {
        let iconImage = new Image(20, 20);
        iconImage.src = '/assets/icons/jina-svg/star-icon.svg';
        footer.appendChild(iconImage);
      }
      if (classes.indexOf('hasfile') > -1) {
        let iconImage = new Image(20, 20);
        iconImage.src = '/assets/icons/jina-svg/file-icon.svg';
        footer.appendChild(iconImage);
      }
    }

    e.el.popover({
        animation:true,
        delay: 300,
        content: '<b>Inicio</b>:'+event.start+"<b>Fin</b>:"+event.end,
        trigger: 'hover'
    });
    /*new Tooltip(e.el, {
      delay: {
        show: 500,
        hide: 50
      },
      html: true,
      title: header.outerHTML + event.title + (event.extendedProps.location ? '<br><em>' + event.extendedProps.location + '</em>' : '') + footer.outerHTML,
      placement: 'right',
      trigger: 'hover',
      container: 'body'
    });*/
  }

  /*public onPopupOpen(args: PopupOpenEventArgs): void {
    const data: Record<string, any> = args.data as Record<string, any>;
    if (args.type === 'QuickInfo' || args.type === 'Editor' || args.type === 'RecurrenceAlert' || args.type === 'DeleteAlert') {
      const target: HTMLElement = (args.type === 'RecurrenceAlert' ||
        args.type === 'DeleteAlert') ? args.element[0] : args.target;
      if (!isNullOrUndefined(target) && target.classList.contains('e-work-cells')) {
        if ((target.classList.contains('e-read-only-cells')) ||
          (!this.scheduleObj.isSlotAvailable(data))) {
          args.cancel = true;
        }
      } else if (!isNullOrUndefined(target) && target.classList.contains('e-appointment') &&
        (this.isReadOnly(data.EndTime as Date))) {
        args.cancel = true;
      }
    }
  }*/

  gotoMonth(){
    this.router.navigate(['/dashboard/monthview/'+this.currentDynamicDate]);
  }

  gotoWeek(){
    this.router.navigate(['/dashboard/weekview/'+this.currentDynamicDate]);
  }

  labelColor(info:any){
    let backcolorinfo = this.inspectorData.filter((x:any) => x.id == info.resource.id);
    info.el.style.color = backcolorinfo[0].colorCode;
    info.el.style.fontWeight = 'bold';      
  }
  
  handleEventDidMount(info:any) {
    info.el.style.borderWidth = '3px';
    
    
    info.el.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      
      
      const element = e.target as HTMLElement;
      let mainid = info.event._def.publicId;
      
      if(mainid.split('-')[0] == 'O'){
        let blockoffid  = mainid.split('-')[1];

        let ext = 'res'+mainid.split('-')[1];
        const ctmnu1 = (<HTMLInputElement>document.getElementById(ext));
        console.log(ctmnu1.offsetTop);

        const contextMenu = (<HTMLInputElement>document.getElementById('contextMenuOff'));
        contextMenu.style.display = 'block';
        contextMenu.style.left = (e.pageX) + 'px';
        contextMenu.style.top = (e.pageY) + 'px';
        contextMenu.setAttribute('data-id',blockoffid);

      }else{

        let ext = 'ctm'+mainid;
        const ctmnu = (<HTMLInputElement>document.getElementById(ext));
        console.log(ctmnu.offsetTop);

        const contextMenu = (<HTMLInputElement>document.getElementById('contextMenu'));
        var rectangle = element.getBoundingClientRect();
    
        contextMenu.style.display = 'block';
        contextMenu.style.left = (e.pageX) + 'px';
        contextMenu.style.top = (e.pageY) + 'px';
        contextMenu.setAttribute('data-id',mainid);

        const action1 = contextMenu.querySelector('#workorder');
      }
    });

    

    
    /*info.el.addEventListener("contextmenu",  (event:any) => {
      event.preventDefault();
      //ID of the event - will be needed for setting the state later on
      console.log("eventDidMount", info.event.id);
      //(<HTMLInputElement>document.getElementById('contextMenu')).style.display = 'block';
     
      //this.contextMenu.contextMenuData = event; // Pass event data to the context menu
     // this.contextMenu.show.next({ event });

      return false;
    }, false);*/
  }

  
}
