import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PowerbiReportComponent } from './components/powerbi-report/powerbi-report.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'report',
    component: PowerbiReportComponent
  },
  {
    path: 'workspace/:id',
    component: HomeComponent  // TODO: Create workspace detail component later
  },
  {
    path: '**',
    redirectTo: ''
  }
];
