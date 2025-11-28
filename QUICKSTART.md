# Quick Start Guide

Get your Power BI Embedded Angular app running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (2 minutes)

**Backend:**
```bash
cd be-node
npm install
```

**Frontend:**
```bash
cd fe-angular
npm install
```

### 2. Configure Backend Credentials (2 minutes)

Create `be-node/.env` file:

```bash
TENANT_ID=your_tenant_id_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
PORT=3000
```

⚠️ **Replace the placeholder values with your actual Azure AD Service Principal credentials!**

### 3. Run the Application (1 minute)

**Option A: Use Batch Script (Windows)**
```batch
start-all.bat
```

**Option B: Manual Start**

**Terminal 1** - Start Backend:
```bash
cd be-node
npm start
```

**Terminal 2** - Start Frontend:
```bash
cd fe-angular
npm start
```

**Option C: VS Code Debug**
- Press F5 to start backend with debugging
- Use Tasks: "Start Frontend" to start Angular app

### 4. Open Your Browser

Navigate to: **http://localhost:4201**

You should see a list of your Power BI workspaces! Click on a workspace, then click "Embed Report" to view any report.

## 📍 Where to Find Your Credentials

### Tenant ID & Client ID
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Select your app
4. Copy **Application (client) ID** and **Directory (tenant) ID**

### Client Secret
1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the **Value** immediately (you can't see it again later!)

## ⚠️ Critical Setup Requirement

### Enable Service Principal in Power BI

**This is required for reports to load!**

1. Go to [Power BI Admin Portal](https://app.powerbi.com/admin-portal)
2. Navigate to **Tenant settings** > **Developer settings**
3. Enable **"Allow service principals to use Power BI APIs"**
4. Apply to entire organization or specific security group
5. Click **Apply**

**Without this setting, you'll see 403 Forbidden errors and reports won't load!**

### Grant Workspace Access

1. Open your Power BI workspace
2. Click **Access** or **Workspace access**
3. Add your Service Principal (search by app name)
4. Assign **Viewer**, **Member**, or **Admin** role
5. Click **Add**

## ✅ Verify It's Working

### Backend Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "Power BI Embed API",
  "timestamp": "..."
}
```

### Frontend Check
1. Open http://localhost:4201
2. You should see workspace cards
3. Click a workspace to see reports
4. Click "Embed Report" to view a report

### Backend Logs
Look for these successful messages in backend terminal:
```
✅ TENANT_ID: Set
✅ CLIENT_ID: Set
✅ CLIENT_SECRET: Set
✅ Using cached Azure AD token
```

## ⚠️ Common First-Time Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Verify `.env` file exists in `be-node/` |
| Frontend shows connection error | Make sure backend is running on port 3000 |
| "Unauthorized" error | Check Service Principal credentials |
| Reports show 403 Forbidden | Enable "Service principals can use Power BI APIs" in tenant settings |
| No workspaces show | Add Service Principal to at least one workspace |
| Port already in use | Kill processes on ports 3000 or 4201 |

## 🎯 Port Issues?

### Kill Process on Port 3000 or 4201 (Windows)
```powershell
# Find processes
Get-NetTCPConnection -LocalPort 3000,4201

# Kill them
$processIds = (Get-NetTCPConnection -LocalPort 3000,4201 -ErrorAction SilentlyContinue).OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -Unique
if ($processIds) { Get-Process -Id $processIds | Stop-Process -Force }
```

## 🎉 Next Steps

Once running successfully:
- Navigate through different workspaces
- Embed different reports dynamically
- Customize the UI in `fe-angular/src/app/components/`
- Review ARCHITECTURE.md to understand the flow
- Add user authentication (if needed)
- Plan deployment to production

---

## 📁 Project Structure Quick Reference

```
powerbi-embed-angular/
├── be-node/              # Backend (Node.js/Express)
│   ├── server.js         # Main server file
│   ├── .env              # YOUR CREDENTIALS GO HERE
│   └── package.json
├── fe-angular/           # Frontend (Angular)
│   ├── src/app/          # Angular application
│   └── package.json
└── start-all.bat         # Start both apps
```

---

## 🔑 Security Reminder

- ✅ `.env` file is in `.gitignore` - safe to store credentials locally
- ✅ Frontend NEVER sees Service Principal credentials
- ✅ Backend handles all authentication securely
- ❌ NEVER commit `.env` to version control
- ❌ NEVER put credentials in frontend code

---

## 📊 Features You Get Out of the Box

- ✅ Browse all Power BI workspaces you have access to
- ✅ View reports in each workspace
- ✅ Dynamically embed any report
- ✅ Full report interactivity (filters, drill-through, etc.)
- ✅ Refresh, fullscreen, and print controls
- ✅ Secure Service Principal authentication
- ✅ Server-side token management
- ✅ Modern, responsive UI

---

## 🐛 Debugging Tips

### Check Backend Logs
The backend terminal shows detailed information:
- Environment variable status (✅ or ❌)
- Azure AD authentication status
- Token generation success/failure
- API endpoint calls

### Check Browser Console
Press F12 and look for:
- Network requests to `localhost:3000`
- Any 403 or 401 errors
- Power BI embed errors
- Success messages: "Report loaded successfully"

### Test API Endpoints Directly

**List Workspaces:**
```bash
curl http://localhost:3000/api/powerbi/workspaces
```

**List Reports in Workspace:**
```bash
curl http://localhost:3000/api/powerbi/workspaces/YOUR_WORKSPACE_ID/reports
```

**Get Embed Token:**
```bash
curl http://localhost:3000/api/powerbi/workspaces/WORKSPACE_ID/reports/REPORT_ID/embed-token
```

---

## 📚 More Documentation

- **Complete Setup Guide**: GETTING_STARTED_CHECKLIST.md
- **Detailed Docs**: README.md
- **Configuration Help**: CONFIGURATION_EXAMPLE.md
- **Architecture**: ARCHITECTURE.md
- **Error Solutions**: COMMON_ERRORS.md
- **Project Structure**: PROJECT_STRUCTURE.md
- **Token Caching**: TOKEN_CACHING_GUIDE.md

---

**Need help? Check the full [README.md](README.md) or [COMMON_ERRORS.md](COMMON_ERRORS.md) for detailed troubleshooting!**

🎉 **Happy embedding!** 🚀
