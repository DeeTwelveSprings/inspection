import { Component, OnInit } from '@angular/core';
import { InspectorService } from '../../inspectors/inspector.service';
import { GlobalConstants } from '../../../../global-constants';
import { AlertService } from '../../alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-abandoned-booking-detail',
  templateUrl: './abandoned-booking-detail.component.html',
  styleUrls: ['./abandoned-booking-detail.component.scss']
})
export class AbandonedBookingDetailComponent implements OnInit {

  item: any;
  constructor(private inspectorService: InspectorService,
    public globals: GlobalConstants,
    private activatedRoute: ActivatedRoute,
    public alertService: AlertService,
    private router: Router) { }

    ngOnInit(): void {
      this.activatedRoute.params.subscribe((params:any) => {
        var id = params["id"];
        if (id) {
          console.log(id);
          this.inspectorService.get(this.globals.getAbandonedEntry+'/?id='+id).then((Response: any) => {
            this.item = Response.data;
          });
        }
      });
    }

    goback(){
      this.router.navigate(['/bookings/abandoned']);
    }
}
