import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RestService } from '../services/rest.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends RestService {

  basePath: string;

  constructor(@Inject(HttpClient) public http: HttpClient) {
    super(http);
    this.basePath = environment.apiUrl;
  }

  get<T>(url: string): Promise<T> {
    return this.GET(url);
  }

  post<T>(path: string, request: any): Promise<T> {
    return super.POST(path, request);
  }

  put(path: string, request: any): Promise<void> {
    return super.PUT<void>(path, request);
  }

  delete(path: string, request: any): Promise<void> {
    return super.DELETE<void>(path, request);
  }

}
