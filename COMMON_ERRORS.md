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
   - ✅ Check if backend server is running: `npm run start:server`
   - ✅ Verify server shows "Running on port 3000"

2. **Wrong API URL**
   - ✅ Check `src/environments/environment.ts`
   - ✅ Verify `apiUrl: 'http://localhost:3000/api'`
   - ✅ Ensure no typos (common: `/api` missing)

3. **Port Conflict**
   - ✅ Check if another app is using port 3000
   - ✅ Change port in server.js and environment.ts
   - ✅ Restart backend server

4. **CORS Not Configured**
   - ✅ Check `server/server.js` has `app.use(cors())`
   - ✅ Ensure cors package is installed

**Quick Test:**
```bash
# Test backend is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"...","service":"Power BI Embed API"}
```

---

### Error: "Cannot POST /api/powerbi/embed-token"

**Symptoms:**
- Backend running but endpoint not found
- 404 or 405 error

**Solutions:**
- ✅ Verify route is defined in server.js: `app.post('/api/powerbi/embed-token'...)`
- ✅ Check for typos in URL path
- ✅ Restart backend server
- ✅ Ensure request uses POST method (not GET)

---

## 📦 Installation & Build Errors

### Error: "Module not found: Error: Can't resolve 'powerbi-client'"

**Symptoms:**
- Angular compilation fails
- Import errors for powerbi-client

**Solutions:**
```bash
# Install dependencies
npm install

# If problem persists, clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Specifically install Power BI client
npm install powerbi-client --save
```

---

### Error: "Cannot find module '@azure/msal-node'"

**Symptoms:**
- Backend server won't start
- Missing module errors

**Solutions:**
```bash
# Install backend dependencies
npm install express cors axios dotenv @azure/msal-node

# Or reinstall everything
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
   - ✅ Verify powerbi-client is installed
   - ✅ Check import statement in powerbi.service.ts
   - ✅ Restart Angular dev server

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

### Error: "Missing required parameters"

**Symptoms:**
- Backend returns 400 error
- "Missing required parameters" in response

**Solutions:**
```typescript
// Check environment.ts has ALL fields:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // ✅ Required
  powerbi: {
    tenantId: 'xxx',      // ✅ Required
    clientId: 'xxx',      // ✅ Required
    clientSecret: 'xxx',  // ✅ Required
    workspaceId: 'xxx',   // ✅ Required
    reportId: 'xxx'       // ✅ Required
  }
};
```

---

### Error: Environment file not updating

**Symptoms:**
- Changed environment.ts but app still uses old values
- Updates not reflected in running app

**Solutions:**
- ✅ Stop Angular dev server (Ctrl+C)
- ✅ Restart: `npm start`
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache

---

## 🖥️ Development Server Errors

### Error: "Port 4200 is already in use"

**Solutions:**
```bash
# Option 1: Kill process using port
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Option 2: Use different port
ng serve --port 4201
```

---

### Error: "Port 3000 is already in use"

**Solutions:**
```bash
# Windows - find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in server.js and environment.ts
const PORT = process.env.PORT || 3001;
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging

**Backend (server.js):**
```javascript
// Add before route handlers
app.use((req, res, next) => {
  console.log('📥 Request:', req.method, req.path);
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  next();
});
```

**Frontend (powerbi.service.ts):**
```typescript
getEmbedToken(): Observable<EmbedTokenResponse> {
  console.log('🔑 Requesting embed token...');
  console.log('📍 API URL:', environment.apiUrl);
  // ... rest of code
}
```

### Test Backend Independently

```bash
# Test with curl or PowerShell
curl -X POST http://localhost:3000/api/powerbi/embed-token \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "workspaceId": "YOUR_WORKSPACE_ID",
    "reportId": "YOUR_REPORT_ID"
  }'
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

