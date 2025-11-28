import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PowerbiReportComponent } from './components/powerbi-report/powerbi-report.component';
import { WorkspaceDetailComponent } from './components/workspace-detail/workspace-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'workspace/:workspaceId',
    component: WorkspaceDetailComponent
  },
  {
    path: 'workspace/:workspaceId/report/:reportId',
    component: PowerbiReportComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
