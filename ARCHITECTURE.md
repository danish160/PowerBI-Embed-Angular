# Architecture Overview

This document explains the architecture of the Power BI Embed Angular application.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Angular Application (Port 4201)               │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  Home / Navigation / Report Components      │     │    │
│  │  │  - Browse workspaces                        │     │    │
│  │  │  - View reports in workspace                │     │    │
│  │  │  - Embed selected report                    │     │    │
│  │  │  - Manages loading/error states             │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                        │                              │    │
│  │                        ▼                              │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  PowerBI & Workspace Services               │     │    │
│  │  │  - Gets workspaces list from backend        │     │    │
│  │  │  - Gets reports list from backend           │     │    │
│  │  │  - Requests embed token from backend        │     │    │
│  │  │  - Configures Power BI client               │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                        │                              │    │
│  └────────────────────────┼──────────────────────────────┘    │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │ HTTP Requests
                            │ - GET /api/powerbi/workspaces
                            │ - GET /api/powerbi/workspaces/:id/reports
                            │ - GET /api/powerbi/.../embed-token
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API Server (Port 3000)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Express.js REST API (be-node/server.js)             │    │
│  │                                                         │    │
│  │  Endpoints:                                            │    │
│  │  • GET  /api/health                                    │    │
│  │  • GET  /api/test-auth                                 │    │
│  │  • GET  /api/powerbi/workspaces                       │    │
│  │  • GET  /api/powerbi/workspaces/:id/reports           │    │
│  │  • GET  /api/powerbi/workspaces/:wid/reports/:rid/    │    │
│  │         embed-token                                    │    │
│  │  • GET  /api/token-cache/status                       │    │
│  │  • POST /api/token-cache/clear                        │    │
│  │                                                         │    │
│  │  Responsibilities:                                     │    │
│  │  1. Reads Service Principal credentials from .env     │    │
│  │  2. Authenticates with Azure AD                       │    │
│  │  3. Calls Power BI REST API                           │    │
│  │  4. Returns data to frontend                          │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ├─────────────────────┐
                            │                     │
                            ▼                     ▼
        ┌──────────────────────────┐  ┌──────────────────────┐
        │    Azure AD (OAuth)      │  │  Power BI REST API   │
        │                          │  │                      │
        │  - Validates Service     │  │  - Validates token   │
        │    Principal             │  │  - Returns workspaces│
        │  - Issues access token   │  │  - Returns reports   │
        │  - Cached server-side    │  │  - Returns embed     │
        │    (1 hour)              │  │    URL & embed token │
        └──────────────────────────┘  └──────────────────────┘
```

## 🔄 Authentication Flow

### Step-by-Step Process:

1. **User opens the application** in browser (http://localhost:4201)

2. **Angular app initializes** and loads Home Component

3. **Home Component requests workspaces** from Workspace Service:
   ```
   GET http://localhost:3000/api/powerbi/workspaces
   ```

4. **Backend authenticates with Azure AD** (reads credentials from `.env`):
   ```
   POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
   Body: { grant_type, client_id, client_secret, scope }
   ```

5. **Azure AD returns access token** (cached server-side for 1 hour)

6. **Backend calls Power BI API** to get workspaces:
   ```
   GET https://api.powerbi.com/v1.0/myorg/groups
   Authorization: Bearer {azure_ad_token}
   ```

7. **User selects a workspace** → App navigates to `/workspace/:id`

8. **Workspace Detail Component requests reports**:
   ```
   GET http://localhost:3000/api/powerbi/workspaces/{workspaceId}/reports
   ```

9. **Backend calls Power BI API** to get reports:
   ```
   GET https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports
   ```

10. **User clicks "Embed Report"** → App navigates to `/workspace/:wid/report/:rid`

11. **PowerBI Report Component requests embed token**:
    ```
    GET http://localhost:3000/api/powerbi/workspaces/{wid}/reports/{rid}/embed-token
    ```

12. **Backend generates embed token**:
    ```
    GET https://api.powerbi.com/v1.0/myorg/groups/{wid}/reports/{rid}
    POST https://api.powerbi.com/v1.0/myorg/groups/{wid}/reports/{rid}/GenerateToken
    ```

13. **Power BI API returns**:
    - Embed URL
    - Embed token
    - Report metadata

14. **Backend sends response to frontend** with embed configuration

15. **PowerBI Service embeds report** using `powerbi-client-angular`

16. **User interacts with embedded report** directly in browser

## 📦 Component Responsibilities

### Frontend (Angular - fe-angular/)

#### `HomeComponent`
- **Purpose**: Landing page showing available workspaces
- **Features**:
  - Displays workspace cards
  - Click to navigate to workspace details
  - Loading states and error handling

#### `NavigationComponent`
- **Purpose**: Sidebar navigation
- **Features**:
  - Lists available workspaces
  - Active route highlighting
  - Quick workspace switching

#### `WorkspaceDetailComponent`
- **Purpose**: Shows reports within a selected workspace
- **Features**:
  - Displays report cards
  - "Embed Report" button for each report
  - Navigates to report embedding page

#### `PowerbiReportComponent`
- **Purpose**: UI component for displaying the embedded report
- **Features**:
  - Loading spinner
  - Error handling with retry
  - Report controls (refresh, fullscreen, print)
  - Uses `<powerbi-report>` component from `powerbi-client-angular`
- **Lifecycle**:
  - `ngOnInit()`: Loads report based on route parameters
  - `ngAfterViewInit()`: Gets report instance
  - `ngOnDestroy()`: Cleans up event listeners

#### `PowerbiService`
- **Purpose**: Handles Power BI embedding operations
- **Methods**:
  - `getEmbedToken(workspaceId, reportId)`: Fetches token from backend
  - `getReportConfig(workspaceId, reportId)`: Prepares embed configuration
- **Configuration**: Sets up report display options (filters, navigation, layout)

#### `WorkspaceService`
- **Purpose**: Handles workspace and report discovery
- **Methods**:
  - `getWorkspaces()`: Fetches all workspaces from backend
  - `getReports(workspaceId)`: Fetches reports in a workspace from backend

### Backend (Node.js/Express - be-node/)

#### `server.js`
- **Purpose**: Secure server-side authentication and API proxy
- **Key Functions**:
  - `getAzureADToken()`: Authenticates Service Principal with Azure AD
  - `GET /api/powerbi/workspaces`: Lists all workspaces
  - `GET /api/powerbi/workspaces/:id/reports`: Lists reports in workspace
  - `GET /api/powerbi/workspaces/:wid/reports/:rid/embed-token`: Generates embed token
- **Security**: 
  - Reads credentials from `.env` file
  - Keeps Service Principal credentials server-side only
  - Never exposes credentials to frontend
- **Token Management**:
  - Caches Azure AD tokens (can be disabled)
  - Provides cache status and clear endpoints

## 🔐 Security Architecture

### Why Backend is Required

Service Principal credentials **MUST** be kept secure on the server because:

❌ **Never do this**: Store credentials in frontend code
- Anyone can view browser source code
- Credentials would be exposed in network requests
- Security breach waiting to happen

✅ **Always do this**: Handle authentication server-side
- Credentials stay on server
- Frontend only receives short-lived embed tokens
- Tokens expire automatically (typically 1 hour)

### Security Layers

1. **Service Principal Credentials** (Server-side only)
   - Stored in environment variables
   - Never sent to frontend
   - Used only for backend-to-Azure communication

2. **Azure AD Access Token** (Server-side only)
   - Short-lived (1 hour typically)
   - Used to call Power BI REST API
   - Never sent to frontend

3. **Power BI Embed Token** (Sent to frontend)
   - Short-lived (1 hour typically)
   - Scoped to specific report
   - Can only view, cannot modify
   - Safe to use in browser

## 📊 Data Flow Diagram

```
[User Browser]
      ↓
   Request to view report
      ↓
[Angular App] ← Reads → [environment.ts]
      ↓                  (Credentials)
   HTTP POST
      ↓
[Backend API] ← Reads → [.env file]
      ↓                  (Credentials)
   OAuth Request
      ↓
[Azure AD]
      ↓
   Access Token
      ↓
[Backend API]
      ↓
   API Request + Token
      ↓
[Power BI API]
      ↓
   Embed Token + URL
      ↓
[Backend API]
      ↓
   HTTP Response
      ↓
[Angular App]
      ↓
   Embed using Power BI SDK
      ↓
[Power BI JavaScript]
      ↓
   Render Report
      ↓
[User Browser] → User sees and interacts with report
```

## 🛠️ Technology Stack

### Frontend
- **Angular 17+**: Web framework with standalone components
- **TypeScript**: Type-safe JavaScript
- **Power BI Client SDK**: Official Power BI JavaScript library
- **RxJS**: Reactive programming for async operations

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web server framework
- **Axios**: HTTP client for API calls
- **dotenv**: Environment variable management

### Authentication
- **Azure AD**: Identity provider
- **OAuth 2.0**: Client credentials flow
- **Service Principal**: Azure AD application identity

### Power BI
- **Power BI Embedded**: Embedding capability
- **Power BI REST API**: Programmatic access to Power BI
- **Embed Token**: Short-lived access token for reports

## 📈 Scalability Considerations

### Current Architecture (Development)
- Single backend server
- Direct credentials in environment files
- Suitable for: Development, demos, small teams

### Production Recommendations
- **Secret Management**: Use Azure Key Vault or similar
- **Load Balancing**: Multiple backend instances behind load balancer
- **Caching**: Cache embed tokens (they're valid for ~1 hour)
- **Monitoring**: Add Application Insights or similar
- **Rate Limiting**: Prevent API abuse
- **User Authentication**: Add authentication layer for end users

## 🔄 Token Refresh Strategy

Embed tokens expire after ~1 hour. Options for handling:

1. **Manual Refresh** (Current implementation)
   - User clicks "Refresh" button
   - Fetches new token and reloads report

2. **Automatic Refresh** (Recommended for production)
   ```typescript
   // Check token expiry
   // Refresh before expiration
   // Seamlessly update embedded report
   ```

3. **Backend Token Caching**
   ```javascript
   // Cache tokens with expiry
   // Return cached token if still valid
   // Reduces Azure AD calls
   ```

## 📝 Configuration Management

### Development
- Local environment files
- `.env` for backend
- `environment.ts` for frontend

### Production
- Environment variables (Azure App Settings)
- Azure Key Vault for secrets
- CI/CD pipeline injection

---

**This architecture ensures security, scalability, and maintainability while providing a great user experience for embedded Power BI reports.**

