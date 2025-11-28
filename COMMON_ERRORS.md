# Common Errors & Solutions

This guide helps you quickly resolve common issues when setting up the Power BI Embed Angular application.

## 🔴 Authentication Errors

### Error: "Failed to get Azure AD token"

**Symptoms:**
- Backend logs show "Error getting Azure AD token"
- Frontend shows "Failed to load report configuration"

**Causes & Solutions:**

1. **Invalid Tenant ID**
   - ✅ Verify Tenant ID in Azure Portal → Azure AD → Overview
   - ✅ Ensure it's a valid GUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - ✅ No extra spaces or quotes

2. **Invalid Client ID**
   - ✅ Verify Client ID in Azure Portal → App registrations → Your App
   - ✅ Use Application (client) ID, not Object ID
   - ✅ Ensure it's copied correctly

3. **Invalid/Expired Client Secret**
   - ✅ Check if secret has expired in Azure Portal
   - ✅ Create new secret if needed
   - ✅ Copy the VALUE (not Secret ID)
   - ✅ Update environment.ts immediately

4. **API Permissions Not Granted**
   - ✅ Go to Azure Portal → App registrations → API permissions
   - ✅ Ensure admin consent is granted (green checkmarks)
   - ✅ Wait 5-10 minutes after granting consent

**Test Your Credentials:**
```bash
# Windows PowerShell
$body = @{
    grant_type = "client_credentials"
    client_id = "YOUR_CLIENT_ID"
    client_secret = "YOUR_CLIENT_SECRET"
    scope = "https://analysis.windows.net/powerbi/api/.default"
}
Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token" -Body $body
```

If this fails, your Azure AD configuration needs fixing.

---

### Error: "Unauthorized" or 401 Status

**Symptoms:**
- Backend gets token but Power BI API returns 401
- Error message: "Unauthorized to access report"

**Causes & Solutions:**

1. **Service Principal Not Added to Workspace**
   - ✅ Open Power BI workspace
   - ✅ Click "Access"
   - ✅ Add your Service Principal (search by app name)
   - ✅ Assign at least "Viewer" role

2. **Wrong Workspace ID or Report ID**
   - ✅ Check workspace URL: `https://app.powerbi.com/groups/WORKSPACE_ID/...`
   - ✅ Check report URL: `.../reports/REPORT_ID/...`
   - ✅ Ensure you're using the correct IDs

3. **Service Principal Not Enabled in Tenant**
   - ✅ Go to Power BI Admin Portal
   - ✅ Tenant settings → Developer settings
   - ✅ Enable "Allow service principals to use Power BI APIs"
   - ✅ Apply to entire organization or specific security group

---

## 🌐 Network & Server Errors

### Error: "CORS Error" or "Access-Control-Allow-Origin"

**Symptoms:**
- Browser console shows CORS error
- Network request blocked by CORS policy

**Solutions:**

1. **Backend Not Running**
   - ✅ Navigate to backend: `cd be-node`
   - ✅ Start server: `npm start`
   - ✅ Verify server shows "Running on port 3000"
   - ✅ Check for ✅ next to environment variables

2. **Wrong API URL**
   - ✅ Check `fe-angular/src/environments/environment.ts`
   - ✅ Verify `apiUrl: 'http://localhost:3000/api'`
   - ✅ Ensure no typos (common: `/api` missing)

3. **Port Conflict**
   - ✅ Check if another app is using port 3000 or 4201
   - ✅ Change port in `be-node/.env` (PORT=3001)
   - ✅ Update `fe-angular/angular.json` for frontend port
   - ✅ Restart both servers

4. **CORS Not Configured**
   - ✅ Check `be-node/server.js` has `app.use(cors())`
   - ✅ Ensure cors package is installed
   - ✅ Verify backend allows port 4201

**Quick Test:**
```bash
# Test backend is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"...","service":"Power BI Embed API"}
```

---

### Error: "Cannot GET /api/powerbi/workspaces" or similar

**Symptoms:**
- Backend running but endpoint not found
- 404 or 405 error

**Solutions:**
- ✅ Verify backend is running: `cd be-node && npm start`
- ✅ Check route is defined in `be-node/server.js`
- ✅ Check for typos in URL path
- ✅ Restart backend server
- ✅ Check backend terminal for errors

---

## 📦 Installation & Build Errors

### Error: "Module not found: Error: Can't resolve 'powerbi-client'"

**Symptoms:**
- Angular compilation fails
- Import errors for powerbi-client

**Solutions:**

**Frontend:**
```bash
cd fe-angular
npm install

# If problem persists, clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Specifically install Power BI Angular client
npm install powerbi-client-angular --save
```

**Backend:**
```bash
cd be-node
npm install

# If problem persists
rm -rf node_modules package-lock.json
npm install
```

---

### Error: "Cannot find module 'express'" or similar backend errors

**Symptoms:**
- Backend server won't start
- Missing module errors

**Solutions:**
```bash
# Navigate to backend
cd be-node

# Install backend dependencies
npm install express cors axios dotenv

# Or reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

### Error: "ng: command not found"

**Symptoms:**
- Angular CLI commands don't work
- npm start fails

**Solutions:**
```bash
# Install Angular CLI globally
npm install -g @angular/cli

# Verify installation
ng version

# Alternative: use npx
npx ng serve
```

---

## 🎨 Frontend Display Errors

### Error: "Report container is empty" or blank screen

**Symptoms:**
- Loading spinner disappears
- No report shown
- No error message

**Solutions:**

1. **Check Browser Console**
   - ✅ Open DevTools (F12)
   - ✅ Look for JavaScript errors
   - ✅ Check Network tab for failed requests

2. **Power BI SDK Not Loaded**
   - ✅ Verify powerbi-client-angular is installed in `fe-angular/`
   - ✅ Check import statement in `fe-angular/src/app/services/powerbi.service.ts`
   - ✅ Restart Angular dev server: `cd fe-angular && npm start`

3. **Invalid Embed Configuration**
   - ✅ Check embedUrl is valid in response
   - ✅ Verify reportId matches actual report
   - ✅ Ensure token is not expired

---

### Error: "TokenExpired" in Report

**Symptoms:**
- Report loads initially
- After ~1 hour, report shows error
- "Token has expired" message

**Solutions:**

1. **Manual Refresh**
   - ✅ Click the "Refresh" button
   - ✅ This gets a new token

2. **Implement Auto-Refresh** (code modification needed)
```typescript
// In powerbi-report.component.ts
ngOnInit(): void {
  this.loadReport();
  
  // Refresh token every 50 minutes (before expiry)
  setInterval(() => {
    this.loadReport();
  }, 50 * 60 * 1000);
}
```

---

## 🔐 Permission Errors

### Error: "This content isn't available"

**Symptoms:**
- Report loads but shows this message
- Power BI displays permission error

**Solutions:**

1. **Check Report Permissions**
   - ✅ Verify Service Principal has access to workspace
   - ✅ Check report isn't deleted or moved
   - ✅ Ensure workspace is active (not archived)

2. **Check Embed Token Permissions**
   - ✅ Verify GenerateToken includes correct report ID
   - ✅ Check accessLevel is set to 'View'
   - ✅ Ensure token generation succeeded

---

### Error: "You don't have permission to view this report"

**Symptoms:**
- Clear permission denied message
- Report exists but can't be accessed

**Solutions:**
- ✅ Add Service Principal to workspace with Viewer+ role
- ✅ Verify Service Principal hasn't been removed
- ✅ Check if workspace was recently changed
- ✅ Ensure you're using correct workspace ID

---

## ⚙️ Configuration Errors

### Error: "Missing required parameters" or environment variable errors

**Symptoms:**
- Backend returns 400 error or won't start
- "Missing required parameters" in response
- ❌ shown next to environment variables in backend logs

**Solutions:**
```bash
# Check be-node/.env file exists and has ALL fields:
TENANT_ID=your_tenant_id_here
CLIENT_ID=your_client_id_here  
CLIENT_SECRET=your_client_secret_here
PORT=3000

# Common issues:
# ✅ File must be named exactly ".env" (with dot)
# ✅ File must be in be-node/ directory
# ✅ No quotes around values
# ✅ No spaces around = sign
# ✅ Restart backend after editing .env
```

---

### Error: Environment file not updating

**Symptoms:**
- Changed `.env` or `environment.ts` but app still uses old values
- Updates not reflected in running app

**Solutions:**

**Backend (.env changes):**
```bash
# Stop backend server (Ctrl+C)
cd be-node
npm start
# .env is read at startup - must restart!
```

**Frontend (environment.ts changes):**
```bash
# Stop Angular dev server (Ctrl+C)
cd fe-angular
npm start
# Or Angular will auto-reload on file changes
```

**Browser:**
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache
- ✅ Open DevTools → Network tab → Disable cache

---

## 🖥️ Development Server Errors

### Error: "Port 4201 is already in use"

**Solutions:**
```bash
# Windows - find and kill process
Get-NetTCPConnection -LocalPort 4201 -ErrorAction SilentlyContinue
# Note the PID, then:
Stop-Process -Id <PID> -Force

# Or use different port
cd fe-angular
ng serve --port 4202
# Then update backend CORS to allow port 4202
```

---

### Error: "Port 3000 is already in use"

**Solutions:**
```bash
# Windows - find and kill process
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
# Note the PID, then:
Stop-Process -Id <PID> -Force

# Or change port in be-node/.env
PORT=3001

# Then update fe-angular/src/environments/environment.ts
apiUrl: 'http://localhost:3001/api'
```

---

### Kill Multiple Ports at Once (Windows)
```powershell
# Kill processes on both ports
$processIds = (Get-NetTCPConnection -LocalPort 3000,4201 -ErrorAction SilentlyContinue).OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -Unique
if ($processIds) { Get-Process -Id $processIds | Stop-Process -Force }
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging

**Backend (be-node/server.js):**
The backend already has detailed logging! Check your backend terminal for:
- ✅/❌ Environment variable status
- 🔄 Azure AD token requests
- 📊 Power BI API calls
- ⚠️ Warnings and errors

**Frontend (fe-angular/src/app/services/powerbi.service.ts):**
```typescript
getEmbedToken(workspaceId: string, reportId: string): Observable<any> {
  console.log('🔑 Requesting embed token...');
  console.log('📊 Workspace ID:', workspaceId);
  console.log('📄 Report ID:', reportId);
  console.log('📍 API URL:', environment.apiUrl);
  // ... rest of code
}
```

### Test Backend Independently

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test Azure AD authentication
curl http://localhost:3000/api/test-auth

# Test workspace discovery
curl http://localhost:3000/api/powerbi/workspaces

# Test reports in workspace (replace WORKSPACE_ID)
curl http://localhost:3000/api/powerbi/workspaces/WORKSPACE_ID/reports

# Test embed token generation (replace IDs)
curl http://localhost:3000/api/powerbi/workspaces/WORKSPACE_ID/reports/REPORT_ID/embed-token
```

---

## 📋 Error Message Quick Reference

| Error Message | Most Likely Cause | Fix |
|--------------|-------------------|-----|
| "Failed to get Azure AD token" | Invalid credentials | Check Tenant/Client ID/Secret |
| "Failed to get Power BI embed token" | Permission issue | Add SP to workspace |
| "CORS error" | Backend not running | Start backend server |
| "Module not found" | Missing dependencies | Run `npm install` |
| "Token expired" | Token too old | Click refresh button |
| "Cannot POST /api/..." | Route not found | Check URL path, restart server |
| "Port already in use" | Port conflict | Kill process or change port |
| "This content isn't available" | No access to report | Verify SP permissions |

---

## 🆘 Still Stuck?

### Checklist Before Asking for Help

1. ✅ Read error message carefully
2. ✅ Check browser console (F12)
3. ✅ Check backend terminal output
4. ✅ Verify all prerequisites met (GETTING_STARTED_CHECKLIST.md)
5. ✅ Test credentials with curl/PowerShell
6. ✅ Restart both servers
7. ✅ Clear browser cache

### Information to Provide When Seeking Help

- Error message (full text)
- Browser console output
- Backend terminal output
- Steps that led to error
- What you've already tried
- Environment (OS, Node version, npm version)

---

**Remember: Most errors are due to configuration issues. Double-check all IDs and credentials!** ✨

