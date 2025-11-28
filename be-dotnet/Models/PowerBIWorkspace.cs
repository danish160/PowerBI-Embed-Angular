using System.Text.Json.Serialization;

namespace be_dotnet.Models;

public class PowerBIWorkspace
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("isReadOnly")]
    public bool IsReadOnly { get; set; }
    
    [JsonPropertyName("isOnDedicatedCapacity")]
    public bool IsOnDedicatedCapacity { get; set; }
    
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
}

public class WorkspacesResponse
{
    [JsonPropertyName("value")]
    public List<PowerBIWorkspace> Value { get; set; } = new();
}

public class WorkspacesApiResponse
{
    public string Status { get; set; } = "SUCCESS";
    public int WorkspaceCount { get; set; }
    public List<PowerBIWorkspace> Workspaces { get; set; } = new();
}

