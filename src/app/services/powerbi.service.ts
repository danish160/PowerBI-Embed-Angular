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
   * Get embed token from backend API for a specific report
   * @param workspaceId - Power BI Workspace ID
   * @param reportId - Power BI Report ID
   */
  getEmbedToken(workspaceId: string, reportId: string): Observable<EmbedTokenResponse> {
    return this.http.get<EmbedTokenResponse>(
      `${environment.apiUrl}/powerbi/workspaces/${workspaceId}/reports/${reportId}/embed-token`
    ).pipe(
      catchError(error => {
        console.error('Error getting embed token:', error);
        return throwError(() => new Error('Failed to get Power BI embed token'));
      })
    );
  }

  /**
   * Get Power BI embed configuration for powerbi-client-angular
   * @param workspaceId - Power BI Workspace ID
   * @param reportId - Power BI Report ID
   */
  getReportConfig(workspaceId: string, reportId: string): Observable<IReportEmbedConfiguration> {
    return this.getEmbedToken(workspaceId, reportId).pipe(
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

