import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AuthfakeauthenticationService } from 'src/app/core/services/authfake.service';
import { AuthenticationRequest } from 'src/app/models/authenticationrequest';
import { AutentificationResponse } from 'src/app/models/autentification-response';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { login } from 'src/app/store/Authentication/authentication.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

// Login Component
export class LoginComponent {

  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  a: any = 10;
  b: any = 20;
  toast!: false;
    role: any;
 authrequest: AuthenticationRequest = new AuthenticationRequest()
  // set the current year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder,
    private router: Router,
    private store: Store,
     private authservice: ApprenantService
) { }

  ngOnInit(): void {
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validatyion
     */
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    const email = this.f['email'].value; // Get the username from the form
    const password = this.f['password'].value; // Get the password from the form

    // Login Api
    this.store.dispatch(login({ email: email, password: password }));
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }






login(): void {
    this.authrequest.email = this.loginForm.value.email;
    this.authrequest.password = this.loginForm.value.password;
    console.log(this.authrequest)
    this.authservice.login(this.authrequest).subscribe({

      next: (response:AutentificationResponse) => {
        this.authservice.setUserToken(response)

        this.role = localStorage.getItem('role');

            sessionStorage.removeItem('modaldiscountShown');
      console.log('🔄 modaldiscountShown réinitialisé au login');


          this.router.navigate(['/learning']);

        // this.toastr.success("Connexion réussie 😎", "Succès")

      },
      error: (error) => {
        // this.toastr.error("Échec de la connexion 😥", "Erreur")

      }
    });
  }



}
