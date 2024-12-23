import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {ServiceService} from "../../services/service.service";
import {LoginModel} from "../../models/login.model";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';

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

  constructor(private formBuilder: FormBuilder, private service: ServiceService) {
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

    this.service.login(data)
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }
}
