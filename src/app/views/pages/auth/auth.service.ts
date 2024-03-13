import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":"POST, GET, PUT, OPTIONS, DELETE",
    "Access-Control-Allow-Headers":"x-requested-with, content-type"
  });
  currentUser = {};

  basePath: string = '';
  registerPath:string = '';
  constructor(private http: HttpClient, 
    public router: Router) 
  {
    this.basePath = environment.apiUrl+'/v1/login';
    this.registerPath = environment.apiUrl+'/v1/signup';
  }
  
  //Get Bearer Token
  getToken() {
      return localStorage.getItem('authToken');
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('authToken');
    return authToken !== null ? true : false;
  }

  //Login Users
  loginForm(email: string,password: string): Observable<any> {
      return this.http.post<any>(this.basePath, { email, password },{ headers: this.headers})
          .pipe();
  }

  registerForm(item: any){
    return this.http.post<any>(this.registerPath, item,{ headers: this.headers})
          .pipe();
  }

  signupValidate(path: string,entity: any): Observable<any> {
    const data = JSON.stringify(entity);
    return this.http.post<any>(path, data,{ headers: this.headers}).pipe();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
  















  
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}