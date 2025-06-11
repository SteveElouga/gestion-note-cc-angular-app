import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Observable, tap} from "rxjs";
import {ServiceService} from "../../services/service.service";
import {LoginModel} from "../../models/login.model";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgIf,
    MatButton,
    AsyncPipe,
    MatProgressSpinner,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  matricule!: FormControl
  password!: FormControl
  form!: FormGroup
  loader$!: Observable<boolean>
  smallErrorMsg$!: Observable<boolean>
  showPassword: boolean = false;
  errorNotif: string = 'Une erreur s\'est produite !'

  constructor(private formBuilder: FormBuilder, private service: ServiceService, public snack: MatSnackBar) {
  }

  ngOnInit() {
    this.initForm()
    this.loader$ = this.service.loader$
    this.smallErrorMsg$ = this.service.smallErrorMsg$
  }

  private initForm() {

    this.matricule = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(3)],
    )
    this.password = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(4)],
    )
    this.form = this.formBuilder.group(
      {
        matricule: this.matricule,
        password: this.password
      }
    )
  }


  updateErrorMessage(ctrl: AbstractControl) {
    if (ctrl.hasError('required')) {
      return 'Veuillez entrer une valeur';
    } else if (ctrl.hasError("minlength")) {
      return 'Minimun 8 caracteres';
    } else {
      return
    }
  }

  onSubmit() {
    const data: LoginModel = {
      matricule: this.form.value.matricule,
      password: this.form.value.password
    }

    this.service.login(data).subscribe({
      next: () => {
        let username = ''
        this.service.user$.pipe(
          tap((res)=>{
            username = res.lastname
          })
        ).subscribe()
        this.snack.open("Connecte en tant que " + username, "Fermer", {
          duration: 4000,
          panelClass: ['success-notification'],
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        console.log(err)
        this.snack.open(this.errorNotif, "Fermer", {
          duration: 3000,
          panelClass: ['error-notification'],
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }
}
