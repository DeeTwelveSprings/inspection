import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BlockSlotModel } from '../blockslot.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalConstants } from '../../../../global-constants';
import { RejectedResponse } from '../../../models/rejected-response';
import { AlertService } from '../../alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InspectorService } from '../inspector.service';
import swal from 'sweetalert2'; 
import { DataTable } from "simple-datatables";
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-booking-slot',
  templateUrl: './booking-slot.component.html',
  styleUrls: ['./booking-slot.component.scss']
})
export class BookingSlotComponent implements OnInit {

  @ViewChild('basicModal') basicModal: any;
  formGroup: FormGroup;
  submitted: boolean = false;
  item: BlockSlotModel = new BlockSlotModel();
  addUpdateLabel = 'Add Slot';
  saveLabel = 'Save';

  selectedDate: NgbDateStruct;
  endDate: NgbDateStruct;
  minDate: any;

  selStartTime: any;
  selEndTime: any;
  options: any = {
    componentRestrictions: { country: 'US' }
  } 
  savedData: any;
  currentId: string;
  blockType: string;
  modalReference: NgbModalRef;
  deleteId: string;

  @ViewChild('firstTable') myTable1: DatatableComponent;
  columns: any;

  constructor(public globals: GlobalConstants,
    private inspectorService: InspectorService,
    public alertService: AlertService,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    private activatedRoute: ActivatedRoute,
    private router: Router) { 
      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    }

  ngOnInit(): void {

    this.columns = [
      { name: 'Start Date'},
      { name: 'End Date' },
      { name: 'Start Time' },
      { name: 'End Time' },
      { name: 'Action' }
     ];

    this.activatedRoute.params.subscribe((params) => {
      var id = params["id"];
      var editId = params['editId'];
      this.currentId = id;
      if (id) {

        this.inspectorService.get(this.globals.getBlockSlot+'/?id='+id).then((Response: any) => {
          if(Response.status){
            //this.item = Response.data;
            this.savedData = Response.data;
            console.log(this.savedData)
            /*const [year, month, day] = this.item.startDate.split('-');
            const obj = { year: Number(year), month: Number(month), day: Number(day.split(' ')[0].trim()) };
            this.selectedDate = obj;

            const [year1, month1, day1] = this.item.endDate.split('-');
            const obj1 = { year: Number(year1), month: Number(month1), day: Number(day1.split(' ')[0].trim()) };
            this.endDate = obj1;

            const [hour, minute, second] = this.item.startTime.split(':');
            const obj2 = { hour: Number(hour), minute: Number(minute), second: Number(second.split(' ')[0].trim()) };
            this.selStartTime = obj2;
            
            const [hour1, minute1, second1] = this.item.endTime.split(':');
            const obj3 = { hour: Number(hour1), minute: Number(minute1), second: Number(second1.split(' ')[0].trim()) };
            this.selEndTime = obj3;

            this.saveLabel = 'Update';
            this.addUpdateLabel = 'Update Slot';*/

            let obj: any = {
              // Quickly get the headings
              headings: [
                "Start Date",
                "End Date",
                "Start Time",
                "End Time",
                "Action"
              ],
              data: []
            };
      
            let y = 0;
            this.savedData.forEach((element: any) => {
              obj.data[y] = [];
              obj.data[y].push(element.startDate);
              obj.data[y].push(element.endDate);

              var start= '';
              if(element.startTime == '09:00:00'){
                start = '09:00 am';
              }else if(element.startTime = '14:00:00'){
                start = '02:00 pm';
              }
              obj.data[y].push(start);
              
              var end = '';
              if(element.endTime == '13:59:00'){
                end = '02:00 pm';
              }else if(element.endTime == '17:59:00'){
                end = '06:00 pm';
              }
              obj.data[y].push(end);

              let id = "/inspectors/blockslot/edit/"+this.currentId+"/"+element.id;
              var popup = "<a id='"+element.id+"' title='Delete Slot'><i class='feather icon-delete'></i></a>";
              let url = '<a href="'+id+'" title="Edit Slot"><i class="feather icon-edit"></i></a>&nbsp;&nbsp;'+popup;
            
            
              //console.log(url)
              obj.data[y].push(url);

              //obj.data[y].push(element.endTime);
              y = y+1;
            });    
            let dataTable = new DataTable("#dataTableExample", {
              data: obj
            });

          }else{
            //this.item.inspectorId = id;
            //this.selectedDate = this.calendar.getToday();
            //this.item.startDate = this.selectedDate.year+"-"+('0'+this.selectedDate.month).slice(-2)+"-"+('0'+this.selectedDate.day).slice(-2);
          }

          


          this.item.inspectorId = id;
          this.selectedDate = this.calendar.getToday();
          this.item.startDate = this.selectedDate.year+"-"+('0'+this.selectedDate.month).slice(-2)+"-"+('0'+this.selectedDate.day).slice(-2);
          
          if(editId){
            const info = this.savedData.find((x: any) => x.id == editId);
            this.item = info;
            const [year, month, day] = this.item.startDate.split('-');
            const obj = { year: Number(year), month: Number(month), day: Number(day.split(' ')[0].trim()) };
            this.selectedDate = obj;

            const [year1, month1, day1] = this.item.endDate.split('-');
            const obj1 = { year: Number(year1), month: Number(month1), day: Number(day1.split(' ')[0].trim()) };
            this.endDate = obj1;

            if(this.item.startTime == '09:00:00' && this.item.endTime == '17:59:00'){
              this.blockType = 'All Day';
            }else if(this.item.startTime == '09:00:00' && this.item.endTime == '13:59:00'){
              this.blockType = "09:00:00";
            }else{
              this.blockType = "14:00:00";
            }
          }


        });

        
        
      }
    });
    this.BindFormGroup();
  }

  BindFormGroup(){
    this.formGroup = new FormGroup({
      startDate: new FormControl("", Validators.required),
      endDate: new FormControl(null, Validators.required),
      type: new FormControl(null, Validators.required),
      //startTime: new FormControl(null, Validators.required),
      //endTime: new FormControl(null, Validators.required)
    });
  }

  get f() { 
    return this.formGroup.controls; 
  }

  changeDate(event: any){
    this.item.startDate = event.year+"-"+('0'+event.month).slice(-2)+"-"+('0'+event.day).slice(-2);
  }

  changeEndDate(event: any){
    this.item.endDate = event.year+"-"+('0'+event.month).slice(-2)+"-"+('0'+event.day).slice(-2);
  }

  startTimeChange(event: any){
    this.item.startTime = ('0'+event?.hour).slice(-2)+":"+('0'+event?.minute).slice(-2)+":"+('0'+event?.second).slice(-2);
  }

  endTimeChange(event: any){
    this.item.endTime = ('0'+event?.hour).slice(-2)+":"+('0'+event?.minute).slice(-2)+":"+('0'+event?.second).slice(-2);
  }

  changeStartTime(event: any){
    //console.log(event.target.value);
    if(event.target.value == 'All Day'){
      this.item.startTime = '09:00:00';
      this.item.endTime = '17:59:00';
      this.item.type = 1;
    }else if(event.target.value == '09:00:00'){
      this.item.startTime = event.target.value;
      this.item.endTime = '13:59:00';
      this.item.type = 2;
    }else if(event.target.value == '14:00:00'){
      this.item.startTime = event.target.value;
      this.item.endTime = '17:59:00';
      this.item.type = 2;
    }
    this.blockType = event.target.value;
    
  }

  save(event: any){
    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);

    this.submitted = true;
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      button.removeAttribute('disabled');
      //this.SpinnerService.hide();
      return;
    }

    let startvalue = new Date(this.item.startDate).valueOf();
    let endvalue = new Date(this.item.endDate).valueOf();
    if(startvalue > endvalue){
      button.removeAttribute('disabled');
      this.showErrorToast('Please enter correct start and end date');
      return;
    }

    if (this.item.id) {
      this.inspectorService.create(this.globals.updateBlockslot,this.item).then((response) => {
        this.showToast('Slot Updated Successfully');
        this.reloadPage(this.currentId);
        //this.SpinnerService.hide();
      },
        (rejected: RejectedResponse) => {
          this.item.id = '';
          this.alertService.error('There is something wrong',this.options);
          //this.alertService.BindServerErrors(this.formGroup, rejected);
        }
      );
    } else {
      this.item.id = '';
      this.inspectorService.create(this.globals.saveBlockSlot,this.item).then((response) => {
        this.showToast('Slot Inserted Successfully');
        //this.backToList();
        this.reloadPage(this.currentId);
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

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

  showErrorToast(msg:string){
    swal.fire({ showConfirmButton: false, timer: 2000, title: 'Success!', text: msg, icon: 'error', });
  }

  public backToList(){
    this.router.navigate(['/inspectors']);
  }

  reloadPage(id: string) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/inspectors/blockslot/'+id]);
  }
  
  deleteSlot(event: any){
    const target  = event.target || event.srcElement || event.currentTarget;
    this.deleteId = event.target.parentElement.id;
    if(this.deleteId != ''){
      this.openPopup(this.basicModal);
    }
  }

  deleteSlotDe(id: string){
    this.modalReference.close();
    this.inspectorService.create(this.globals.deleteBlockSlot+'?id='+id,this.item).then((response) => {
      this.showToast('Delete Successfully');
      this.reloadPage(this.currentId);
      //this.SpinnerService.hide();
    },
      (rejected: RejectedResponse) => {
        this.item.id = '';
        this.alertService.error('There is something wrong',this.options);
        //this.alertService.BindServerErrors(this.formGroup, rejected);
      }
    );
  }

  openPopup(content: TemplateRef<any>) {
    this.modalReference = this.modalService.open(content);
  }

  closePopup(){
    this.modalReference.close();
    this.formGroup.reset();
  }
}
