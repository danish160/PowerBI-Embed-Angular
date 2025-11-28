namespace be_dotnet.Models;

public class EmbedTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string EmbedUrl { get; set; } = string.Empty;
    public string ReportId { get; set; } = string.Empty;
    public string TokenExpiry { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Embed";
}

