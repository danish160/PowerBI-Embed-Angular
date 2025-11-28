import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkspaceService, Workspace } from '../../services/workspace.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  workspaces: Workspace[] = [];
  isLoading = true;

  constructor(private workspaceService: WorkspaceService) {}

  ngOnInit(): void {
    this.workspaceService.getWorkspaces().subscribe({
      next: (response) => {
        this.workspaces = response.workspaces;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading workspaces:', error);
        this.isLoading = false;
      }
    });
  }
}
