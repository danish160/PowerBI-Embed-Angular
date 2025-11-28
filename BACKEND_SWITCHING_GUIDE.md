# Backend Switching Guide

This project includes **two** backend implementations that provide identical functionality:

1. **Node.js Backend** (`be-node/`) - JavaScript/Express
2. **.NET Backend** (`be-dotnet/`) - C#/ASP.NET Core 8.0

You can seamlessly switch between them without any changes to the frontend!

## Why Two Backends?

- **Node.js**: Lightweight, fast to iterate, JavaScript ecosystem
- **.NET**: High performance, strong typing, enterprise-ready, better for .NET teams

Both implement the exact same API endpoints and return the same JSON responses.

## Quick Switch

### Currently Using Node.js → Switch to .NET

**Stop Node.js:**
```bash
# In terminal running Node.js backend
Ctrl+C
```

**Start .NET:**
```bash
# Windows
start-backend-dotnet.bat

# Or manually
cd be-dotnet
dotnet run
```

### Currently Using .NET → Switch to Node.js

**Stop .NET:**
```bash
# In terminal running .NET backend
Ctrl+C
```

**Start Node.js:**
```bash
# Windows
start-backend.bat

# Or manually
cd be-node
npm start
```

## Setup Requirements

### Node.js Backend

**Prerequisites:**
- Node.js 18+ installed
- npm installed

**Setup:**
```bash
cd be-node
npm install
```

**Configuration:**
Create `be-node/.env`:
```
TENANT_ID=your_tenant_id
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PORT=3000
```

**Run:**
```bash
npm start
```

### .NET Backend

**Prerequisites:**
- .NET 8 SDK installed

**Setup:**
```bash
cd be-dotnet
dotnet restore
```

**Configuration:**
Create `be-dotnet/.env`:
```
TENANT_ID=your_tenant_id
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PORT=3000
```

**Run:**
```bash
dotnet run
```

## API Compatibility Matrix

All endpoints are **100% compatible** between both backends:

| Endpoint | Node.js | .NET | Response Format |
|----------|---------|------|-----------------|
| `GET /` | ✅ | ✅ | Identical |
| `GET /api/health` | ✅ | ✅ | Identical |
| `GET /api/test-auth` | ✅ | ✅ | Identical |
| `GET /api/powerbi/workspaces` | ✅ | ✅ | Identical |
| `GET /api/powerbi/workspaces/:id/reports` | ✅ | ✅ | Identical |
| `GET /api/powerbi/workspaces/:wid/reports/:rid/embed-token` | ✅ | ✅ | Identical |
| `GET /api/token-cache/status` | ✅ | ✅ | Identical |
| `POST /api/token-cache/clear` | ✅ | ✅ | Identical |

## Configuration Files

Both backends use `.env` files but in different locations:

```
PowerBI-Embed-Angular/
├── be-node/
│   └── .env          # Node.js credentials
└── be-dotnet/
    └── .env          # .NET credentials
```

⚠️ **Important**: You need to create `.env` in BOTH directories if you want to switch between them!

### Quick Setup Both Backends

```bash
# Copy Node.js .env
cd be-node
copy .env.example .env
# Edit .env with your credentials

# Copy .NET .env  
cd ../be-dotnet
# Create .env with same content as be-node/.env
```

Or create a shared `.env` file (advanced):
```bash
# Copy from Node.js to .NET
copy be-node\.env be-dotnet\.env
```

## Frontend Configuration

The Angular frontend connects to whichever backend is running on port 3000.

**No changes needed!** The frontend configuration is the same for both:

```typescript
// fe-angular/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'  // Works with both backends!
};
```

## VS Code Debugging

### Debug Node.js Backend

Already configured in `.vscode/launch.json`:

1. Open VS Code
2. Press F5
3. Select "Launch Backend Server" or "Launch Backend (with nodemon)"

### Debug .NET Backend

To add .NET debugging, update `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    // ... existing Node.js configs ...
    {
      "name": "Launch .NET Backend",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-dotnet",
      "program": "${workspaceFolder}/be-dotnet/bin/Debug/net8.0/be-dotnet.dll",
      "args": [],
      "cwd": "${workspaceFolder}/be-dotnet",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

## Performance Comparison

### Node.js Backend

**Pros:**
- ✅ Fast startup time (~1-2 seconds)
- ✅ Lightweight memory footprint (~50-100 MB)
- ✅ Quick iteration during development
- ✅ JavaScript ecosystem (same language as frontend)
- ✅ npm packages readily available

**Cons:**
- ❌ Single-threaded (unless clustered)
- ❌ Runtime errors (no compile-time checking)
- ❌ Less type safety

### .NET Backend

**Pros:**
- ✅ Compiled code (faster execution)
- ✅ Strong typing (catch errors at compile time)
- ✅ Better performance under load
- ✅ Lower memory usage with high throughput
- ✅ Built-in dependency injection
- ✅ Better async/await support
- ✅ Enterprise-grade framework

**Cons:**
- ❌ Slower startup (~3-5 seconds)
- ❌ Higher initial memory (~100-150 MB)
- ❌ Requires .NET SDK installation

## When to Use Which?

### Use Node.js Backend When:

- 🎯 You're primarily a JavaScript/TypeScript developer
- 🎯 You want quick prototyping and iteration
- 🎯 You need minimal setup (already have Node.js)
- 🎯 Your team is more familiar with Node.js
- 🎯 You're deploying to Node.js-friendly platforms

### Use .NET Backend When:

- 🎯 You're a C#/.NET developer
- 🎯 You need maximum performance
- 🎯 You want strong compile-time type checking
- 🎯 Your organization is .NET-focused
- 🎯 You're deploying to Azure App Service or IIS
- 🎯 You need enterprise features and patterns

## Testing Both Backends

### Test Node.js

```bash
# Start Node.js backend
cd be-node
npm start

# In another terminal
curl http://localhost:3000/api/health
curl http://localhost:3000/api/test-auth
curl http://localhost:3000/api/powerbi/workspaces
```

### Test .NET

```bash
# Start .NET backend
cd be-dotnet
dotnet run

# In another terminal (same commands!)
curl http://localhost:3000/api/health
curl http://localhost:3000/api/test-auth
curl http://localhost:3000/api/powerbi/workspaces
```

### Response should be identical!

Both should return JSON in the same format.

## Production Deployment

### Deploy Node.js Backend

**Platforms:**
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform
- Azure App Service (Node.js)

**Example (Azure):**
```bash
az webapp up --name myapp-node --runtime "NODE:18-lts"
```

### Deploy .NET Backend

**Platforms:**
- Azure App Service (.NET)
- AWS Elastic Beanstalk
- Google Cloud Run (Docker)
- IIS / Windows Server
- Linux with Kestrel

**Example (Azure):**
```bash
cd be-dotnet
dotnet publish -c Release
az webapp deploy --resource-group myRG --name myapp-dotnet --src-path ./bin/Release/net8.0/publish/
```

## Troubleshooting

### Both Backends Won't Run at Same Time

**Error**: `Port 3000 is already in use`

**Solution**: You can only run ONE backend at a time on the same port!

Options:
1. Stop the currently running backend (Ctrl+C)
2. Or run on different ports:
   ```
   # be-node/.env
   PORT=3000
   
   # be-dotnet/.env
   PORT=3001
   
   # Update frontend environment.ts to match the one you're using
   apiUrl: 'http://localhost:3001/api'
   ```

### Authentication Works in Node.js but Not .NET (or vice versa)

**Cause**: Missing or incorrect `.env` file

**Solution**: Ensure BOTH backends have their own `.env` files with correct credentials:
```bash
# Check Node.js
cat be-node/.env

# Check .NET  
cat be-dotnet/.env

# They should have the same credentials!
```

### .NET Backend Shows "Missing Azure AD credentials"

**Cause**: `.env` file not found or not loaded

**Solution**:
1. Ensure `.env` file exists in `be-dotnet/` directory (not in root!)
2. Restart the .NET backend
3. Check console output for "✅ Loaded .env file"

## Hot Reload During Development

### Node.js with Nodemon

```bash
cd be-node
npm run dev  # Auto-restarts on file changes
```

### .NET with Hot Reload

```bash
cd be-dotnet
dotnet watch run  # Auto-restarts on file changes
```

## Which Should You Choose for This Project?

**Recommendation**: 

- **Start with Node.js** if you're learning or prototyping
- **Switch to .NET** if you're:
  - Integrating with an existing .NET application
  - Need maximum performance
  - Your team prefers C#
  - Deploying to enterprise .NET infrastructure

Both are production-ready and fully supported!

## Summary

✅ Both backends are **100% functionally identical**  
✅ Switch between them with **zero frontend changes**  
✅ Use whichever fits your team's expertise better  
✅ Test with both to see which you prefer!  

Happy coding! 🚀

