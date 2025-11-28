# Power BI Embed - .NET Backend

This is the .NET 8 Web API backend for the Power BI Embed application. It provides the same functionality as the Node.js backend (`be-node/`), allowing you to choose which backend to use.

## Features

- ✅ Service Principal Authentication with Azure AD
- ✅ Power BI REST API Integration
- ✅ All endpoints match Node.js backend exactly
- ✅ CORS configured for Angular frontend
- ✅ Comprehensive logging
- ✅ Token caching support (disabled by default)
- ✅ Swagger/OpenAPI documentation

## Prerequisites

- .NET 8 SDK or later
- Azure AD Service Principal credentials
- Power BI workspace access

## Setup

### 1. Install .NET 8 SDK

Download from: https://dotnet.microsoft.com/download/dotnet/8.0

Verify installation:
```bash
dotnet --version
```

### 2. Create `.env` File

Create a `.env` file in the `be-dotnet/` directory:

```bash
# Copy from example
TENANT_ID=your_tenant_id_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
PORT=3000
```

⚠️ **Important**: Never commit the `.env` file to Git! It's already in `.gitignore`.

### 3. Restore NuGet Packages

```bash
cd be-dotnet
dotnet restore
```

### 4. Run the Application

**Development mode:**
```bash
dotnet run
```

**Or build and run:**
```bash
dotnet build
dotnet run
```

The API will start on `http://localhost:3000`

## API Endpoints

All endpoints are identical to the Node.js backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/health` | Health check |
| GET | `/api/test-auth` | Test Azure AD authentication |
| GET | `/api/powerbi/workspaces` | List all workspaces |
| GET | `/api/powerbi/workspaces/:id/reports` | List reports in workspace |
| GET | `/api/powerbi/workspaces/:wid/reports/:rid/embed-token` | Get embed token |
| GET | `/api/token-cache/status` | Check token cache status |
| POST | `/api/token-cache/clear` | Clear token cache |

## Configuration

### Environment Variables (`.env`)

- `TENANT_ID`: Azure AD Tenant ID
- `CLIENT_ID`: Service Principal Client ID
- `CLIENT_SECRET`: Service Principal Client Secret
- `PORT`: Server port (default: 3000)

### appsettings.json

You can also configure settings in `appsettings.json`, but `.env` file takes precedence.

## Switching from Node.js Backend

The .NET backend is a **drop-in replacement** for the Node.js backend:

1. **Same port**: Runs on port 3000 by default
2. **Same endpoints**: All API routes are identical
3. **Same responses**: JSON response formats match exactly
4. **No frontend changes needed**: Angular app works with both backends

### To switch backends:

**Stop Node.js backend:**
```bash
# In be-node/ directory
Ctrl+C to stop the server
```

**Start .NET backend:**
```bash
# In be-dotnet/ directory
dotnet run
```

The Angular frontend will connect to whichever backend is running on port 3000!

## Development

### Project Structure

```
be-dotnet/
├── Controllers/
│   └── PowerBIController.cs    # API endpoints
├── Services/
│   └── PowerBIService.cs       # Business logic
├── Models/
│   ├── EmbedTokenResponse.cs   # Response models
│   ├── PowerBIWorkspace.cs
│   ├── PowerBIReport.cs
│   └── AzureAdTokenResponse.cs
├── Program.cs                   # Application entry point
├── appsettings.json            # Configuration
├── .env                        # Environment variables (create this!)
├── .env.example                # Template for .env
└── README.md                   # This file
```

### Build

```bash
dotnet build
```

### Run Tests (if you add them)

```bash
dotnet test
```

### Publish for Production

```bash
dotnet publish -c Release -o ./publish
```

## Debugging

### Visual Studio Code

1. Open the `be-dotnet/` folder in VS Code
2. Press F5 to start debugging
3. Set breakpoints in your code

### Visual Studio

1. Open `be-dotnet.sln`
2. Press F5 to start debugging

### Check Logs

The application logs detailed information to the console:
- Environment variable status (✅/❌)
- Azure AD authentication requests
- Power BI API calls
- Errors and warnings

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl http://localhost:3000/api/test-auth

# Get workspaces
curl http://localhost:3000/api/powerbi/workspaces
```

## Common Issues

### Port Already in Use

If port 3000 is already in use (e.g., Node.js backend is running):

1. Stop the Node.js backend
2. Or change the port in `.env`:
   ```
   PORT=3001
   ```
3. Update frontend's `environment.ts`:
   ```typescript
   apiUrl: 'http://localhost:3001/api'
   ```

### Missing Dependencies

```bash
dotnet restore
```

### Authentication Errors

Check:
1. `.env` file exists in `be-dotnet/` directory
2. All credentials are correct (no spaces, quotes)
3. Service Principal has correct permissions
4. "Allow service principals to use Power BI APIs" is enabled in tenant

## Performance

### .NET vs Node.js

The .NET backend offers:
- ✅ **Better performance**: Compiled code runs faster
- ✅ **Lower memory usage**: More efficient than Node.js
- ✅ **Strong typing**: Catch errors at compile time
- ✅ **Built-in DI**: Dependency injection out of the box
- ✅ **Async/await**: First-class async support

### Token Caching

Token caching is currently **disabled** for easier debugging. To enable:

1. Open `Services/PowerBIService.cs`
2. Uncomment the caching logic in `GetAzureAdTokenAsync()`
3. Rebuild and restart

## Deployment

### Azure App Service

1. Create an Azure App Service (Windows or Linux)
2. Set environment variables in App Settings:
   - `TENANT_ID`
   - `CLIENT_ID`
   - `CLIENT_SECRET`
3. Deploy using:
   ```bash
   az webapp up --name your-app-name --resource-group your-rg
   ```

### Docker

Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY ./publish .
ENTRYPOINT ["dotnet", "be-dotnet.dll"]
```

Build and run:
```bash
docker build -t powerbi-backend .
docker run -p 3000:3000 powerbi-backend
```

### IIS

1. Build release: `dotnet publish -c Release`
2. Copy `publish/` folder to IIS server
3. Create new IIS site pointing to the folder
4. Ensure Application Pool uses .NET CLR v4.0+

## License

Same as the main project.

## Support

For issues or questions:
1. Check the logs
2. Review COMMON_ERRORS.md in the project root
3. Ensure Azure AD and Power BI are configured correctly

