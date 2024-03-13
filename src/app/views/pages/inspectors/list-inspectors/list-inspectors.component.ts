import { Component, OnInit } from '@angular/core';
import { InspectorService } from '../inspector.service';
import { GlobalConstants } from '../../../../global-constants';
import { Router } from '@angular/router';
import { AlertService } from '../../alert/alert.service';
import { DataTable } from "simple-datatables";

@Component({
  selector: 'app-list-inspectors',
  templateUrl: './list-inspectors.component.html',
  styleUrls: ['./list-inspectors.component.scss']
})
export class ListInspectorsComponent implements OnInit {

  inspectorData: any;
  checkval: boolean = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: false,
  };

  constructor(private inspectorService: InspectorService,
    public globals: GlobalConstants,
    public alertService: AlertService,
    private router: Router) { }

  ngOnInit(): void {
    this.getInspectorList();
  }


  public getInspectorList(){
    //this.SpinnerService.show();
    this.inspectorService.get(this.globals.getInspectorList).then((Response: any) => {
      this.inspectorData = Response.data;
      this.checkval = true;
      //this.SpinnerService.hide();

      let obj: any = {
        // Quickly get the headings
        headings: [
          "Inspector Name",
          "Address",
          "Email",
          "City",
          "Phone",
          "Status",
          "Action"
        ],
        data: []
      };

      let y = 0;
      this.inspectorData.forEach((element: any) => {
        obj.data[y] = [];
        obj.data[y].push(element.firstName+' '+element.lastName);
        obj.data[y].push(element.address);
        obj.data[y].push(element.email);
        obj.data[y].push(element.city);
        obj.data[y].push(this.formatPhoneNumber(element.phone));
        obj.data[y].push(element.status);
        //obj.data[y].push(element.createdDate);
        let id = "/inspectors/edit/"+element.id;
        let slot_id = "/inspectors/blockslot/"+element.id;
        let url = '<a href="'+id+'"><i class="feather icon-edit-2" title="Edit Inspector"></i></a>&nbsp;&nbsp;<a href="'+slot_id+'"><i class="feather icon-file-text" title="Block Slot"></i></a>';
        console.log(url)
        obj.data[y].push(url);
        y = y+1;
      });    
      let dataTable = new DataTable("#dataTableExample", {
        data: obj
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

}
