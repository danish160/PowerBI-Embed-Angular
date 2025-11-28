using System.Text.Json.Serialization;

namespace be_dotnet.Models;

public class AzureAdTokenResponse
{
    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;
    
    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
    
    [JsonPropertyName("ext_expires_in")]
    public int ExtExpiresIn { get; set; }
    
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
}

public class PowerBIEmbedTokenResponse
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
    
    [JsonPropertyName("tokenId")]
    public string TokenId { get; set; } = string.Empty;
    
    [JsonPropertyName("expiration")]
    public string Expiration { get; set; } = string.Empty;
}

public class TokenCacheStatus
{
    public bool Cached { get; set; }
    public bool Valid { get; set; }
    public string? ExpiresAt { get; set; }
    public int TimeRemainingSeconds { get; set; }
}

