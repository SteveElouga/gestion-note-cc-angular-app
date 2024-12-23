import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {ServiceService} from "../../services/service.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Observable, Subject, takeUntil, tap} from "rxjs";
import {MatListModule} from "@angular/material/list";
import {AsyncPipe, CommonModule, DatePipe, NgIf, UpperCasePipe} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTooltip} from "@angular/material/tooltip";
import {ReactiveFormsModule} from "@angular/forms";
import {NoteModel} from '../../models/note.model';
import {FormEvaluationComponent} from '../form-evaluation/form-evaluation.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {saveAs} from 'file-saver';
import {UserModel} from '../../models/user.model';
import {NotificationService} from '../../services/notification.service';

import {Chart, ChartOptions, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltip,
    NgIf,
    ReactiveFormsModule,
    UpperCasePipe,
    DatePipe,
    AsyncPipe,
    MatProgressSpinner,
    AsyncPipe,
    CommonModule
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements AfterViewInit, OnInit, OnDestroy {

  public config!: any

  chart: any


  showBuutooUpdate = false
  create!: boolean
  dataSource = new MatTableDataSource<NoteModel>();
  private destroy$ = new Subject<void>();
  displayedColumns: string[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  errorNoteAdd!: string
  loader$!: Observable<boolean>
  dataSourceStat = new MatTableDataSource<{ matiere: string, max: number, min: number, moy: number }>();
  displayedColumnsStats: string[] = ["matiere", "max", "min", "moy"]
  @ViewChild('snackTemplateDelete') snackTemplateDelete!: TemplateRef<any>;
  @ViewChild('snackTemplateError') snackTemplateError!: TemplateRef<any>;
  @ViewChild('snackTemplateExcel') snackTemplateExcel!: TemplateRef<any>;
  userInfos!: UserModel

  selectedFile: File | null = null
  fileName: string = ''
  showUpdate: boolean = true;
  notificationMessage: string | null = null;
  message: string | null = null
  messsages: any[] = []
  private data! : number[];

  constructor(private service: ServiceService, private notificationService: NotificationService, public dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef, public snack: MatSnackBar) {
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {

    this.loader$ = this.service.loader$;
    this.service.errorNoteAdd$.pipe(
      takeUntil(this.destroy$),
      tap((res) => {
        this.errorNoteAdd = res
      })
    ).subscribe();

    this.service.userInfos$.pipe(
      takeUntil(this.destroy$),
      tap((res) => {
        this.userInfos = res;

        // S'abonner aux notifications après la récupération des infos utilisateur
        this.notificationService.listenToNewNotes().pipe(
          takeUntil(this.destroy$),
          tap(data => {
            this.notificationMessage = data.message;
            console.log(data.message);
            setTimeout(() => {
              this.notificationMessage = null
            }, 5000);
          })
        ).subscribe()
      })
    ).subscribe();

    this.dataSource.paginator = this.paginator;
    this.notes();

    this.service.create$.pipe(
      takeUntil(this.destroy$),
      tap((res) => {
        this.create = res
      })
    ).subscribe();

  }

  notes() {
    this.service.note()
    this.service.displayedColumns$.pipe(
      takeUntil(this.destroy$),
      tap((res) => {
        this.displayedColumns = res
      })
    ).subscribe()
    this.service.note$.pipe(
      takeUntil(this.destroy$),
      tap((donnees) => {
        this.dataSource.data = donnees;
        const notesData = donnees.map(note => note.note);
        this.updateChart(notesData);
      })
    ).subscribe()
    this.service.notesGlobales$.pipe(
      takeUntil(this.destroy$),
      tap((data) => {
        const notesData = data.map(note => note.note);
        this.updateChart(notesData);
        console.log(notesData)
      })
    ).subscribe()
    this.service.statNote$.pipe(
      takeUntil(this.destroy$),
      tap((data) => {
        this.dataSourceStat.data = data
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
    this.service.deleteNote(id).subscribe({
      next: () => {
        console.log(`Note avec l'ID ${id} supprimée.`)
      },
      error: (err) => {
        console.error('Erreur lors de la suppression : ', err)
      }
    })
  }

  showForm() {
    this.dialog.open(FormEvaluationComponent, {
      data: {
        note: true
      }
    })
  }

  update(id: number) {
    this.showBuutooUpdate = true
    this.dialog.open(FormEvaluationComponent, {
      data: {
        id: id,
        show: this.showBuutooUpdate,
        note: true,
        update: true
      }
    })
  }

  uploadNotesFromExcel() {
    if (!this.selectedFile) {
      alert('Veuillez selectionner un fichier excel.')
      return
    }

    const formData = new FormData()
    formData.append('file', this.selectedFile)

    this.service.uploadNotesFromExcel(formData).subscribe({
      next: (response) => {
        console.log('Fichier envoye avec succes:', response)
        this.showUpdate = true
        this.snack.openFromTemplate(this.snackTemplateExcel, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      },
      error: (err) => {
        console.log("Erreur lors de l\'envoi du fichier:", err)
        this.showUpdate = true
        this.snack.openFromTemplate(this.snackTemplateError, {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
        });
      }
    })
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileName = input.files[0].name
      this.selectedFile = input.files[0]
      this.showUpdate = false
    }
  }

  exportNotes() {
    this.service.exportNotes().subscribe({
      next: (blob) => {
        saveAs(blob, `NOTES_CC_${this.userInfos.firstname}_${this.userInfos.lastname}_${this.userInfos.matricule}`.toUpperCase());
        console.log("Exportation reussie !")
        this.service.setLoader(false)
      },
      error: (err) => this.service.setLoader(false)
    });
  }


  analyzeNotes(notes: number[]) {
    const result = {
      mediocre: 0,
      insuffisant: 0,
      moyen: 0,
      bien: 0,
    };
    const validNotes = notes.filter(note => typeof note === 'number' && !isNaN(note));
    validNotes.forEach(note => {
      if (note <= 8) {
        result.mediocre++;
      } else if (note > 8 && note < 10) {
        result.insuffisant++;
      } else if (note >= 10 && note < 12) {
        result.moyen++;
      } else if (note >= 12) {
        result.bien++;
      }
    });
    console.log(result)
    return result;
  }
  private createChartData(result: { mediocre: number; insuffisant: number; moyen: number; bien: number }){
    return {
      labels: ['Médiocre', 'Insuffisant', 'Moyen', 'Bien'],
      datasets: [{
        label: 'Statistiques',
        data: [
          result.mediocre,
          result.insuffisant,
          result.moyen,
          result.bien
        ],
        backgroundColor: [
          '#e74c3c',    // Médiocre (Rouge)
          '#f39c12',    // Insuffisant (Orange)
          '#3498db',  // Moyen (Bleu)
          '#2ecc71'   // Bien (Vert)
        ],
        hoverOffset: 4,
      }],
    };
  }
  private updateChart(notesData: number[]): void {
    const result = this.analyzeNotes(notesData);
    const data = this.createChartData(result)

    const chartOptions: ChartOptions = {
      responsive: true,  // Permettre au graphique de s'adapter à la taille de l'écran
      plugins: {  // Configuration des plugins
        legend: {
          display: true,  // Afficher la légende
          position: 'bottom', // Position de la légende (top, bottom, left, right)
          align: 'center',
          labels: {
            color: '#024474',
            font: {
              size: 14 // taille du texte de la légende
            }
          },
        },
      },
    };

    if (this.chart) {
      // Mise à jour des données si le graphique existe
      this.chart.data.datasets[0].data = data.datasets[0].data;
      this.chart.options = chartOptions;
      this.chart.update();
    } else {
      // Création du graphique si aucun graphique n'existe encore

      const ctx = document.getElementById('MyChart') as HTMLCanvasElement;
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: chartOptions
        });
      } else {
        console.error('Canvas avec ID "MyChart" introuvable.');
      }
    }
  }
}
