# Architecture Overview

This document explains the architecture of the Power BI Embed Angular application.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Angular Application (Port 4200)               │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  PowerBI Report Component                   │     │    │
│  │  │  - Displays embedded report                 │     │    │
│  │  │  - Handles user interactions                │     │    │
│  │  │  - Manages loading/error states             │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                        │                              │    │
│  │                        ▼                              │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  PowerBI Service                            │     │    │
│  │  │  - Requests embed token from backend        │     │    │
│  │  │  - Configures Power BI client               │     │    │
│  │  │  - Embeds report in DOM                     │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                        │                              │    │
│  └────────────────────────┼──────────────────────────────┘    │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │ HTTP Request
                            │ (POST /api/powerbi/embed-token)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API Server (Port 3000)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Express.js REST API                                  │    │
│  │                                                         │    │
│  │  Endpoints:                                            │    │
│  │  • POST /api/powerbi/embed-token                      │    │
│  │  • GET  /api/health                                    │    │
│  │                                                         │    │
│  │  Responsibilities:                                     │    │
│  │  1. Receives Service Principal credentials             │    │
│  │  2. Authenticates with Azure AD                       │    │
│  │  3. Gets Power BI embed token                         │    │
│  │  4. Returns token to frontend                         │    │
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
        │    Principal             │  │  - Returns embed     │
        │  - Issues access token   │  │    URL & embed token │
        └──────────────────────────┘  └──────────────────────┘
```

## 🔄 Authentication Flow

### Step-by-Step Process:

1. **User opens the application** in browser (http://localhost:4200)

2. **Angular app initializes** and loads PowerBI Report Component

3. **Component requests embed configuration** from PowerBI Service

4. **PowerBI Service sends HTTP request to backend** with Service Principal credentials:
   ```
   POST http://localhost:3000/api/powerbi/embed-token
   Body: { tenantId, clientId, clientSecret, workspaceId, reportId }
   ```

5. **Backend authenticates with Azure AD**:
   ```
   POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
   Body: { grant_type, client_id, client_secret, scope }
   ```

6. **Azure AD returns access token** (if credentials are valid)

7. **Backend uses access token to call Power BI API**:
   ```
   GET https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports/{reportId}
   POST https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports/{reportId}/GenerateToken
   ```

8. **Power BI API returns**:
   - Embed URL
   - Embed token
   - Report metadata

9. **Backend sends response to frontend** with embed configuration

10. **PowerBI Service embeds report** using Power BI JavaScript SDK

11. **User interacts with embedded report** directly in browser

## 📦 Component Responsibilities

### Frontend (Angular)

#### `PowerbiReportComponent`
- **Purpose**: UI component for displaying the embedded report
- **Features**:
  - Loading spinner
  - Error handling with retry
  - Report controls (refresh, fullscreen, print)
- **Lifecycle**:
  - `ngOnInit()`: Loads report on component initialization
  - `ngOnDestroy()`: Cleans up event listeners

#### `PowerbiService`
- **Purpose**: Handles all Power BI-related operations
- **Methods**:
  - `getEmbedToken()`: Fetches token from backend
  - `getPowerBIConfig()`: Prepares embed configuration
  - `embedReport()`: Embeds report in DOM element
- **Configuration**: Sets up report display options (filters, navigation, layout)

### Backend (Node.js/Express)

#### `server.js`
- **Purpose**: Secure server-side authentication handler
- **Key Functions**:
  - `getAzureADToken()`: Authenticates Service Principal with Azure AD
  - `getPowerBIEmbedToken()`: Gets embed token from Power BI API
- **Security**: Keeps Service Principal credentials server-side only

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

