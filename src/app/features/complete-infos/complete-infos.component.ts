import {Component, OnInit} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {AsyncPipe, NgIf} from "@angular/common";
import {Observable} from "rxjs";
import {ServiceService} from "../../services/service.service";
import {UpdateModele} from "../../models/update.modele";

@Component({
  selector: 'app-complete-infos',
  imports: [
    FormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    MatProgressSpinner
  ],
  templateUrl: './complete-infos.component.html',
  styleUrl: './complete-infos.component.scss'
})
export class CompleteInfosComponent implements OnInit {
  form!: FormGroup;
  lastname!: FormControl
  firstname!: FormControl
  email!: FormControl
  tel!: FormControl
  password!: FormControl
  loader$!: Observable<boolean>

  constructor(private service: ServiceService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm()
    this.loader$ = this.service.loader$
  }

  private initForm() {
    this.password = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(4)]
    )
    this.lastname = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(3)]
    )
    this.firstname = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(5)]
    )
    this.email = this.formBuilder.control(
      '',
      [Validators.required, Validators.email]
    )
    this.tel = this.formBuilder.control(
      '',
      [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^\d+$/)]
    )
    this.form = this.formBuilder.group({
      lastname: this.lastname,
      firstname: this.firstname,
      email: this.email,
      tel: this.tel,
      password: this.password
    })
  }

  updateErrorMessage(ctrl: AbstractControl) {
    if (ctrl.hasError('required')) {
      return 'Veuillez entrer une valeur';
    } else if (ctrl.hasError("minlength") || ctrl.hasError("maxlength")) {
      return 'Exactement 9 caracteres';
    } else if (ctrl.hasError(('pattern'))) {
      return 'Veuillez entrer uniquement des chiffre';
    } else {
      return
    }
  }

  onSubmit() {
    const data: UpdateModele = {
      lastname: this.lastname.value,
      firstname: this.firstname.value,
      tel: this.tel.value,
      email: this.email.value,
      password: this.password.value
    }

    this.service.update(data)?.subscribe()
  }
}
