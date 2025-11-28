import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Workspace {
  id: string;
  name: string;
  isReadOnly: boolean;
  isOnDedicatedCapacity: boolean;
  type?: string;
}

export interface WorkspacesResponse {
  status: string;
  workspaceCount: number;
  workspaces: Workspace[];
}

export interface Report {
  id: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId?: string;
  reportType?: string;
}

export interface ReportsResponse {
  status: string;
  workspaceId: string;
  reportCount: number;
  reports: Report[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(private http: HttpClient) { }

  getWorkspaces(): Observable<WorkspacesResponse> {
    return this.http.get<WorkspacesResponse>(`${environment.apiUrl}/powerbi/workspaces`);
  }

  getReportsInWorkspace(workspaceId: string): Observable<ReportsResponse> {
    return this.http.get<ReportsResponse>(`${environment.apiUrl}/powerbi/workspaces/${workspaceId}/reports`);
  }
}

