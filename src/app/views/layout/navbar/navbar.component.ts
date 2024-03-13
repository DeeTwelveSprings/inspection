import { Component, OnInit, ViewChild, ElementRef, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../pages/bookings/booking.service';
import { GlobalConstants } from '../../../global-constants';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { formatDate } from "@angular/common";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  data: any;
  fullname: string;
  adminEmail: string;
  searchList: any;
  invName: string;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private renderer: Renderer2,
    private bookingService: BookingService,
    public globals: GlobalConstants,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.data = localStorage.getItem('data');
    var localData = JSON.parse(this.data);
    this.fullname = localData.firstName+' '+localData.lastName;
    this.adminEmail = localData.email;
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    //localStorage.removeItem('isLoggedin');
    localStorage.clear();
    //if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/auth/login']);
    //}
  }

  formatter(value: any) {
    if (value.address) {
      return value.address;
    } else {
      return value;
    }
  }

  gotoBooking(id: string){
    this.router.navigate(['bookings/update/'+id])
  }

  public formatDate(date: any){
    const format = 'MM/dd/yyyy';
    const locale = 'en-US';
    const formattedDate = formatDate(date, format, locale);
    return formattedDate;
  }

  formatTime(time: any){
    var  tm = time.split(":");
    var timemain:number = 0;
    if(Number(tm[0]) > 11 ){
      var shr = 'PM';
      timemain = Number(tm[0]) - 12;
    }else{
      var shr = 'AM';
      timemain = tm[0];
    }
    var mtime = timemain+':'+tm[1]+' '+shr;
    return mtime;
  }

  booksearch = (text$: any) =>
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
        this.bookingService.get(this.globals.dashboarSearch+'/?name='+term)
      ]).then(function (response: any) {
        current.searchList = response[0].response;
        resolve();
      });
    });
  }
}
