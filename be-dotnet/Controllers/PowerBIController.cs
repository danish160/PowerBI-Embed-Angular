using Microsoft.AspNetCore.Mvc;
using be_dotnet.Services;

namespace be_dotnet.Controllers;

[ApiController]
[Route("api")]
public class PowerBIController : ControllerBase
{
    private readonly PowerBIService _powerBIService;
    private readonly ILogger<PowerBIController> _logger;
    private readonly IConfiguration _configuration;

    public PowerBIController(
        PowerBIService powerBIService, 
        ILogger<PowerBIController> logger,
        IConfiguration configuration)
    {
        _powerBIService = powerBIService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Root endpoint - API information
    /// </summary>
    [HttpGet("/")]
    public IActionResult GetApiInfo()
    {
        return Ok(new
        {
            message = "Power BI Embed API Server (.NET)",
            version = "1.0.0",
            framework = ".NET 8.0",
            endpoints = new
            {
                health = "GET /api/health",
                testAuth = "GET /api/test-auth",
                workspaces = "GET /api/powerbi/workspaces",
                workspaceReports = "GET /api/powerbi/workspaces/:workspaceId/reports",
                embedToken = "GET /api/powerbi/workspaces/:workspaceId/reports/:reportId/embed-token",
                tokenCacheStatus = "GET /api/token-cache/status",
                clearTokenCache = "POST /api/token-cache/clear"
            }
        });
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "OK",
            timestamp = DateTime.UtcNow.ToString("o"),
            service = "Power BI Embed API (.NET)"
        });
    }

    /// <summary>
    /// Test Azure AD authentication
    /// </summary>
    [HttpGet("test-auth")]
    public async Task<IActionResult> TestAuth()
    {
        try
        {
            _logger.LogInformation("Testing Azure AD authentication...");
            
            var token = await _powerBIService.GetAzureAdTokenAsync();
            
            _logger.LogInformation("Azure AD token received successfully");

            return Ok(new
            {
                status = "SUCCESS",
                message = "Azure AD authentication working",
                tokenPreview = token.Substring(0, Math.Min(50, token.Length)) + "..."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Authentication test failed");
            return StatusCode(500, new
            {
                status = "FAILED",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get all workspaces the Service Principal has access to
    /// </summary>
    [HttpGet("powerbi/workspaces")]
    public async Task<IActionResult> GetWorkspaces()
    {
        try
        {
            var result = await _powerBIService.GetWorkspacesAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new
            {
                status = "PERMISSION_DENIED",
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetWorkspaces endpoint");
            return StatusCode(500, new
            {
                status = "FAILED",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get all reports in a specific workspace
    /// </summary>
    [HttpGet("powerbi/workspaces/{workspaceId}/reports")]
    public async Task<IActionResult> GetReports(string workspaceId)
    {
        try
        {
            var result = await _powerBIService.GetReportsAsync(workspaceId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new
            {
                status = "PERMISSION_DENIED",
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return StatusCode(404, new
            {
                status = "NOT_FOUND",
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetReports endpoint");
            return StatusCode(500, new
            {
                status = "FAILED",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get embed token for a specific report
    /// </summary>
    [HttpGet("powerbi/workspaces/{workspaceId}/reports/{reportId}/embed-token")]
    public async Task<IActionResult> GetEmbedToken(string workspaceId, string reportId)
    {
        try
        {
            var tenantId = _configuration["TENANT_ID"];
            var clientId = _configuration["CLIENT_ID"];
            var clientSecret = _configuration["CLIENT_SECRET"];

            // Validate required configuration
            if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                _logger.LogError("Missing Azure AD configuration!");
                return StatusCode(500, new
                {
                    error = "Server configuration error",
                    message = "Missing required Azure AD credentials in configuration."
                });
            }

            if (string.IsNullOrEmpty(workspaceId) || string.IsNullOrEmpty(reportId))
            {
                return BadRequest(new
                {
                    error = "Bad Request",
                    message = "Workspace ID and Report ID are required"
                });
            }

            _logger.LogInformation("Getting embed token for Report {ReportId} in Workspace {WorkspaceId}...", 
                reportId, workspaceId);

            var result = await _powerBIService.GetEmbedTokenAsync(workspaceId, reportId);
            
            _logger.LogInformation("Successfully generated embed token");
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetEmbedToken endpoint");
            return StatusCode(500, new
            {
                error = "Failed to generate embed token",
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Get token cache status
    /// </summary>
    [HttpGet("token-cache/status")]
    public IActionResult GetTokenCacheStatus()
    {
        var status = _powerBIService.GetTokenCacheStatus();
        return Ok(status);
    }

    /// <summary>
    /// Clear token cache
    /// </summary>
    [HttpPost("token-cache/clear")]
    public IActionResult ClearTokenCache()
    {
        _powerBIService.ClearTokenCache();
        return Ok(new
        {
            message = "Token cache cleared successfully",
            timestamp = DateTime.UtcNow.ToString("o")
        });
    }
}

