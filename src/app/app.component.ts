import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <div class="app-layout">
      <app-navigation class="sidebar"></app-navigation>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    .sidebar {
      flex-shrink: 0;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #f5f5f5;
    }

    @media (max-width: 768px) {
      .app-layout {
        flex-direction: column;
      }

      .main-content {
        height: calc(100vh - 60px);
      }
    }
  `]
})
export class AppComponent {
  title = 'powerbi-embed-angular';
}
