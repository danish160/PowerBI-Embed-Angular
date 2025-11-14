import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PowerbiService } from '../../services/powerbi.service';
import * as pbi from 'powerbi-client';

@Component({
  selector: 'app-powerbi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './powerbi-report.component.html',
  styleUrls: ['./powerbi-report.component.css']
})
export class PowerbiReportComponent implements OnInit, OnDestroy {
  @ViewChild('reportContainer', { static: true }) reportContainer!: ElementRef;

  isLoading = true;
  errorMessage = '';
  report?: pbi.Embed;

  constructor(private powerbiService: PowerbiService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  ngOnDestroy(): void {
    if (this.report) {
      this.report.off('loaded');
      this.report.off('rendered');
      this.report.off('error');
    }
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.powerbiService.getPowerBIConfig().subscribe({
      next: (config) => {
        try {
          this.report = this.powerbiService.embedReport(
            this.reportContainer.nativeElement,
            config
          );

          // Set up event handlers
          this.report.on('loaded', () => {
            this.isLoading = false;
            console.log('Report loaded');
          });

          this.report.on('rendered', () => {
            console.log('Report rendered');
          });

          this.report.on('error', (event) => {
            const errorDetail = (event as any).detail;
            this.errorMessage = `Report error: ${errorDetail?.message || 'Unknown error'}`;
            this.isLoading = false;
            console.error('Report error:', errorDetail);
          });

        } catch (error) {
          this.errorMessage = 'Failed to embed report';
          this.isLoading = false;
          console.error('Embed error:', error);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load report configuration';
        this.isLoading = false;
        console.error('Config error:', error);
      }
    });
  }

  refreshReport(): void {
    if (this.report) {
      try {
        (this.report as pbi.Report).refresh();
        console.log('Report refresh initiated');
      } catch (error) {
        console.error('Refresh error:', error);
        this.errorMessage = 'Failed to refresh report';
      }
    }
  }

  fullscreen(): void {
    if (this.report) {
      try {
        (this.report as pbi.Report).fullscreen();
        console.log('Fullscreen mode initiated');
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }
  }

  print(): void {
    if (this.report) {
      try {
        (this.report as pbi.Report).print();
        console.log('Print initiated');
      } catch (error) {
        console.error('Print error:', error);
      }
    }
  }

  retryLoad(): void {
    this.loadReport();
  }
}

