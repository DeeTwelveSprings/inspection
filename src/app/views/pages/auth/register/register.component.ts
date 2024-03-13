import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertService } from '../../alert/alert.service';
import { ConfirmedValidator } from '../confirmed.validator';
import swal from 'sweetalert2'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  loading = false;
  submitted = false;
  model: any = {};
  formGroup: FormGroup = new FormGroup({});
  

  constructor(private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public alertService: AlertService,
    public authservice: AuthService) { }

  ngOnInit(): void {
    if (localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/dashboard']);
    }
    this.formGroup = this.fb.group({
      firstName: new FormControl("", Validators.required),
      lastName: new FormControl("", Validators.required),
      phoneNumber: new FormControl("", Validators.required),
      jobRole: new FormControl("", Validators.required),
      email: new FormControl("", [Validators.required, Validators.email]),
      userId: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      confirmPassword: new FormControl('', Validators.required)
    }, { 
      validator: ConfirmedValidator('password', 'confirmPassword')
    })
  }


  get f() { 
    return this.formGroup.controls; 
  }



  Matchpassword(formGroup: FormGroup) {
    const password = formGroup.get('NewPassword');
    const confirmPassword  = formGroup.get('ConfirmPassword');
    const matchingControl = formGroup.controls["ConfirmPassword"];

    if (password === confirmPassword) {
      matchingControl.setErrors(null);
    }
    else { matchingControl.setErrors({ CustomError: true }); }
  }

  onRegister(event: any) {

    this.alertService.success('ddsdsd','');
    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);

    this.submitted = true;
    if (this.formGroup.invalid) {
      button.removeAttribute('disabled');
      //this.SpinnerService.hide();
      return;
    }

    this.model.firstName = this.f.firstName.value;
    this.model.lastName = this.f.lastName.value;
    this.model.jobRole = this.f.jobRole.value;
    this.model.phoneNumber = this.f.phoneNumber.value;
    this.model.email = this.f.email.value;
    this.model.userId = this.f.userId.value;
    this.model.password = this.f.password.value;
    this.model.status = 'Active';
    this.model.userType = 'user';
  
    this.authservice.registerForm(this.model).subscribe((response: any) => {
      if (response.status && response.authToken != '') {
          //this.alertService.success(response.responseMessage,'');
          this.showToast('User registered Successfully!');
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2200);
      } else {
        this.alertService.error(response.responseMessage,'');
      }
    });
    /*e.preventDefault();
    localStorage.setItem('isLoggedin', 'true');
    if (localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/']);
    }*/
  }

  showToast(msg: string){
    swal.fire({ showConfirmButton: false, timer: 1800, title: 'Success!', text: msg, icon: 'success', });
  }

}
