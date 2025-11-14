# Power BI Embed - Angular Application

A sample Angular application that demonstrates how to embed Power BI reports using **Service Principal authentication mode**. This application provides a secure way to embed Power BI reports by handling authentication on the server-side.

## 🌟 Features

- ✅ Service Principal authentication (secure server-side)
- ✅ Power BI report embedding with full interactivity
- ✅ Report controls (Refresh, Fullscreen, Print)
- ✅ Beautiful, modern UI with responsive design
- ✅ Error handling and loading states
- ✅ Environment-based configuration
- ✅ Standalone components (Angular 17+)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v17 or higher)

```bash
npm install -g @angular/cli
```

## 🔐 Power BI Service Principal Setup

### 1. Register an Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Enter a name (e.g., "PowerBI-Embed-App")
5. Click **Register**

### 2. Get Application (Client) ID and Tenant ID

- Copy the **Application (client) ID**
- Copy the **Directory (tenant) ID**

### 3. Create a Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and set expiration
4. Copy the **Value** (this is your client secret)

⚠️ **Important**: Save the client secret immediately - you won't be able to see it again!

### 4. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Power BI Service**
4. Add the following delegated permissions:
   - `Dataset.Read.All`
   - `Report.Read.All`
   - `Workspace.Read.All`
5. Click **Grant admin consent**

### 5. Enable Service Principal in Power BI

1. Go to [Power BI Admin Portal](https://app.powerbi.com/admin-portal)
2. Navigate to **Tenant settings**
3. Enable **"Allow service principals to use Power BI APIs"**
4. Add your app to the security group or apply to entire organization

### 6. Grant Workspace Access

1. Go to your Power BI workspace
2. Click **Access**
3. Add your Service Principal (search by app name)
4. Assign at least **Viewer** role (or **Member** for more capabilities)

### 7. Get Workspace and Report IDs

- **Workspace ID**: Found in the URL when viewing your workspace
  - `https://app.powerbi.com/groups/{WORKSPACE_ID}/...`
- **Report ID**: Found in the URL when viewing a report
  - `https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/...`

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
cd PowerBI-Embed-Angular
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

#### Option A: Using Environment Files (Recommended for Development)

Edit `src/environments/environment.ts` with your credentials:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  powerbi: {
    tenantId: 'YOUR_TENANT_ID',
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    workspaceId: 'YOUR_WORKSPACE_ID',
    reportId: 'YOUR_REPORT_ID'
  }
};
```

#### Option B: Using .env File (Recommended for Production)

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your actual values:

```env
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here
WORKSPACE_ID=your-workspace-id-here
REPORT_ID=your-report-id-here
PORT=3000
```

⚠️ **Security Note**: Never commit `.env` or `environment.ts` files with real credentials to version control!

## 🎯 Running the Application

### Step 1: Start the Backend API Server

The backend server handles Service Principal authentication securely.

```bash
npm run start:server
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║   Power BI Embed API Server                              ║
║   Status: Running                                         ║
║   Port: 3000                                              ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 2: Start the Angular Development Server

Open a **new terminal** and run:

```bash
npm start
```

Or:

```bash
ng serve
```

The application will be available at: **http://localhost:4200**

## 🏗️ Building for Production

### Build the Angular Application

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy

1. **Frontend**: Deploy the `dist/powerbi-embed-angular` folder to any static hosting service (Azure Static Web Apps, Netlify, Vercel, etc.)

2. **Backend**: Deploy the `server/` directory to a Node.js hosting service (Azure App Service, Heroku, AWS Elastic Beanstalk, etc.)

3. **Update Configuration**: Update `environment.prod.ts` with your production API URL

## 📁 Project Structure

```
PowerBI-Embed-Angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── powerbi-report/
│   │   │       ├── powerbi-report.component.ts
│   │   │       ├── powerbi-report.component.html
│   │   │       └── powerbi-report.component.css
│   │   ├── services/
│   │   │   └── powerbi.service.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── server/
│   └── server.js
├── angular.json
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Configuration Options

### Power BI Service (`src/app/services/powerbi.service.ts`)

You can customize the embed settings:

```typescript
settings: {
  panes: {
    filters: {
      expanded: false,  // Filter pane collapsed by default
      visible: true     // Show filter pane
    },
    pageNavigation: {
      visible: true     // Show page navigation
    }
  },
  background: pbi.models.BackgroundType.Transparent,
  layoutType: pbi.models.LayoutType.Custom,
  customLayout: {
    displayOption: pbi.models.DisplayOption.FitToWidth
  }
}
```

### CORS Configuration

If you need to allow specific origins, update `server/server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:4200', 'https://your-domain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Angular development server |
| `npm run build` | Build Angular app for production |
| `npm run watch` | Build and watch for changes |
| `npm run start:server` | Start backend API server |
| `npm test` | Run unit tests |

## 🐛 Troubleshooting

### Issue: "Failed to get Azure AD token"

**Solutions:**
- Verify your Tenant ID, Client ID, and Client Secret are correct
- Ensure the client secret hasn't expired
- Check that API permissions are granted and admin consent is given

### Issue: "Failed to get Power BI embed token"

**Solutions:**
- Verify Workspace ID and Report ID are correct
- Ensure Service Principal has access to the workspace (at least Viewer role)
- Check that the report exists and is published

### Issue: "CORS Error"

**Solutions:**
- Ensure the backend server is running on port 3000
- Check that `apiUrl` in environment.ts matches your backend URL
- Verify CORS is properly configured in server.js

### Issue: "Report not loading"

**Solutions:**
- Check browser console for errors
- Verify all credentials in environment files
- Ensure Service Principal is enabled in Power BI tenant settings
- Test the backend API endpoint directly: `http://localhost:3000/api/health`

### Issue: "Module not found" errors

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Endpoints

### Backend API

#### `GET /`
Returns API information

#### `GET /api/health`
Health check endpoint

#### `POST /api/powerbi/embed-token`
Get embed token for Power BI report

**Request Body:**
```json
{
  "tenantId": "string",
  "clientId": "string",
  "clientSecret": "string",
  "workspaceId": "string",
  "reportId": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "embedUrl": "string",
  "reportId": "string",
  "tokenExpiry": "string"
}
```

## 🔒 Security Best Practices

1. ✅ **Never expose Service Principal credentials in frontend code**
2. ✅ **Always handle authentication server-side**
3. ✅ **Use environment variables for sensitive data**
4. ✅ **Add `.env` and environment files to `.gitignore`**
5. ✅ **Rotate client secrets regularly**
6. ✅ **Use HTTPS in production**
7. ✅ **Implement rate limiting on backend API**
8. ✅ **Apply principle of least privilege for Service Principal permissions**

## 📖 Additional Resources

- [Power BI Embedded Documentation](https://docs.microsoft.com/en-us/power-bi/developer/embedded/)
- [Power BI Client Library](https://github.com/microsoft/PowerBI-JavaScript)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Service Principal in Power BI](https://docs.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal)

## 📝 License

This project is provided as-is for demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Created with ❤️ for Power BI Embedded Development**

