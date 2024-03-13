import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import { ResourceInput } from '@fullcalendar/resource-common';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from '../../bookings/booking.service';
import { InspectorService } from '../../inspectors/inspector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConstants } from '../../../../global-constants';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent implements OnInit {

  @ViewChild('fc') calendarComponent: FullCalendarComponent;
  
  resources: ResourceInput[] = [];
  Events: any[] = [];
  inspectorData: any;
  bookingData: any;
  currentTodayDate = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
  currentDynamicDate: string;

  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimelineWeek',
    headerToolbar: {
      left: '',
      center: 'title',
      right: ''
    },
    resourceAreaColumns: [
      {
        field: 'title',
        headerContent: 'Inspectors',
      }
    ],
    hiddenDays: [ 0 ],
    resourceAreaWidth: 200,
    slotMinTime: "07:00:00",
    slotMaxTime: "20:00:00",
    contentHeight: 300,
    height: 450,
    eventContent: function( info ) {
      return {html: info.event.title};
    },  
    eventDidMount: function(info) {
      info.el.style.borderWidth = '3px';
    },
    resourceLabelDidMount: this.labelColor.bind(this),
    /*resourceAreaColumns: [
      {
        field: 'title',
        headerContent: 'Inspectors',
      }
    ],*/
    nowIndicator: false,
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: false,
    dayMaxEvents: false,
    eventClick: this.handleEventClick.bind(this)
    
    //select: this.handleDateSelect.bind(this),
    //eventClick: this.handleEventClick.bind(this),
    //eventsSet: this.handleEvents.bind(this),
    //datesSet: this.handleDateChanged.bind(this)
   
  };

  constructor(private calendar: NgbCalendar,
    private bookingService: BookingService,
    private inspectorService: InspectorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public globals: GlobalConstants) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params:any) => {
      var getid = params["date"].split("-");
      this.currentDynamicDate = params['date'];
      if (getid) {
        console.log(getid)
        //this.calendarOptions.initialDate = this.currentDynamicDate;
        
      }
      //this.currentDate = {year: getid[0],month: getid[1],day: getid[2]}
      //this.monthFirstDate = new Date(this.dateObj.getFullYear(), this.dateObj.getMonth(), 1);
      //this.monthLastDate = new Date(this.dateObj.getFullYear(), this.dateObj.getMonth() + 1, 0);
    });
    this.BindMaster();
  }

  private BindMaster(): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.inspectorService.get(this.globals.getInspectorList)
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
      this.bookingData.forEach((element: any) => {

        let backcolorinfo = this.inspectorData.filter((x:any) => x.id == element.officerId);

        if(element.inspectionTime == '09:00:00'){
          var endtime = element.inspectionDate+'T13:30:00';
        }else{
          var endtime = element.inspectionDate+'T18:30:00';
        }
        let arr: any = [];
        arr.id = element.id;
        arr.start = element.inspectionDate+'T'+element.inspectionTime;
        arr.end = endtime; //element.inspectionDate+'T09:00:00';
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
        arr.title = '<div class="mcontent">&nbsp;<span class="eventbox"><span class="'+contractclass+'">C</span>&nbsp;<span class="'+contractclass+'">$</span></span>&nbsp;'+element.address+'</div><div class="iconcontent">'+iconcontent+'</div>';
       
        arr.borderColor = backcolorinfo[0].colorCode; //'#0168fa';
        arr.resourceId = element.officerId;
        arr.textEscape = false;
        this.Events.push(arr);
      });
      
      console.log(this.Events);
      this.calendarOptions.events = this.Events;
      this.calendarOptions.resources = this.resources;
      let calendarApi = this.calendarComponent.getApi();
      calendarApi.gotoDate(this.currentDynamicDate);
      //this.setEvents(this.Events);
    });
  }

  private BindMasterAllSearchData(date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.bookingService.get(this.globals.dashboardWeekBookingList+'?date='+date),
      ]).then(function (response: any) {
        current.bookingData = response[0].response;
        resolve();
      });
    });
  }

  labelColor(info:any){
    let backcolorinfo = this.inspectorData.filter((x:any) => x.id == info.resource.id);
    info.el.style.color = backcolorinfo[0].colorCode;
    info.el.style.fontWeight = 'bold';      
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log('444');
    console.log(clickInfo.event);
    console.log(clickInfo.event['_def'].publicId)

    var bookingId = clickInfo.event['_def'].publicId;
    this.router.navigate(['/bookings/update/'+bookingId]);
  }

}
