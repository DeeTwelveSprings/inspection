import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { throwError as observableThrowError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { RejectedResponse } from "../models/rejected-response";

export abstract class RestService {
  private headerCollection: HttpHeaders;
  public baseUrl = "";

  protected constructor(
      protected httpClient: HttpClient,
      baseUrl?: string,
      header?: HttpHeaders
  ) {
      if (baseUrl) this.baseUrl = baseUrl;
      this.headerCollection = new HttpHeaders();
      if (header) this.headerCollection = header;
  }

  protected GET(path: string): Promise<any> {
      const url = this.url(path, false);
      return this.httpClient
      .get(url)
      .pipe(
          tap((res: any) => {
          console.log("-> Result", res);
          }),
          catchError((error) => {
          return observableThrowError(this.rejectedResponse(error));
          })
      )
      .toPromise();
  }

  protected POST<T>(path: string, request: any): Promise<any> {
      const url = this.url(path, false);
      // console.log("POST:", url, request);
      const body = JSON.stringify(request);

      return this.httpClient
      .post(url, body, { headers: this.headers() },)
      .pipe(
          tap((res) => {
          console.log("-> Result", res);
          }),
          catchError((error: any) => {
          return observableThrowError(this.rejectedResponse(error));
          })
      )
      .toPromise();
  }

  protected PUT<T>(path: string, request: any): Promise<any> {
      const url = this.url(path, false);
      // console.log("PUT:", url, request);
      const body = JSON.stringify(request);
      return this.httpClient
      .put<T>(url, body, { headers: this.headers() })
      .pipe(
          tap((res) => {
          console.log("-> Result", res);
          }),
          catchError((error: any) => {
          return observableThrowError(this.rejectedResponse(error));
          })
      )
      .toPromise();
  }

  protected DELETE<T>(path: string, request: any): Promise<any> {
      const url = this.url(path, false);
      // console.log("DELETE:", url, request);

      return this.httpClient
      .request<T>("delete", url, {
          body: request,
          headers: this.headers(),
      })
      .pipe(
          map((res) => {
          console.log("-> Result", res);
          return res;
          }),
          catchError((error: any) => {
          return observableThrowError(this.rejectedResponse(error));
          })
      )
      .toPromise();
  }

  protected headers(): HttpHeaders {
    var token = localStorage.getItem('access_token');
    var headers = this.headerCollection
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", 'Bearer ' + token);
    // .set("Access-Control-Allow-Origin", "*");
    return headers;
  }

  protected url(path: string, isGetMethod: boolean): string {
    const absoluteSecureCheck = /^https?:\/\//i;
    const absoluteUnSecureCheck = /^http?:\/\//i;

    let url = '';
    if (absoluteSecureCheck.test(path) || absoluteUnSecureCheck.test(path)) {
      // For any external api's
      url = path
    }
    else if (absoluteSecureCheck.test(this.baseUrl + path) || absoluteUnSecureCheck.test(this.baseUrl + path)) {
      // for local api's
      url = this.baseUrl + path;
    }
    else {
      // For production api's
      url = this.currentOrigin() + this.baseUrl + path;
    }

    // Make unique url by adding date/time 
    url = this.addQueryParam(url, 't', new Date().toISOString());
    return url;
  }

  protected currentOrigin(): string {
    return location.origin;
  }

  private rejectedResponse(error: any): RejectedResponse {
    return new RejectedResponse(error);
  }

  public addQueryParam(url: string, key: string, value: string, encode: boolean = true): string {
    const newParam = encode ? encodeURIComponent(key) + '=' + encodeURIComponent(value) : key + '=' + value;
    let result = url.replace(new RegExp('(&|\\?)' + key + '=[^\&|#]*'), '$1' + newParam);

    if (result === url) {
      if (url.indexOf('?') !== -1)
        result = url.split('?')[0] + '?' + url.split('?')[1] + '&' + newParam;
      else if (url.indexOf('#') !== -1)
        result = url.split('#')[0] + '?' + url.split('#')[1] + '#' + newParam;
      else
        result = url + '?' + newParam;
    }

    return result;
  }
  
}