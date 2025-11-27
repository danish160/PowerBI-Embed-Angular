import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { models, IReportEmbedConfiguration } from 'powerbi-client';

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

  constructor(private http: HttpClient) { }

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
   * Get Power BI embed configuration for powerbi-client-angular
   */
  getReportConfig(): Observable<IReportEmbedConfiguration> {
    return this.getEmbedToken().pipe(
      map(tokenResponse => {
        // Determine token type (Embed or Aad for Service Principal)
        const tokenType = tokenResponse.tokenType === 'Aad' 
          ? models.TokenType.Aad 
          : models.TokenType.Embed;
        
        console.log('Token type:', tokenResponse.tokenType || 'Embed');
        
        const config: IReportEmbedConfiguration = {
          type: 'report',
          tokenType: tokenType,
          accessToken: tokenResponse.accessToken,
          embedUrl: tokenResponse.embedUrl,
          id: tokenResponse.reportId,
          permissions: models.Permissions.Read,
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
            background: models.BackgroundType.Transparent,
            layoutType: models.LayoutType.Custom,
            customLayout: {
              displayOption: models.DisplayOption.FitToWidth
            }
          }
        };
        return config;
      })
    );
  }
}

