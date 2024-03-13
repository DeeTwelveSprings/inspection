import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/angular';
import { INITIAL_EVENTS, createEventId } from '../event-utils';
import { BookingService } from '../booking.service';
import { GlobalConstants } from '../../../../global-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inspection-calendar',
  templateUrl: './inspection-calendar.component.html',
  styleUrls: ['./inspection-calendar.component.scss']
})
export class InspectionCalendarComponent implements OnInit {

  @ViewChild('externalEvents', {static: true}) externalEvents: ElementRef;
  bookingData: any;
  Events: any[] = [];

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    //initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    
  };
  currentEvents: EventApi[] = [];

  

  constructor(private bookingService: BookingService,
    public globals: GlobalConstants,
    private router: Router) { }

  ngOnInit(): void {


    /*setTimeout(() => {
      return this.httpClient
        .get('http://localhost:8888/event.php')
        .subscribe((res: any) => {
          this.Events.push(res);
          console.log(this.Events);
        });
    }, 2200);*/


    this.BindMasterAllSearchData().then(() => {
      console.log(this.bookingData)
      this.bookingData.forEach((element: any) => {
        /*if(element.inspectionTime == '09:00:00'){
          var endtime = element.inspectionDate+'T13:30:00';
        }else{
          var endtime = element.inspectionDate+'T17:30:00';
        }*/
        let arr: any = [];
        arr.id = element.id;
        arr.start = element.inspectionDate+'T'+element.inspectionTime;
        arr.end = element.inspectionDate+'T'+element.inspectionEndTime; //element.inspectionDate+'T09:00:00';
        arr.title = element.firstName+' '+element.lastName+ ' \n '+element.officerName;
        arr.backgroundColor =  'rgba(1,104,250, .15)';
        arr.borderColor = '#0168fa';
        arr.display = 'block';
        arr.className = 'eventWithComment';
        this.Events.push(arr);
      });
      this.setEvents(this.Events);
    });

    /*this.bookingService.get(this.globals.getBookingList).then((Response: any) => {
      this.bookingData = Response.response;
      let y = 0;
      this.bookingData.forEach((element: any) => {
        if(element.inspectionTime == '09:00:00'){
          var endtime = element.inspectionDate+'T13:30:00';
        }else{
          var endtime = element.inspectionDate+'T17:30:00';
        }
        let arr: any = [];
        arr.id = element.id;
        arr.start = element.inspectionDate+'T'+element.inspectionTime;
        arr.end = endtime; //element.inspectionDate+'T09:00:00';
        arr.title = element.firstName+' '+element.lastName+ ' \n '+element.officerName;
        arr.backgroundColor =  'rgba(1,104,250, .15)';
        arr.borderColor = '#0168fa';
        arr.display = 'block';
        arr.className = 'eventWithComment';
        this.Events.push(arr);
      });
    });*/
    
    /*this.Events = [
      {
        id: 1,
        start: this.TODAY_STR() +'-08T08:30:00',
        end: this.TODAY_STR() +'-08T13:00:00',
        title: 'Google Developers Meetup',
        description: 'In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis az pede mollis...',
        backgroundColor: 'rgba(1,104,250, .15)',
        borderColor: '#0168fa',
        display: 'block'
      }
    ]*/
    /*setTimeout(() => {
      this.calendarOptions = {
        headerToolbar: {
          left: 'prev,today,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        events: this.Events,
      };
    }, 1000);*/
    // For external-events dragging
    /*new Draggable(this.externalEvents.nativeElement, {
      itemSelector: '.fc-event',
      eventData: function(eventEl) {
        return {
          title: eventEl.innerText,
          backgroundColor: eventEl.getAttribute('bgColor'),
          borderColor: eventEl.getAttribute('bdColor')
        };
      }
    });*/

  }

  public setEvents(data: any){
    this.calendarOptions = {
      headerToolbar: {
        left: 'prev,today,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      events: this.Events,
    };
  }

  private BindMasterAllSearchData(): Promise<void> {
    return new Promise((resolve, reject) => {
      let current = this;
      Promise.all<any>([
        this.bookingService.get(this.globals.getBookingList)
      ]).then(function (response: any) {
        current.bookingData = response[0].response;
        resolve();
      });
    });
  }

  TODAY_STR()  {
    let dateObj = new Date();
    if(dateObj.getUTCMonth() < 10) {
      return dateObj.getUTCFullYear() + '-' + ('0'+(dateObj.getUTCMonth() + 1));
    } else {
      return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
    }
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    /*const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: 'rgba(0,204,204,.25)',
        borderColor: '#00cccc'
      });
    }*/
  }

  onDateClick(res: any) {
    console.log(res);
  }

  handleEventClick(clickInfo: EventClickArg) {
    /*if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }*/
    console.log(clickInfo.event._def.publicId);
    let id = clickInfo.event._def.publicId;
    this.router.navigate(['/bookings/update/'+id]);
  }

  handleEvents(events: EventApi[]) {
    console.log(events);
    this.currentEvents = events;
  }

}
