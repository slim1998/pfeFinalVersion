import { Component } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouteConfigLoadEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

// Register Auth
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Apprenant } from 'src/app/models/apprenant';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { Register } from 'src/app/store/Authentication/authentication.actions';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

// Register Component
export class RegisterComponent {
  // Login Form
  signupForm!: UntypedFormGroup;
  registerForm:FormGroup
  submitted = false;
  successmsg = false;
  error = '';
    images: File[] = []
   
  image!: File;
      imgUrl: string | ArrayBuffer = 'assets/images/imgg.jpg';
    selectedFile!: File
    
   registerApprenant : Apprenant = new Apprenant()
  // set the current year
  year: number = new Date().getFullYear();

  fieldTextType!: boolean;

  constructor(private formBuilder: UntypedFormBuilder,  public store: Store,
     private apprenantService:ApprenantService,
      private toastr: ToastrService, private router:Router) { 
        this.registerForm = new FormGroup({
      firstName : new FormControl ('',Validators.required),
      lastName : new FormControl ('',Validators.required),
      email : new FormControl ('',[Validators.required , Validators.email]),
      phone : new FormControl ('',[Validators.required ,Validators.minLength(8)]),
      adress : new FormControl ('',[Validators.required]),
      password : new FormControl ('',[Validators.required,Validators.minLength(6)]),
      confirmpassword : new FormControl ('',[Validators.required,Validators.minLength(6)]),
      niveau :new FormControl ('',[Validators.required]),
      photo : new FormControl ('',[Validators.required])
      




      });
  }

  ngOnInit(): void {
    /**
     * Form Validatyion
     */
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

    // convenience getter for easy access to form fields
    get f() { return this.signupForm.controls; }

  /**
   * Register submit form
   */

 get firstName() {
      return this.registerForm.get('firstName');
    }

    get lastName() {
      return this.registerForm.get('lastName');
    }

    get phone() {
      return this.registerForm.get('phone');
    }


    get email() {
      return this.registerForm.get('email');
    }

    get password() {
      return this.registerForm.get('password');
    }


  onSubmit() {
    this.submitted = true;

    const email = this.f['email'].value;
    const name = this.f['name'].value;
    const password = this.f['password'].value;

    //Dispatch Action
    this.store.dispatch(Register({ email: email, first_name: name, password: password }));
  }

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

register(): void {
  // Remplissage de l'objet apprenant
  this.registerApprenant.firstName = this.registerForm.value.firstName;
  this.registerApprenant.lastName = this.registerForm.value.lastName;
  this.registerApprenant.email = this.registerForm.value.email;
  this.registerApprenant.niveau = this.registerForm.value.niveau;
  this.registerApprenant.password = this.registerForm.value.password;
  this.registerApprenant.phone = this.registerForm.value.phone;
  this.registerApprenant.adress = this.registerForm.value.adress;

  console.log("registerApprenant", this.registerApprenant);

  // Appel du service pour créer l'apprenant
  this.apprenantService.RegisterApprenant(this.registerApprenant).subscribe({
    next: (data) => {
      console.log('ID reçu:', data.id);

      // ⚡ Utilisation de this.image au lieu de selectedFile
      if (this.image) {
        console.log("selected file", this.image);
        console.log("data id", data.id);

        this.apprenantService.uploadApprenantImage(data.id, this.image).subscribe({
          next: (res) => {
            console.log("Image uploadée :", res);
          },
          error: () => {
            alert("Erreur lors de l'upload de l'image");
          }
        });
      } else {
        console.warn("Aucune image sélectionnée.");
      }

      this.toastr.success("SUCCESFULLY REGISTRATION 😎");
      this.router.navigate(['/auth/login']);
    },
    error: (error) => {
      this.toastr.error("FAILED REGISTRATION 😥");
    }
  });
}



// onFileSelected(event: any): void {
//   console.log('event:', event);
//   console.log('files:', event.target.files);
//   if (event.target.files && event.target.files.length > 0) {
//     this.selectedFile = event.target.files[0];
//     console.log('selectedFile:', this.selectedFile);
//   }
// }

  onFileInputImage(files: FileList | null): void {
      if (files) {
        this.image = files.item(0) as File;
        if (this.image) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(this.image);
          fileReader.onload = (event) => {
            if (fileReader.result) {
              this.imgUrl = fileReader.result;
            }
          };
        }
      }
    }


    changeSourceimage(event: any) {
      event.target.src = "assets/images/imgg.jpg";
     
    }


}
