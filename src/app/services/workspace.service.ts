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

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(private http: HttpClient) { }

  getWorkspaces(): Observable<WorkspacesResponse> {
    return this.http.get<WorkspacesResponse>(`${environment.apiUrl}/powerbi/workspaces`);
  }
}

