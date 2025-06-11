import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ServiceService} from '../../services/service.service';
import {Observable, tap} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatNativeDateModule} from '@angular/material/core';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {AsyncPipe, CommonModule, NgFor, UpperCasePipe} from '@angular/common';
import {Router} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {response} from 'express';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-create-user',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatMomentDateModule,
    ReactiveFormsModule,
    NgFor,
    MatSnackBarModule,
    UpperCasePipe,
    MatTooltip,
    MatProgressSpinner,
    AsyncPipe,
    CommonModule
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss'
})
export class CreateUserComponent implements OnInit {

  loader$!: Observable<boolean>;
  matricule!: FormControl
  filiere!: FormControl
  role!: FormControl
  departement!: FormControl
  form!: FormGroup

  filieres!: string[]
  roles = ['admin', 'teacher', 'student']
  departements!: string[]

  selectedFile: File | null = null
  fileName: string = ''

  errorNotif: string = 'Une erreur s\'est produite !'

  @ViewChild('element') element!: ElementRef
  @ViewChild('fileCharged') fileCharged!: ElementRef

  constructor(public snack: MatSnackBar, private service: ServiceService, private formBuilder: FormBuilder, private router: Router) {
  }

  ngOnInit(): void {
    this.loader$ = this.service.loader$
    this.initForm()
    this.service.filieres()
    this.service.filieres$.pipe(
      tap((res) => {
        this.filieres = res
      })
    ).subscribe()
    this.service.departement$.pipe(
      tap((res) => {
        this.departements = res
      })
    ).subscribe()
  }

  initForm() {
    this.filiere = this.formBuilder.control(
      '',
    )
    this.matricule = this.formBuilder.control(
      '',
      [Validators.required]
    )
    this.role = this.formBuilder.control(
      '',
      [Validators.required]
    )
    this.departement = this.formBuilder.control(
      '',
    )

    this.form = this.formBuilder.group(
      {
        filiere: this.filiere,
        matricule: this.matricule,
        role: this.role,
        departement: this.departement
      }
    )
  }

  createUser() {
    const data: { filiere: string; role: string; departement: string; matricule: string } = {
      filiere: this.form.value.filiere,
      matricule: this.form.value.matricule,
      role: this.form.value.role,
      departement: this.form.value.departement
    }
    console.log(data)
    this.service.createUser(data).subscribe({
      next: () => {
        this.snack.open("Nouvel utilisateur cree !", "Fermer", {
          duration: 4000,
          panelClass: ['success-notification'],
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        this.snack.open(this.errorNotif, "Fermer", {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: ['error-notification'],
        });
      },
    })
  }

  onDashboard() {
    this.router.navigateByUrl('dashboard')
  }

  onUserList() {
    this.router.navigateByUrl('userlist')
  }

  onFormReset() {
    this.form.reset()
  }

  protected readonly Object = Object;


  translate() {
    const el = this.element.nativeElement;
    const el2 = this.fileCharged.nativeElement
    el.classList.toggle("translated")
    el2.classList.toggle("adding")
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileName = input.files[0].name
      this.selectedFile = input.files[0]
    }
  }

  uploadFile() {
    if(!this.selectedFile){
      alert('Veuillez selectionner un fichier excel.')
      return
    }

    const formData = new FormData()
    formData.append('file', this.selectedFile)

    this.service.uploadFile(formData).subscribe({
      next: (response) =>{
        console.log('Fichier envoye avec succes:', response)
        this.snack.open("Operation effectuee avec succes !", "Fermer", {
          duration: 4000,
          verticalPosition: 'bottom',
          panelClass: ['success-notification'],
          horizontalPosition: 'right',
        });
      },
      error: (err) => {
        console.log("Erreur lors de l\'envoi du fichier:", err)
        this.snack.open(this.errorNotif, "Fermer", {
          duration: 4000,
          verticalPosition: 'bottom',
          panelClass: ['error-notification'],
          horizontalPosition: 'right',
        });
        this.service.setLoader(false)
      }
    })
  }

}
