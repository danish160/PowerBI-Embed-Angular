using System.Text.Json.Serialization;

namespace be_dotnet.Models;

public class PowerBIReport
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("webUrl")]
    public string WebUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("embedUrl")]
    public string EmbedUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("datasetId")]
    public string DatasetId { get; set; } = string.Empty;
    
    [JsonPropertyName("datasetWorkspaceId")]
    public string? DatasetWorkspaceId { get; set; }
}

public class ReportsResponse
{
    [JsonPropertyName("value")]
    public List<PowerBIReport> Value { get; set; } = new();
}

public class ReportsApiResponse
{
    public string Status { get; set; } = "SUCCESS";
    public string WorkspaceId { get; set; } = string.Empty;
    public int ReportCount { get; set; }
    public List<PowerBIReport> Reports { get; set; } = new();
}

