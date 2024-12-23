import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {UserModel} from '../../models/user.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {Observable, tap} from 'rxjs';
import {ServiceService} from '../../services/service.service';
import {Router} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {AsyncPipe, DatePipe, NgClass, NgIf, UpperCasePipe} from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormEvaluationComponent} from '../form-evaluation/form-evaluation.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-user-list',
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
    UpperCasePipe,
    NgClass
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements AfterViewInit {
  userslist!: UserModel[]
  create!: boolean
  dataSource = new MatTableDataSource<UserModel>();
  displayedColumns: string[] = ['matricule', 'noms', 'prenoms', 'tel', 'email', 'role', 'status', 'update']
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  loader$!: Observable<boolean>
  userUpdate!: UserModel

  constructor(private service: ServiceService, private router: Router, public dialog: MatDialog, private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.loader$ = this.service.loader$
    this.dataSource.paginator = this.paginator;
    this.users()
    this.service.create$.pipe(
      tap((res) => {
        this.create = res
        this.cdr.detectChanges();
      })
    ).subscribe()
  }

  users() {
    this.service.allUser()
    this.service.displayedColumnsMatiere$.pipe(
      tap((res) => {
        this.displayedColumns = res
      })
    ).subscribe()
    this.service.userList$.pipe(
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
    this.dialog.open(FormEvaluationComponent, {
      data: {
        idUser: id,
        userDelete: true
      }
    })
  }

  // update(id: number) {
  //   this.service.updateUser(id)
  // }

  update(id: number) {
    this.dialog.open(FormEvaluationComponent, {
      data: {
        idUser: id,
        userUpdate: true
      }
    })
  }

  onDashboard() {
    this.router.navigateByUrl('dashboard')
  }
}
