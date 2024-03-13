import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InspectorService {

  basePath: string;
  alertCount = new Subject();

  constructor(private router: Router,
    private commonService: CommonService,
    private http: HttpClient) {
      this.basePath = environment.apiUrl;
     }

  get(path:string) {
    return this.commonService.get(this.basePath+'/'+path)
  }

  remove(path: string,id: string) {
    var path = this.basePath+'/'+path+'/'+id;
    return this.commonService.delete(path, null);
  }

  update(path:string,entity: any): Promise<void> {
    var path = this.basePath+'/'+path;
    return this.commonService.put(path, entity);
  }

  create(path:string,entity: any): Promise<void> {
    var path = this.basePath+'/'+path;
    return this.commonService.post(path, entity);
  }
}
