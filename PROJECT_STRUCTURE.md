# Power BI Embed - Project Structure

## Overview

This project has been restructured into two separate, independent applications:

```
powerbi-embed-angular/
├── fe-angular/          # Frontend Application (Angular)
├── be-node/             # Backend Application (Node.js/Express)
├── .gitignore           # Root level ignore rules
├── README.md            # Project documentation
├── start-all.bat        # Start both apps
├── start-backend.bat    # Start backend only
└── start-frontend.bat   # Start frontend only
```

## Frontend Application (fe-angular/)

### Structure
```
fe-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/
│   │   │   ├── navigation/
│   │   │   ├── powerbi-report/
│   │   │   └── workspace-detail/
│   │   ├── services/
│   │   │   ├── powerbi.service.ts
│   │   │   └── workspace.service.ts
│   │   ├── app.component.*
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
├── .gitignore
└── node_modules/
```

### Commands
```bash
cd fe-angular
npm install          # Install dependencies
npm start            # Start dev server (port 4201)
npm run build        # Build for production
```

### Configuration
- **API URL**: Configured in `src/environments/environment.ts`
- **Port**: 4201 (configured in `angular.json`)

## Backend Application (be-node/)

### Structure
```
be-node/
├── server.js          # Main Express server
├── .env               # Environment variables (credentials)
├── .env.example       # Template for .env
├── package.json       # Node dependencies
├── .gitignore
└── node_modules/
```

### Commands
```bash
cd be-node
npm install          # Install dependencies
npm start            # Start server (port 3000)
npm run dev          # Start with nodemon (auto-reload)
```

### Configuration
- **Environment Variables**: Stored in `.env` file
  - `TENANT_ID`: Azure AD Tenant ID
  - `CLIENT_ID`: Service Principal Client ID  
  - `CLIENT_SECRET`: Service Principal Client Secret
  - `PORT`: Server port (default: 3000)

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/powerbi/workspaces` - List all workspaces
- `GET /api/powerbi/workspaces/:workspaceId/reports` - List reports in workspace
- `GET /api/powerbi/workspaces/:workspaceId/reports/:reportId/embed-token` - Get embed token
- `GET /api/token-cache/status` - Token cache status
- `POST /api/token-cache/clear` - Clear token cache

## Running the Application

### Option 1: Use Batch Scripts (Windows)

**Start Both Applications:**
```batch
start-all.bat
```
This opens two command windows - one for backend, one for frontend.

**Start Individual Applications:**
```batch
start-backend.bat    # Backend only
start-frontend.bat   # Frontend only
```

### Option 2: Manual Start

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

### Option 3: VS Code Tasks (Recommended)

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm start",
      "options": {
        "cwd": "${workspaceFolder}/be-node"
      },
      "isBackground": true
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm start",
      "options": {
        "cwd": "${workspaceFolder}/fe-angular"
      },
      "isBackground": true
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"]
    }
  ]
}
```

## URLs

- **Frontend**: http://localhost:4201
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000 (root endpoint lists all endpoints)

## Development Workflow

### Adding Frontend Features
1. Work in `fe-angular/src/app/`
2. Use `npm start` in `fe-angular` directory
3. Changes auto-reload via Angular dev server

### Modifying Backend API
1. Work in `be-node/server.js`
2. Use `npm run dev` in `be-node` directory (nodemon auto-restarts)
3. Or manually restart with `npm start`

### Installing Dependencies

**Frontend:**
```bash
cd fe-angular
npm install package-name
```

**Backend:**
```bash
cd be-node
npm install package-name
```

## Git Workflow

Each application has its own `.gitignore` file:

- **Root `.gitignore`**: Ignores both `node_modules` and build outputs
- **fe-angular/.gitignore`**: Angular-specific ignores
- **be-node/.gitignore`**: Node.js and `.env` files

This ensures:
- No credentials are committed (`.env` is ignored)
- No dependencies are committed (`node_modules` ignored)
- Build artifacts are ignored

## Key Changes from Original Structure

### What Changed:
- Separate `package.json` for each app
- Separate `node_modules` for each app
- Backend moved from `server/server.js` to `be-node/server.js`
- Frontend now in dedicated `fe-angular/` folder

### What Stayed the Same:
- API endpoints (same URLs)
- Frontend environment configuration
- Backend `.env` configuration
- All application functionality

### Benefits:
- Independent deployment (deploy frontend/backend separately)
- Cleaner dependency management
- Better separation of concerns
- Easier to dockerize individual apps
- Can version independently

## Troubleshooting

**Backend won't start:**
- Check `.env` file exists in `be-node/`
- Verify credentials are correct
- Check port 3000 is available

**Frontend can't connect to backend:**
- Verify backend is running on port 3000
- Check `fe-angular/src/environments/environment.ts` has correct API URL
- Check CORS settings in `be-node/server.js`

**Dependencies issues:**
- Delete `node_modules` in the specific app folder
- Delete `package-lock.json` if it exists
- Run `npm install` again

