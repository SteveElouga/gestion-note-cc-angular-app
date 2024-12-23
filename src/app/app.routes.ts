import {Routes} from '@angular/router';
import {LoginComponent} from './features/login/login.component';
import {authGuard} from './guards/auth.guard';



export const routes: Routes = [
  {
    path: "",
    component: LoginComponent
  },
  {
    path: "dashboard",
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  // {
  //   path: "matieres",
  //   loadComponent: () => import('./features/matieres/matieres.component').then(m => m.MatieresComponent),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: "evaluations",
  //   loadComponent: () => import('./features/evaluations/evaluations.component').then(m => m.EvaluationsComponent),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: "dashboard",
  //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: "dashboard",
  //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   canActivate: [authGuard],
  // },
  {
    path:"complete-infos",
    loadComponent: () => import('./features/complete-infos/complete-infos.component').then(m => m.CompleteInfosComponent),
    canActivate: [authGuard],
  },
  {
    path:"createuser",
    loadComponent: () => import('./features/create-user/create-user.component').then(m => m.CreateUserComponent),
    canActivate: [authGuard],
  },
  {
    path:"userlist",
    loadComponent: () => import('./features/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: ""
  }
];
