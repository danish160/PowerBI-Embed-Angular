import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkspaceService, Report, Workspace } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.css']
})
export class WorkspaceDetailComponent implements OnInit {
  workspaceId: string = '';
  workspace?: Workspace;
  reports: Report[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.workspaceId = params['workspaceId'];
      this.loadWorkspaceDetails();
      this.loadReports();
    });
  }

  loadWorkspaceDetails(): void {
    // Get workspace details from the list of all workspaces
    this.workspaceService.getWorkspaces().subscribe({
      next: (response) => {
        this.workspace = response.workspaces.find(w => w.id === this.workspaceId);
      },
      error: (error) => {
        console.error('Error loading workspace details:', error);
      }
    });
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.workspaceService.getReportsInWorkspace(this.workspaceId).subscribe({
      next: (response) => {
        this.reports = response.reports;
        this.isLoading = false;
        console.log(`Loaded ${response.reportCount} reports for workspace ${this.workspaceId}`);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load reports from this workspace';
        this.isLoading = false;
        console.error('Error loading reports:', error);
      }
    });
  }

  retryLoad(): void {
    this.loadReports();
  }
}
