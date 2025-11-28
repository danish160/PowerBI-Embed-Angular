using System.Text;
using System.Text.Json;
using be_dotnet.Models;

namespace be_dotnet.Services;

public class PowerBIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PowerBIService> _logger;
    
    // Token cache (in-memory, server-side)
    private static string? _cachedToken = null;
    private static DateTime? _tokenExpiresAt = null;

    public PowerBIService(
        HttpClient httpClient, 
        IConfiguration configuration,
        ILogger<PowerBIService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Get Azure AD token using Service Principal credentials
    /// Token caching is disabled - always fetches fresh token
    /// </summary>
    public async Task<string> GetAzureAdTokenAsync()
    {
        // CACHING DISABLED - Always fetch new token
        _logger.LogInformation("🔄 Fetching new Azure AD token (caching disabled)...");

        var tenantId = _configuration["TENANT_ID"];
        var clientId = _configuration["CLIENT_ID"];
        var clientSecret = _configuration["CLIENT_SECRET"];

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            throw new InvalidOperationException("Missing Azure AD credentials in configuration");
        }

        var url = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";

        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            {"grant_type", "client_credentials"},
            {"client_id", clientId},
            {"client_secret", clientSecret},
            {"scope", "https://analysis.windows.net/powerbi/api/.default"}
        });

        try
        {
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Azure AD token request failed: {StatusCode} - {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to get Azure AD token: {response.StatusCode}");
            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<AzureAdTokenResponse>();
            
            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException("Invalid token response from Azure AD");
            }

            // Cache token for status endpoint (but don't use it)
            _cachedToken = tokenResponse.AccessToken;
            _tokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);

            _logger.LogInformation("✅ New Azure AD token fetched (caching disabled)");

            return tokenResponse.AccessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Azure AD token");
            throw new InvalidOperationException("Failed to get Azure AD token", ex);
        }
    }

    /// <summary>
    /// Get Power BI embed token for a specific report
    /// </summary>
    public async Task<EmbedTokenResponse> GetEmbedTokenAsync(string workspaceId, string reportId)
    {
        var accessToken = await GetAzureAdTokenAsync();
        var reportUrl = $"https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports/{reportId}";

        try
        {
            _logger.LogInformation("Fetching report details from Power BI...");
            
            // Get report details including embed URL
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
            
            var reportResponse = await _httpClient.GetAsync(reportUrl);
            
            if (!reportResponse.IsSuccessStatusCode)
            {
                var errorContent = await reportResponse.Content.ReadAsStringAsync();
                _logger.LogError("Failed to get report: {StatusCode} - {Content}", 
                    reportResponse.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to get report details: {reportResponse.StatusCode}");
            }

            var report = await reportResponse.Content.ReadFromJsonAsync<PowerBIReport>();
            
            if (report == null)
            {
                throw new InvalidOperationException("Invalid report response from Power BI API");
            }

            _logger.LogInformation("Report details retrieved: {ReportName}", report.Name);
            _logger.LogInformation("Dataset ID: {DatasetId}", report.DatasetId);
            _logger.LogInformation("Dataset Workspace ID: {DatasetWorkspaceId}", report.DatasetWorkspaceId);

            var datasetWorkspaceId = report.DatasetWorkspaceId ?? workspaceId;
            if (datasetWorkspaceId != workspaceId)
            {
                _logger.LogWarning("⚠️  WARNING: Dataset is in a different workspace!");
                _logger.LogWarning("   Report Workspace: {ReportWorkspace}", workspaceId);
                _logger.LogWarning("   Dataset Workspace: {DatasetWorkspace}", datasetWorkspaceId);
            }

            // Try to generate embed token
            _logger.LogInformation("Generating embed token...");
            _logger.LogInformation("Workspace ID: {WorkspaceId}", workspaceId);
            _logger.LogInformation("Report ID: {ReportId}", reportId);
            _logger.LogInformation("Dataset ID: {DatasetId}", report.DatasetId);

            string embedToken;
            string tokenType = "Embed";
            string tokenExpiry;

            // First try: Simple approach
            try
            {
                var embedTokenUrl = "https://api.powerbi.com/v1.0/myorg/GenerateToken";
                var requestBody = new
                {
                    datasets = new[] { new { id = report.DatasetId } },
                    reports = new[] { new { id = reportId } }
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");

                var embedResponse = await _httpClient.PostAsync(embedTokenUrl, jsonContent);
                
                if (embedResponse.IsSuccessStatusCode)
                {
                    var embedResult = await embedResponse.Content.ReadFromJsonAsync<PowerBIEmbedTokenResponse>();
                    embedToken = embedResult?.Token ?? throw new InvalidOperationException("Empty token received");
                    tokenExpiry = embedResult.Expiration;
                    _logger.LogInformation("✅ Embed token generated successfully (simple method)");
                }
                else
                {
                    throw new HttpRequestException($"Simple method failed: {embedResponse.StatusCode}");
                }
            }
            catch (Exception simpleEx)
            {
                _logger.LogWarning("❌ Simple method failed: {Message}", simpleEx.Message);
                _logger.LogInformation("Trying with targetWorkspaces...");

                try
                {
                    // Second try: With targetWorkspaces
                    var embedTokenUrl = "https://api.powerbi.com/v1.0/myorg/GenerateToken";
                    var requestBody = new
                    {
                        datasets = new[] { 
                            new { 
                                id = report.DatasetId,
                                xmlaPermissions = "ReadOnly"
                            }
                        },
                        reports = new[] { 
                            new { 
                                allowEdit = false,
                                id = reportId 
                            }
                        },
                        targetWorkspaces = new[] {
                            new { id = datasetWorkspaceId }
                        }
                    };

                    var jsonContent = new StringContent(
                        JsonSerializer.Serialize(requestBody),
                        Encoding.UTF8,
                        "application/json");

                    var embedResponse = await _httpClient.PostAsync(embedTokenUrl, jsonContent);
                    
                    if (embedResponse.IsSuccessStatusCode)
                    {
                        var embedResult = await embedResponse.Content.ReadFromJsonAsync<PowerBIEmbedTokenResponse>();
                        embedToken = embedResult?.Token ?? throw new InvalidOperationException("Empty token received");
                        tokenExpiry = embedResult.Expiration;
                        _logger.LogInformation("✅ Embed token generated successfully (with targetWorkspaces)");
                    }
                    else
                    {
                        throw new HttpRequestException($"Both methods failed: {embedResponse.StatusCode}");
                    }
                }
                catch (Exception)
                {
                    // Third try: Use Azure AD token directly (Service Principal mode)
                    _logger.LogWarning("❌ Both methods failed. Using Service Principal token directly...");
                    _logger.LogWarning("⚠️  This requires 'Service principals can use Power BI APIs' to be enabled in tenant settings");
                    
                    embedToken = accessToken;
                    tokenType = "Aad";
                    tokenExpiry = DateTime.UtcNow.AddHours(1).ToString("o");
                    _logger.LogInformation("ℹ️  Using Service Principal token directly (Aad token type)");
                }
            }

            return new EmbedTokenResponse
            {
                AccessToken = embedToken,
                EmbedUrl = report.EmbedUrl,
                ReportId = report.Id,
                TokenExpiry = tokenExpiry,
                TokenType = tokenType
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Power BI embed token");
            throw new InvalidOperationException("Failed to get Power BI embed token", ex);
        }
    }

    /// <summary>
    /// Get all workspaces the Service Principal has access to
    /// </summary>
    public async Task<WorkspacesApiResponse> GetWorkspacesAsync()
    {
        _logger.LogInformation("Getting list of workspaces...");

        var accessToken = await GetAzureAdTokenAsync();
        
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

        try
        {
            var response = await _httpClient.GetAsync("https://api.powerbi.com/v1.0/myorg/groups");
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Error getting workspaces: {StatusCode} - {Content}", 
                    response.StatusCode, errorContent);
                
                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    throw new UnauthorizedAccessException("Token does not have Workspace.Read.All permission. Add 'Workspace.Read.All' permission to your Azure AD App Registration.");
                }
                
                throw new HttpRequestException($"Failed to get workspaces: {response.StatusCode}");
            }

            var workspacesResponse = await response.Content.ReadFromJsonAsync<WorkspacesResponse>();
            
            if (workspacesResponse == null)
            {
                throw new InvalidOperationException("Invalid workspaces response from Power BI API");
            }

            _logger.LogInformation("✅ Found {Count} workspace(s)", workspacesResponse.Value.Count);

            return new WorkspacesApiResponse
            {
                Status = "SUCCESS",
                WorkspaceCount = workspacesResponse.Value.Count,
                Workspaces = workspacesResponse.Value
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workspaces");
            throw;
        }
    }

    /// <summary>
    /// Get all reports in a specific workspace
    /// </summary>
    public async Task<ReportsApiResponse> GetReportsAsync(string workspaceId)
    {
        _logger.LogInformation("Getting reports for workspace: {WorkspaceId}...", workspaceId);

        var accessToken = await GetAzureAdTokenAsync();
        
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

        try
        {
            var url = $"https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports";
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Error getting reports: {StatusCode} - {Content}", 
                    response.StatusCode, errorContent);
                
                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    throw new UnauthorizedAccessException("Token does not have Report.Read.All permission");
                }
                
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new KeyNotFoundException("Workspace not found or no access");
                }
                
                throw new HttpRequestException($"Failed to get reports: {response.StatusCode}");
            }

            var reportsResponse = await response.Content.ReadFromJsonAsync<ReportsResponse>();
            
            if (reportsResponse == null)
            {
                throw new InvalidOperationException("Invalid reports response from Power BI API");
            }

            _logger.LogInformation("✅ Found {Count} report(s) in workspace {WorkspaceId}", 
                reportsResponse.Value.Count, workspaceId);

            return new ReportsApiResponse
            {
                Status = "SUCCESS",
                WorkspaceId = workspaceId,
                ReportCount = reportsResponse.Value.Count,
                Reports = reportsResponse.Value
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reports");
            throw;
        }
    }

    /// <summary>
    /// Get token cache status
    /// </summary>
    public TokenCacheStatus GetTokenCacheStatus()
    {
        var now = DateTime.UtcNow;
        var isValid = _cachedToken != null && _tokenExpiresAt.HasValue && _tokenExpiresAt.Value > now;

        return new TokenCacheStatus
        {
            Cached = _cachedToken != null,
            Valid = isValid,
            ExpiresAt = _tokenExpiresAt?.ToString("o"),
            TimeRemainingSeconds = isValid ? (int)(_tokenExpiresAt!.Value - now).TotalSeconds : 0
        };
    }

    /// <summary>
    /// Clear token cache
    /// </summary>
    public void ClearTokenCache()
    {
        _cachedToken = null;
        _tokenExpiresAt = null;
        _logger.LogInformation("🗑️ Token cache cleared");
    }
}

