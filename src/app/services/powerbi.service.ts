import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as pbi from 'powerbi-client';

export interface PowerBIConfig {
  type: string;
  tokenType: pbi.models.TokenType;
  accessToken: string;
  embedUrl: string;
  id: string;
  settings?: pbi.models.ISettings;
}

export interface EmbedTokenResponse {
  accessToken: string;
  embedUrl: string;
  reportId: string;
  tokenExpiry: string;
  tokenType?: string; // 'Embed' or 'Aad'
}

@Injectable({
  providedIn: 'root'
})
export class PowerbiService {
  private powerbi: pbi.service.Service;

  constructor(private http: HttpClient) {
    this.powerbi = new pbi.service.Service(
      pbi.factories.hpmFactory,
      pbi.factories.wpmpFactory,
      pbi.factories.routerFactory
    );
  }

  /**
   * Get embed token from backend API
   * Note: Credentials are stored securely on backend, not sent from frontend
   */
  getEmbedToken(): Observable<EmbedTokenResponse> {
    // Backend will use credentials from its .env file
    // We only send an empty request to trigger token generation
    return this.http.post<EmbedTokenResponse>(
      `${environment.apiUrl}/powerbi/embed-token`,
      {} // Empty payload - backend uses its own environment variables
    ).pipe(
      catchError(error => {
        console.error('Error getting embed token:', error);
        return throwError(() => new Error('Failed to get Power BI embed token'));
      })
    );
  }

  /**
   * Get Power BI configuration for embedding
   */
  getPowerBIConfig(): Observable<PowerBIConfig> {
    return this.getEmbedToken().pipe(
      map(tokenResponse => {
        // Determine token type (Embed or Aad for Service Principal)
        const tokenType = tokenResponse.tokenType === 'Aad' 
          ? pbi.models.TokenType.Aad 
          : pbi.models.TokenType.Embed;
        
        console.log('Token type:', tokenResponse.tokenType || 'Embed');
        
        const config: PowerBIConfig = {
          type: 'report',
          tokenType: tokenType,
          accessToken: tokenResponse.accessToken,
          embedUrl: tokenResponse.embedUrl,
          id: tokenResponse.reportId,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: true
              },
              pageNavigation: {
                visible: true
              }
            },
            background: pbi.models.BackgroundType.Transparent,
            layoutType: pbi.models.LayoutType.Custom,
            customLayout: {
              displayOption: pbi.models.DisplayOption.FitToWidth
            }
          }
        };
        return config;
      })
    );
  }

  /**
   * Embed Power BI report in container
   */
  embedReport(
    containerElement: HTMLElement,
    config: PowerBIConfig
  ): pbi.Embed {
    // Reset container
    this.powerbi.reset(containerElement);

    // Embed the report
    const report = this.powerbi.embed(containerElement, config);

    // Handle events
    report.on('loaded', () => {
      console.log('Report loaded successfully');
    });

    report.on('rendered', () => {
      console.log('Report rendered successfully');
    });

    report.on('error', (event) => {
      const errorDetail = (event as any).detail;
      console.error('Report error:', errorDetail);
    });

    return report;
  }

  /**
   * Get Power BI service instance
   */
  getPowerBIService(): pbi.service.Service {
    return this.powerbi;
  }
}

