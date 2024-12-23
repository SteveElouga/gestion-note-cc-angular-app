import {AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatiereModel} from '../../models/matiere.model';
import {Observable, tap} from 'rxjs';
import {ServiceService} from '../../services/service.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FormEvaluationComponent} from '../form-evaluation/form-evaluation.component';
import {AsyncPipe, DatePipe, NgIf, UpperCasePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-matieres',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatInput,
    MatLabel,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
    NgIf,
    UpperCasePipe,
    MatHeaderCellDef
  ],
  templateUrl: './matieres.component.html',
  styleUrl: './matieres.component.scss'
})
export class MatieresComponent implements AfterViewInit {
  showBuutooUpdate = false
  create!: boolean
  dataSource = new MatTableDataSource<MatiereModel>();
  displayedColumns: string[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  loader$!: Observable<boolean>
  @ViewChild('snackTemplateDelete') snackTemplateDelete!: TemplateRef<any>;
  @ViewChild('#snackTemplateError') snackTemplateError!: TemplateRef<any>;

  constructor(private service: ServiceService, public dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef, public snack: MatSnackBar) {
  }

  ngAfterViewInit() {
    this.loader$ = this.service.loader$
    this.matieres()
    this.service.create$.pipe(
      tap((res) => {
        this.create = res
        this.cdr.detectChanges();
      })
    ).subscribe()
    this.dataSource.paginator = this.paginator;
  }

  matieres() {
    this.service.matieres()
    this.service.displayedColumnsMatiere$.pipe(
      tap((res) => {
        this.displayedColumns = res
      })
    ).subscribe()
    this.service.matieres$.pipe(
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
    this.service.deleteMatiere(id).subscribe({
      next: () => {
        console.log(`Matiere avec l'ID ${id} supprimée.`);
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
        matiere: true
      }
    })
  }

  update(id: number) {
    this.showBuutooUpdate = true
    this.dialog.open(FormEvaluationComponent, {
      data: {
        id: id,
        show: this.showBuutooUpdate,
        updateMatiere: true,
        matiere: true
      }
    })
  }
}
