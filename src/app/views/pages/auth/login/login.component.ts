import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loading = false;
  submitted = false;
  model: any = {};
  show: boolean = false;

  formGroup = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", Validators.required)
  });
    
  constructor(private router: Router, 
    private route: ActivatedRoute,
    public alertService: AlertService,
    public authservice: AuthService) { }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLoggedin(e: Event) {
    e.preventDefault();
    localStorage.setItem('isLoggedin', 'true');
    if (localStorage.getItem('isLoggedin')) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() { 
    return this.formGroup.controls; 
  }

  login() 
  {
    //this.SpinnerService.show();  
    //this.alertService.clearToast();

    this.submitted = true;
    if (this.formGroup.invalid) {
      //this.SpinnerService.hide();
      return;
    }
    this.model.authemail = this.f.email.value;
    this.model.authpassword = this.f.password.value;
    
    this.authservice.loginForm(this.model.authemail,this.model.authpassword).subscribe(response => {
      //this.SpinnerService.hide();
      
      if (response.status && response.authToken != '') {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('data', JSON.stringify(response.data));
        localStorage.setItem("isLoggedin", "true");
        this.router.navigate([this.returnUrl]);
      } else {
        this.alertService.error(response.responseMessage,'');
        //this.router.navigate(["/auth/login"]);
      }
    }, error => {
        //this.SpinnerService.hide();
        //console.log(error.error.errors[0]);
        //let errMessage = error.error.errors[0];
        this.alertService.error('There is something wrong','');
        //this.alertService.errorToast(errMessage)
    });
  }

}
