import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PowerbiReportComponent } from './components/powerbi-report/powerbi-report.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PowerbiReportComponent],
  template: `
    <div class="app-container">
      <app-powerbi-report></app-powerbi-report>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  title = 'powerbi-embed-angular';
}

