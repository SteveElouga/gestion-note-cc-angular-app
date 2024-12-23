import {AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {EvaluationModel} from "../../models/evaluation.model";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {ServiceService} from "../../services/service.service";
import {MatDialog} from "@angular/material/dialog";
import {Observable, tap} from "rxjs";
import {MatTooltip} from "@angular/material/tooltip";
import {MatListModule} from "@angular/material/list";
import {AsyncPipe, DatePipe, NgIf, UpperCasePipe} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormEvaluationComponent} from "../form-evaluation/form-evaluation.component";
import {Router} from "@angular/router";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-evaluations',
  imports: [
    MatListModule,
    DatePipe,
    MatDividerModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    MatTooltip,
    NgIf,
    MatBadgeModule,
    AsyncPipe,
    MatProgressSpinnerModule,
    UpperCasePipe
  ],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.scss'
})
export class EvaluationsComponent implements OnInit, AfterViewInit {

  showBuutooUpdate = false
  create!: boolean
  dataSource = new MatTableDataSource<EvaluationModel>();
  displayedColumns: string[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  loader$!: Observable<boolean>
  @ViewChild('snackTemplateDelete') snackTemplateDelete!: TemplateRef<any>;
  @ViewChild('#snackTemplateError') snackTemplateError!: TemplateRef<any>;

  constructor(private service: ServiceService, public dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef, public snack: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.loader$ = this.service.loader$
    this.dataSource.paginator = this.paginator;
    this.evaluations()
    this.service.create$.pipe(
      tap((res) => {
        this.create = res
        this.cdr.detectChanges();
      })
    ).subscribe()
  }

  evaluations() {
    this.service.evaluations()
    this.service.displayedColumns$.pipe(
      tap((res) => {
        this.displayedColumns = res
      })
    ).subscribe()
    this.service.evaluation$.pipe(
      tap((data) => {
        this.dataSource.data = data;
      })
    ).subscribe()
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  delete(id: number) {
    this.service.deleteEvaluation(id).subscribe({
      next: () => {
        console.log(`Évaluation avec l'ID ${id} supprimée.`);
        this.snack.openFromTemplate(this.snackTemplateDelete, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        })
      },
      error: (err) => {
        console.error('Erreur lors de la suppression : ', err);
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right', // Classe CSS pour les erreurs
        });
      }
    })
  }

  showForm() {
    this.dialog.open(FormEvaluationComponent, {
      data: {
        evaluation: true
      }
    })
  }

  update(id: number) {
    this.showBuutooUpdate = true
    this.dialog.open(FormEvaluationComponent, {
      data: {
        id: id,
        show: this.showBuutooUpdate,
        evaluation: true
      }
    })
  }
}
