# Power BI Embed Application

This project consists of a frontend and your choice of TWO backend implementations:
- **Frontend**: Angular application for embedding Power BI reports
- **Backend Option 1**: Node.js/Express API (JavaScript)
- **Backend Option 2**: .NET 8 Web API (C#)

Both backends provide identical functionality - choose whichever fits your team better!

## Project Structure

```
powerbi-embed-angular/
├── fe-angular/          # Angular Frontend Application
│   ├── src/
│   ├── package.json
│   └── node_modules/
├── be-node/             # Node.js Backend API (Option 1)
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
├── be-dotnet/           # .NET Backend API (Option 2)
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── Program.cs
│   ├── .env
│   └── be-dotnet.csproj
├── README.md
└── BACKEND_SWITCHING_GUIDE.md
```

## Setup Instructions

### Backend Setup (Choose One)

#### Option A: Node.js Backend (be-node)

1. Navigate to backend directory:
   ```bash
   cd be-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Create .env file
   TENANT_ID=your_tenant_id
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend API will run on `http://localhost:3000`

#### Option B: .NET Backend (be-dotnet)

1. Navigate to backend directory:
   ```bash
   cd be-dotnet
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Configure environment variables:
   ```bash
   # Create .env file (same format as Node.js)
   TENANT_ID=your_tenant_id
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   dotnet run
   ```

   The backend API will run on `http://localhost:3000`

**See [BACKEND_SWITCHING_GUIDE.md](BACKEND_SWITCHING_GUIDE.md) for more details on choosing and switching between backends.**

### Frontend Setup (fe-angular)

1. Navigate to frontend directory:
   ```bash
   cd fe-angular
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The Angular app will run on `http://localhost:4201`

## Running the Full Application

You need to run both frontend and ONE backend simultaneously:

### Using Node.js Backend

**Terminal 1 - Backend:**
```bash
cd be-node
npm start
```

**Terminal 2 - Frontend:**
```bash
cd fe-angular
npm start
```

### Using .NET Backend

**Terminal 1 - Backend:**
```bash
cd be-dotnet
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd fe-angular
npm start
```

### Using Windows Batch Scripts

**Node.js Backend:**
```bash
start-backend.bat      # Start Node.js backend
start-frontend.bat     # Start frontend
# Or
start-all.bat         # Start both
```

**.NET Backend:**
```bash
start-backend-dotnet.bat  # Start .NET backend
start-frontend.bat        # Start frontend
```

Then open your browser to `http://localhost:4201`

## API Endpoints

The backend exposes the following endpoints:

- `GET /api/health` - Health check
- `GET /api/powerbi/workspaces` - List all workspaces
- `GET /api/powerbi/workspaces/:workspaceId/reports` - List reports in a workspace
- `GET /api/powerbi/workspaces/:workspaceId/reports/:reportId/embed-token` - Get embed token for a report
- `GET /api/token-cache/status` - Check token cache status
- `POST /api/token-cache/clear` - Clear token cache

## Configuration

### Backend (.env)
- `TENANT_ID`: Azure AD Tenant ID
- `CLIENT_ID`: Service Principal Client ID
- `CLIENT_SECRET`: Service Principal Client Secret
- `PORT`: Server port (default: 3000)

### Frontend (environment.ts)
- `apiUrl`: Backend API URL (default: 'http://localhost:3000/api')

## Features

- Browse Power BI workspaces
- View reports in each workspace
- Embed and interact with Power BI reports
- Service Principal authentication
- Secure token management (server-side)

## Technology Stack

**Frontend:**
- Angular 17
- TypeScript
- powerbi-client-angular

**Backend (Node.js):**
- Node.js 18+
- Express 4.18+
- Axios
- CORS

**Backend (.NET):**
- .NET 8
- ASP.NET Core Web API
- HttpClient
- Built-in CORS support

## Security Notes

- Never commit `.env` files or credentials to version control
- Keep Service Principal credentials secure on the server-side only
- The frontend never has access to Service Principal credentials
