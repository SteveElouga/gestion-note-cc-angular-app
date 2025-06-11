import {ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatieresComponent} from "../matieres/matieres.component";
import {AsyncPipe, NgClass, NgIf, UpperCasePipe} from "@angular/common";
import {EdpComponent} from "../edp/edp.component";
import {ParametresComponent} from "../parametres/parametres.component";
import {NotesComponent} from "../notes/notes.component";
import {EvaluationsComponent} from "../evaluations/evaluations.component";
import {MatTableDataSource} from "@angular/material/table";
import {EvaluationModel} from "../../models/evaluation.model";
import {Observable, tap} from "rxjs";
import {UserModel} from "../../models/user.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ServiceService} from "../../services/service.service";
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgIf,
    AsyncPipe,
    EvaluationsComponent,
    NotesComponent,
    EdpComponent,
    ParametresComponent,
    MatieresComponent,
    UpperCasePipe,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    NgClass,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  userInfos$!: Observable<UserModel>;
  evaluation = true
  note = false
  edp = false
  parametres = false
  matiere = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('panel', {read: ElementRef}) panel!: ElementRef<HTMLElement>;
  isOpen: boolean = false;
  isAdmin!: boolean;
  fromUserGestion = false;
  delayedIsOpen: boolean = false;

  errorNotif = "Oups, une erreur s'est produite !"

  constructor(private service: ServiceService, private router: Router, public snack: MatSnackBar) {
  }

  ngOnInit() {
    this.whoami()
    this.service.whoami()
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (this.panel && this.panel.nativeElement && !this.panel.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  openButton() {
    this.isOpen = true
    this.delayedIsOpen = this.isOpen;
  }

  closeButton() {
    this.isOpen = false
    // Appliquer le délai pour la classe
    setTimeout(() => {
      this.delayedIsOpen = this.isOpen;
    }, 200); // 200 millisecondes de délai
  }


  whoami() {
    this.userInfos$ = this.service.userInfos$
    this.userInfos$.pipe(
      tap((res) => {
        this.isAdmin = res.role === 'admin'
      })
    ).subscribe()
  }

  logout() {
    this.service.logout()?.subscribe({
      next: () => {
        this.snack.open("Deconnecte avec succes", "Fermer", {
          duration: 4000,
          panelClass: ['success-notification'],
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });

      },
      error: (err) => {
        this.snack.open(this.errorNotif, "Fermer", {
          duration: 3000,
          panelClass: ['error-notification'],
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
    })
  }

  showEvaluation() {
    this.note = false
    this.edp = false
    this.parametres = false
    this.evaluation = true
    this.matiere = false
    this.isOpen = false;
  }

  showNotes() {
    this.note = true
    this.edp = false
    this.parametres = false
    this.evaluation = false
    this.matiere = false
    this.isOpen = false;
  }

  showEdp() {
    this.note = false
    this.edp = true
    this.parametres = false
    this.evaluation = false
    this.matiere = false
    this.isOpen = false;
  }

  showParams() {
    this.note = false
    this.edp = false
    this.parametres = true
    this.evaluation = false
    this.matiere = false
    this.isOpen = false;
  }

  showMatiere() {
    this.note = false
    this.edp = false
    this.parametres = false
    this.evaluation = false
    this.matiere = true
    this.isOpen = false;
  }

  onCreateUser() {
    this.fromUserGestion = true
    this.router.navigateByUrl('createuser')
  }

  onUserList() {
    this.router.navigateByUrl('userlist')
  }
}

