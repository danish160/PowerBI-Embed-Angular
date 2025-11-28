# Power BI Embed Application

This project consists of two separate applications:
- **Frontend**: Angular application for embedding Power BI reports
- **Backend**: Node.js/Express API for authentication and Power BI token generation

## Project Structure

```
powerbi-embed-angular/
├── fe-angular/          # Angular Frontend Application
│   ├── src/
│   ├── package.json
│   └── node_modules/
├── be-node/             # Node.js Backend API
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
└── README.md
```

## Setup Instructions

### Backend Setup (be-node)

1. Navigate to backend directory:
   ```bash
   cd be-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Or create `.env` with the following:
   ```
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

You need to run both applications simultaneously:

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

**Backend:**
- Node.js
- Express
- Axios
- CORS

## Security Notes

- Never commit `.env` files or credentials to version control
- Keep Service Principal credentials secure on the server-side only
- The frontend never has access to Service Principal credentials
