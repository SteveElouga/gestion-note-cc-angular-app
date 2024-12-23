import {Component, OnInit} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from '@angular/material/card';
import {ServiceService} from '../../services/service.service';
import {UserModel} from '../../models/user.model';
import {Observable, tap} from 'rxjs';
import {AsyncPipe, DatePipe, NgForOf, NgIf, UpperCasePipe} from '@angular/common';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {MatiereModel} from '../../models/matiere.model';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from '@angular/material/tooltip';
import {FormEvaluationComponent} from '../form-evaluation/form-evaluation.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    NgIf,
    UpperCasePipe,
    DatePipe,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    NgForOf,
    AsyncPipe,
    MatProgressSpinner,
    MatTooltip
  ],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit{

  user!: UserModel
  matieres!: MatiereModel[]
  loader$!: Observable<boolean>;
  constructor(private service: ServiceService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.loader$ = this.service.loader$
    this.service.whoami()
    this.service.user$.pipe(
      tap((res)=>{
        this.user = res
      })
    ).subscribe()
    this.service.matieres()
    this.service.matieres$.pipe(
      tap((res)=>{
        this.matieres = res
      })
    ).subscribe()
  }

  updatePassword() {
    this.dialog.open(FormEvaluationComponent, {
      data: {
        userPasswordUpdate: true,
      }
    })
  }
}
