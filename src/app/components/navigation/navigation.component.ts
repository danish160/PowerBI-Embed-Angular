import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkspaceService, Workspace } from '../../services/workspace.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  workspaces: Workspace[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private workspaceService: WorkspaceService) {}

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.isLoading = true;
    this.workspaceService.getWorkspaces().subscribe({
      next: (response) => {
        this.workspaces = response.workspaces;
        this.isLoading = false;
        console.log('Loaded workspaces:', this.workspaces.length);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load workspaces';
        this.isLoading = false;
        console.error('Error loading workspaces:', error);
      }
    });
  }
}
