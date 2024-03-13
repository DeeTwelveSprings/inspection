import { Component, OnInit, ViewChild } from '@angular/core';

import { NgbDateStruct, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from '../../bookings/booking.service';
import { GlobalConstants } from '../../../../global-constants';
import { InspectorService } from '../../inspectors/inspector.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { formatDate } from "@angular/common";

import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, FullCalendarComponent, Calendar } from '@fullcalendar/angular';
import { ResourceInput } from '@fullcalendar/resource-common';
import { throws } from 'assert';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {

  @ViewChild('fc') calendarComponent: FullCalendarComponent;
  
  resources: ResourceInput[] = [];
  currentEvents: EventApi[] = [];
  calendarInst?: Calendar;
  Events: any[] = [];
  bookingData: any;
  inspectorData: any;
  currentTodayDate = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

  monthFirstDate: any;
  monthLastDate: any;
  dateObj = new Date();


  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: '',
      center: 'title',
      right: 'today'
    },
    initialView: 'dayGridMonth',
    //initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    //select: this.handleDateSelect.bind(this),
    //eventClick: this.handleEventClick.bind(this),
    //eventsSet: this.handleEvents.bind(this)
    
  };

  currentDate: NgbDateStruct;
  currentDynamicDate: string;

  constructor(private calendar: NgbCalendar,
    private bookingService: BookingService,
    private inspectorService: InspectorService,
    private activatedRoute: ActivatedRoute,
    public globals: GlobalConstants) { }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe((params) => {
      var getid = params["date"].split("-");
      this.currentDynamicDate = params['date'];
      if (getid) {
        console.log(getid)
        this.calendarOptions.initialDate = this.currentDynamicDate;
      }
      this.currentDate = {year: getid[0],month: getid[1],day: getid[2]}
      this.monthFirstDate = new Date(this.dateObj.getFullYear(), this.dateObj.getMonth(), 1);
      this.monthLastDate = new Date(this.dateObj.getFullYear(), this.dateObj.getMonth() + 1, 0);
    });

    ////this.currentDate = this.calendar.getToday();
    //console.log(this.currentDate)
  
    this.BindMaster();
  }

  getDatesInRange(startDate: any, endDate: any) {
    const date = new Date(startDate.getTime());
  
    // ✅ Exclude start date
    date.setDate(date.getDate() + 1);
  
    const dates = [];
    dates.push(startDate);
    // ✅ Exclude end date
    while (date < endDate) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    dates.push(endDate);
  
    return dates;
  }
  
  public formatDate(date: any){
    const format = 'EE MMMM d';
    const locale = 'en-US';
    const formattedDate = formatDate(date, format, locale);
    return formattedDate;
  }

  private BindMaster(): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.inspectorService.get(this.globals.getInspectorList),
      ]).then(function (response: any) {
        console.log(response)
        current.inspectorData = response[0].data;
        /*var i = 0;
        current.inspectorData.forEach((element :any) => {
          current.resources[i] = {
            id: element.id,
            title: element.firstName+ ' '+element.lastName
          }
          i = i +1;
        });*/
        current.getDashboardData(current.currentDynamicDate)
        resolve();
      });
    });
  }

  getDashboardData(currentTodayDate: string){
    this.BindMasterAllSearchData(currentTodayDate).then(() => {
      console.log(this.bookingData)
      ///console.log(this.inspectorData)
      this.Events = [];
      this.bookingData.forEach((element: any) => {
        console.log(element)
        /*if(element.inspectionTime == '09:00:00'){
          var endtime = element.inspectionDate+'T13:30:00';
        }else{
          var endtime = element.inspectionDate+'T18:30:00';
        }*/
        let arr: any = [];
        arr.id = element.id;
        arr.start = element.inspectionDate+'T'+element.inspectionTime;
        arr.end = element.inspectionDate+'T'+element.inspectionEndTime;; //element.inspectionDate+'T09:00:00';
        if(element.paymentStatus == 'PAID'){
          arr.backgroundColor = '#e0f6f6';
        }else{
          arr.backgroundColor =  'rgba(1,104,250, .15)';
        }
        
        arr.borderColor = '#0168fa';
        arr.title = element.address;
       
        arr.borderColor = '#0168fa';
        arr.display = 'block';
        arr.className = 'eventWithComment';
        this.Events.push(arr);
      });
    
      console.log(this.Events);
      this.calendarOptions.events = this.Events;
      console.log(this.resources)
      
      //this.setEvents(this.Events);
    });
  }

    private BindMasterAllSearchData(date: string): Promise<void> {
      return new Promise((resolve, reject) => {
        let current = this;
        Promise.all<any>([
          this.bookingService.get(this.globals.dashboardMonthBookingList+'?date='+date),
        ]).then(function (response: any) {
          current.bookingData = response[0].response;
          resolve();
        });
      });
    }
}
