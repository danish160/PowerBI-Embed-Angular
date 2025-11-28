using be_dotnet.Services;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Try to load .env file (optional - falls back to appsettings.json)
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    Env.Load(envPath);
    Console.WriteLine($"✅ Loaded .env file from: {envPath}");
    
    // Only override configuration if environment variables are set
    var envVars = new Dictionary<string, string?>();
    
    var tenantId = Environment.GetEnvironmentVariable("TENANT_ID");
    var clientId = Environment.GetEnvironmentVariable("CLIENT_ID");
    var clientSecret = Environment.GetEnvironmentVariable("CLIENT_SECRET");
    var port = Environment.GetEnvironmentVariable("PORT");
    
    if (!string.IsNullOrEmpty(tenantId)) envVars["TENANT_ID"] = tenantId;
    if (!string.IsNullOrEmpty(clientId)) envVars["CLIENT_ID"] = clientId;
    if (!string.IsNullOrEmpty(clientSecret)) envVars["CLIENT_SECRET"] = clientSecret;
    if (!string.IsNullOrEmpty(port)) envVars["PORT"] = port;
    
    if (envVars.Any())
    {
        builder.Configuration.AddInMemoryCollection(envVars);
        Console.WriteLine("✅ Environment variables from .env file applied");
    }
}
else
{
    Console.WriteLine($"ℹ️  No .env file found - using appsettings.json");
}

// Configure Kestrel to listen on the specified port
var configuredPort = builder.Configuration["PORT"] ?? "3000";
builder.WebHost.UseUrls($"http://localhost:{configuredPort}");

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4201")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add HttpClient and PowerBIService
builder.Services.AddHttpClient<PowerBIService>();
builder.Services.AddScoped<PowerBIService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"{DateTime.UtcNow:yyyy-MM-ddTHH:mm:ss.fffZ} - {context.Request.Method} {context.Request.Path}");
    await next();
});

// IMPORTANT: CORS must be before routing/endpoints
app.UseCors();

// Don't redirect to HTTPS for local development
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Display startup banner
Console.WriteLine(@"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   Power BI Embed API Server (.NET)                            ║
║   Status: Running                                              ║
║   Port: " + configuredPort + @"                                                   ║
║   Time: " + DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss") + @"              ║
║                                                                ║
║   Endpoints:                                                   ║
║   - GET  /                                                     ║
║   - GET  /api/health                                           ║
║   - GET  /api/test-auth                                        ║
║   - GET  /api/powerbi/workspaces                               ║
║   - GET  /api/powerbi/workspaces/:id/reports                   ║
║   - GET  /api/powerbi/workspaces/:id/reports/:id/embed-token   ║
║   - GET  /api/token-cache/status                               ║
║   - POST /api/token-cache/clear                                ║
║                                                                ║
║   Token Caching: DISABLED ⚠️                                   ║
║   (Fetching fresh Azure AD token on every request)            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
");

Console.WriteLine("Environment Variables Status:");
Console.WriteLine($"  TENANT_ID: {(!string.IsNullOrEmpty(builder.Configuration["TENANT_ID"]) ? "✅ Set" : "❌ Missing")}");
Console.WriteLine($"  CLIENT_ID: {(!string.IsNullOrEmpty(builder.Configuration["CLIENT_ID"]) ? "✅ Set" : "❌ Missing")}");
Console.WriteLine($"  CLIENT_SECRET: {(!string.IsNullOrEmpty(builder.Configuration["CLIENT_SECRET"]) ? "✅ Set" : "❌ Missing")}");
Console.WriteLine();

app.Run();
