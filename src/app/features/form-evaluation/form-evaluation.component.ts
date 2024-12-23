import {ChangeDetectionStrategy, Component, Inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {ServiceService} from "../../services/service.service";
import {tap} from "rxjs";
import {MatiereModel, MatiereModelAdd} from "../../models/matiere.model";
import {DatePipe, NgFor, NgIf, UpperCasePipe} from "@angular/common";
import {UserModel} from "../../models/user.model";
import {AddEvaluationModel} from "../../models/addEvaluation.model";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {EvaluationModel} from '../../models/evaluation.model';
import {AddNoteModel} from '../../models/addNote.model';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {EnseignantModel} from '../../models/enseignant.model';
import {PasswordUpdateModele} from '../../models/passwordUpdate.modele';


@Component({
  selector: 'app-form-evaluation',
  standalone: true,
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
    NgIf,
    MatSnackBarModule,
    DatePipe,
    UpperCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-evaluation.component.html',
  styleUrl: './form-evaluation.component.scss',
})
export class FormEvaluationComponent implements OnInit {
  form!: FormGroup
  filiere!: FormControl
  date!: FormControl
  type!: FormControl
  matiere!: FormControl
  enseignant!: FormControl
  time!: FormControl;
  matieres!: MatiereModel[]
  filieres!: string[]
  whoami!: UserModel
  userOnUpdate!: UserModel
  id!: number;
  showButtonUpdate!: boolean
  isNote = false
  isNoteUpdate = false
  isMatiereUpdate = false
  isMatiere = false
  isEvaluation = false
  userUpdate = false;
  userDelete = false
  idUser!: number
  userPasswordUpdate!: Boolean

  note!: FormControl
  etudiant!: FormControl
  evaluation!: FormControl
  evaluationValue!: EvaluationModel[]

  code!: FormControl
  intitule!: FormControl
  credits!: FormControl
  filiereCtrl!: FormControl

  lastname!: FormControl
  firstname!: FormControl
  email!: FormControl
  tel!: FormControl
  matricule!: FormControl

  enseignantList!: EnseignantModel[]

  @ViewChild('snackTemplateEvaluationAdd') snackTemplateEvaluationAdd!: TemplateRef<any>;
  @ViewChild('snackTemplateEvaluationUpdate') snackTemplateEvaluationUpdate!: TemplateRef<any>;
  @ViewChild('snackTemplateNoteAdd') snackTemplateNoteAdd!: TemplateRef<any>;
  @ViewChild('snackTemplateNoteUpdate') snackTemplateNoteUpdate!: TemplateRef<any>;
  @ViewChild('snackTemplateMatiereAdd') snackTemplateMatiereAdd!: TemplateRef<any>;
  @ViewChild('snackTemplateMatiereUpdate') snackTemplateMatiereUpdate!: TemplateRef<any>;

  @ViewChild('snackTemplatePasswordUpdate') snackTemplatePasswordUpdate!: TemplateRef<any>;
  @ViewChild('snackTemplateLogin') snackTemplateLogin!: TemplateRef<any>;
  @ViewChild('snackTemplateLogout') snackTemplateLogout!: TemplateRef<any>;
  @ViewChild('snackTemplateError') snackTemplateError!: TemplateRef<any>;
  @ViewChild('snackTemplateErrorNote') snackTemplateErrorNote!: TemplateRef<any>;
  password!: FormControl;
  newPassword!: FormControl;


  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private service: ServiceService, public snack: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.id = data?.id;
    this.showButtonUpdate = data?.show
    this.isNote = data?.note
    this.isNoteUpdate = data?.update
    this.isMatiere = data?.matiere
    this.isMatiereUpdate = data?.updateMatiere
    this.isEvaluation = data?.evaluation
    this.userUpdate = data?.userUpdate
    this.idUser = data?.idUser
    this.userDelete = data?.userDelete
    this.userPasswordUpdate = data?.userPasswordUpdate

    this.service.getUserById(this.idUser)
  }

  ngOnInit() {

    this.service.userOnUpdate$.pipe(
      tap((res) => {
        this.userOnUpdate = res
      })
    ).subscribe()
    this.service.userInfos$.pipe(
      tap((res) => {
        this.whoami = res
      })
    ).subscribe()
    this.userUpdate || this.userDelete ? '' : this.service.filieres()
    this.service.filieres$.pipe(
      tap((res) => {
        this.filieres = res
      })
    ).subscribe()
    this.userUpdate || this.userDelete ? '' : this.service.matieres()
    this.service.matieres$.pipe(
      tap((matieres) => {
        this.matieres = matieres
      })
    ).subscribe()
    this.service.evaluation$.pipe(
      tap((res) => {
        this.evaluationValue = res
      })
    ).subscribe()
    this.service.enseignants()
    this.service.enseignant$.pipe(
      tap((res) => {
        this.enseignantList = res
      })
    ).subscribe()
    this.initForm()
  }

  decimalAndMaxValidator(control: AbstractControl) {

    if (control.hasError('pattern')) {
      return 'La valeur saisir doit etre un nombre entier ou decimal.'
    }

    if (control.hasError('max')) {
      return 'La valeur ne peut pas depasser 20.'
    }

    return null
  }

  numberValidator(control: AbstractControl) {

    if (!control) {
      return null
    }
    if (control.hasError('pattern')) {
      return 'La valeur saisir doit etre un nombre entier'
    }

    if (control.hasError('max')) {
      return 'La valeur ne peut pas depasser 30.'
    }

    return null
  }

  private initForm() {

    if (this.isEvaluation) {
      console.log(this.isEvaluation)

      this.filiere = this.formBuilder.control(
        '',
        this.showButtonUpdate ? [] : [Validators.required]
      )
      this.date = this.formBuilder.control(
        '',
        this.showButtonUpdate ? [] : [Validators.required]
      )
      this.type = this.formBuilder.control(
        '',
        this.showButtonUpdate ? [] : [Validators.required]
      )
      this.matiere = this.formBuilder.control(
        '',
        this.showButtonUpdate ? [] : [Validators.required]
      )
      this.enseignant = this.formBuilder.control(
        this.whoami.lastname.charAt(0).toUpperCase() + this.whoami.lastname.slice(1).toLowerCase(),
        this.showButtonUpdate ? [] : [Validators.required]
      )
      this.time = this.formBuilder.control('',
        this.showButtonUpdate ? [] : [Validators.required]);

      this.form = this.formBuilder.group(
        {
          filiere: this.filiere,
          date: this.date,
          type: this.type,
          id_matiere: this.matiere,
          time: this.time
        }
      )
    }
    if (this.isNote) {
      this.note = this.formBuilder.control(
        '',
        [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), Validators.max(20)]
      )
      this.etudiant = this.formBuilder.control(
        '',
        [Validators.required]
      )
      this.evaluation = this.formBuilder.control(
        '',
        [Validators.required]
      )

      this.form = this.formBuilder.group(
        {
          note: this.note,
          etudiant: this.etudiant,
          evaluation: this.evaluation
        }
      )
    } else if (this.userUpdate) {
      this.matricule = this.formBuilder.control(
        '',
      )
      this.lastname = this.formBuilder.control(
        ''
      )
      this.firstname = this.formBuilder.control(
        ''
      )
      this.email = this.formBuilder.control(
        ''
      )
      this.tel = this.formBuilder.control(
        '',
        [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^\d+$/)]
      )
      this.form = this.formBuilder.group({
        matricule: this.matricule,
        lastname: this.lastname,
        firstname: this.firstname,
        email: this.email,
        tel: this.tel
      })
    } else if (this.userPasswordUpdate) {
      this.password = this.formBuilder.control(
        ''
      )
      this.newPassword = this.formBuilder.control(
        ''
      )
      this.form = this.formBuilder.group({
        password: this.password,
        newPassword: this.newPassword
      })
    } else if (this.isMatiere) {

      this.code = this.formBuilder.control(
        '',
        [Validators.required]
      )
      this.intitule = this.formBuilder.control(
        '',
        [Validators.required]
      )
      this.credits = this.formBuilder.control(
        '',
        [Validators.required, Validators.pattern(/^\d+$/), Validators.max(30)]
      )
      this.filiereCtrl = this.formBuilder.control(
        '',
        [Validators.required]
      )
      this.enseignant = this.formBuilder.control(
        '',
        [Validators.required]
      )

      this.form = this.formBuilder.group(
        {
          code: this.code,
          intitule: this.intitule,
          credits: this.credits,
          filiere: this.filiereCtrl,
          enseignant: this.enseignant
        }
      )
    }
  }

  addMatiere() {
    const data: MatiereModelAdd = {
      code: this.form.value.code,
      credits: this.form.value.credits,
      intitule: this.form.value.intitule,
      filiere: this.form.value.filiere,
      enseignant: this.form.value.enseignant
    }
    this.service.addMatiere(data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateMatiereAdd, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.form.reset()
    this.dialog.closeAll()
  }

  addEvaluation() {
    const data: AddEvaluationModel = {
      time: this.form.value.time,
      filiere: this.form.value.filiere,
      date: this.form.value.date,
      type_evaluation: this.form.value.type_evaluation,
      id_matiere: this.form.value.id_matiere
    }
    this.service.addEvaluation(data).subscribe(
      {
        next: () => {
          this.snack.openFromTemplate(this.snackTemplateEvaluationAdd, {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });

        },
        error: (err) => {
          this.snack.openFromTemplate(this.snackTemplateError, {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right', // Classe CSS pour les erreurs
          });
        },
      }
    )
    this.form.reset()
    this.dialog.closeAll()
  }

  updateEvaluation() {
    const data: AddEvaluationModel = {
      time: this.form.value.time,
      filiere: this.form.value.filiere,
      date: this.form.value.date ? this.formatDateToISO(this.form.value.date) : this.form.value.date,
      type_evaluation: this.form.value.type_evaluation,
      id_matiere: this.form.value.id_matiere
    }
    console.log(data)
    this.service.updateEvaluation(this.id, data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateEvaluationUpdate, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: 'snack-bar-success'
        });

      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: ['snack-bar-error'], // Classe CSS pour les erreurs
        });
      },
    })
    this.form.reset()
    this.dialog.closeAll()
  }

  updateNote() {
    const data: AddNoteModel = {
      note: this.form.value.note,
      matricule: this.form.value.etudiant,
      id_evaluation: this.form.value.evaluation,
    }
    this.service.updateNote(this.id, data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateNoteUpdate, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.form.reset()
    this.dialog.closeAll()
  }

  updateUser() {
    const data: UserModel = new UserModel()
    data.matricule = this.form.value.matricule
    data.lastname = this.form.value.lastname
    data.firstname = this.form.value.firstname
    data.email = this.form.value.email
    data.tel = this.form.value.tel
    this.service.updateUser(this.idUser, data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateNoteUpdate, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.form.reset()
    this.dialog.closeAll()
  }

  addNote() {
    const data: AddNoteModel = {
      note: this.form.value.note,
      matricule: this.form.value.etudiant,
      id_evaluation: this.form.value.evaluation,
    }
    this.service.addNote(data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateNoteAdd, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
      error: (err) => {
        console.log('erreur')
        this.snack.openFromTemplate(this.snackTemplateErrorNote, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.form.reset()
    this.dialog.closeAll()
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  updateMatiere() {
    const data: MatiereModelAdd = {
      code: this.form.value.code,
      credits: this.form.value.credits,
      intitule: this.form.value.intitule,
      filiere: this.form.value.filiere,
      enseignant: this.form.value.enseignant
    }
    this.service.updateMatiere(this.id, data).subscribe({
      next: () => {
        this.snack.openFromTemplate(this.snackTemplateMatiereUpdate, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.form.reset()
    this.dialog.closeAll()
  }

  deleteUser() {
    this.service.deleteUser(this.idUser).subscribe({
      next: () => {
        console.log(`Utilisateur avec l'ID ${this.idUser} supprimée.`)
      },
      error: (err) => {
        console.error('Erreur lors de la suppression : ', err)
      }
    })
    this.dialog.closeAll()
  }

  updateUserPassword() {
    const data = new PasswordUpdateModele()
    data.password = this.form.value.password
    data.newPassword = this.form.value.newPassword
    this.service.update(data)?.subscribe({
      next: (response) => {
        console.log(response?.verified)
        if (response?.verified) {
          this.snack.openFromTemplate(this.snackTemplatePasswordUpdate, {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        }
        else {
          this.snack.openFromTemplate(this.snackTemplateError, {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        }

      },
      error: (err) => {
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    });
    this.dialog.closeAll()
  }
}
