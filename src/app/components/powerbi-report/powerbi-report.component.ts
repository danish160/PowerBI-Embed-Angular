import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PowerbiService } from '../../services/powerbi.service';
import { 
  PowerBIReportEmbedComponent, 
  PowerBIEmbedModule 
} from 'powerbi-client-angular';
import { IReportEmbedConfiguration, Report, models, service, Embed } from 'powerbi-client';

// Event handler type as per official documentation
type EventHandler = (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null;

@Component({
  selector: 'app-powerbi-report',
  standalone: true,
  imports: [CommonModule, PowerBIEmbedModule, RouterModule],
  templateUrl: './powerbi-report.component.html',
  styleUrls: ['./powerbi-report.component.css']
})
export class PowerbiReportComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(PowerBIReportEmbedComponent) reportComponent?: PowerBIReportEmbedComponent;
  
  workspaceId: string = '';
  reportId: string = '';
  isLoading = true;
  errorMessage = '';
  reportConfig?: IReportEmbedConfiguration;
  reportClass = 'report-container';
  phasedEmbeddingFlag = false;
  
  // Event handlers map as per official documentation
  eventHandlersMap = new Map<string, EventHandler>([
    ['loaded', () => this.onReportLoaded()],
    ['rendered', () => this.onReportRendered()],
    ['error', (event?: service.ICustomEvent<any>) => this.onReportError(event)]
  ]);

  private report?: Report;

  constructor(
    private powerbiService: PowerbiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get workspace ID and report ID from route parameters
    this.route.params.subscribe(params => {
      this.workspaceId = params['workspaceId'];
      this.reportId = params['reportId'];
      
      if (this.workspaceId && this.reportId) {
        console.log(`Loading report ${this.reportId} from workspace ${this.workspaceId}`);
        this.loadReport();
      } else {
        this.errorMessage = 'Invalid route parameters. Workspace ID and Report ID are required.';
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Get the Report instance after view initializes
    if (this.reportComponent) {
      setTimeout(() => {
        try {
          this.report = this.reportComponent?.getReport();
          console.log('Report instance retrieved:', !!this.report);
        } catch (error) {
          console.log('Report not ready yet');
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    // Cleanup handled by powerbi-client-angular component
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.powerbiService.getReportConfig(this.workspaceId, this.reportId).subscribe({
      next: (config) => {
        this.reportConfig = config;
        console.log('Report configuration loaded. Token Type:', config.tokenType === 0 ? 'Embed' : 'Aad');
        console.log('Report ID:', config.id);
        console.log('Embed URL:', config.embedUrl);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load report configuration. Please check backend connection.';
        this.isLoading = false;
        console.error('Config error:', error);
      }
    });
  }

  // Event handler methods
  onReportLoaded(): void {
    this.isLoading = false;
    console.log('✅ Report loaded successfully');
  }

  onReportRendered(): void {
    console.log('✅ Report rendered successfully');
  }

  onReportError(event?: service.ICustomEvent<any>): void {
    const errorDetail = event?.detail;
    console.error('❌ Report error:', errorDetail);
    
    if (errorDetail?.message?.includes('API is not accessible')) {
      this.errorMessage = 'Service Principal APIs are not enabled in Power BI tenant settings. Please contact your Power BI Administrator.';
    } else if (errorDetail?.message) {
      this.errorMessage = `Report error: ${errorDetail.message}`;
    } else {
      this.errorMessage = 'Failed to load report. Please check configuration.';
    }
    
    this.isLoading = false;
  }

  private getReportInstance(): Report | undefined {
    if (!this.report && this.reportComponent) {
      try {
        this.report = this.reportComponent.getReport();
      } catch (error) {
        console.log('Report not ready yet');
      }
    }
    return this.report;
  }

  refreshReport(): void {
    const report = this.getReportInstance();
    if (report) {
      try {
        report.refresh();
        console.log('Report refresh initiated');
      } catch (error) {
        console.error('Refresh error:', error);
        this.errorMessage = 'Failed to refresh report';
      }
    } else {
      console.warn('Report not yet loaded');
    }
  }

  fullscreen(): void {
    const report = this.getReportInstance();
    if (report) {
      try {
        report.fullscreen();
        console.log('Fullscreen mode initiated');
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    } else {
      console.warn('Report not yet loaded');
    }
  }

  print(): void {
    const report = this.getReportInstance();
    if (report) {
      try {
        report.print();
        console.log('Print initiated');
      } catch (error) {
        console.error('Print error:', error);
      }
    } else {
      console.warn('Report not yet loaded');
    }
  }

  retryLoad(): void {
    this.reportConfig = undefined;
    this.loadReport();
  }
}

