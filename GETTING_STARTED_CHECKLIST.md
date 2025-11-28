# Getting Started Checklist ✓

Print this checklist and check off each item as you complete it!

## 📋 Pre-Setup Checklist

### Software Installation
- [ ] Node.js (v18+) installed - Check with: `node --version`
- [ ] npm (v9+) installed - Check with: `npm --version`
- [ ] Angular CLI installed - Check with: `ng version`
- [ ] Code editor installed (VS Code recommended)
- [ ] Git installed (optional) - Check with: `git --version`

### Azure AD Setup
- [ ] Access to Azure Portal (https://portal.azure.com)
- [ ] Permissions to create App Registrations
- [ ] Power BI Pro or Premium license
- [ ] Admin access to Power BI workspace (or someone who can grant it)

---

## 🔧 Azure Configuration Checklist

### Step 1: Create Service Principal
- [ ] Navigate to Azure AD → App registrations
- [ ] Click "New registration"
- [ ] Enter app name (e.g., "PowerBI-Embed-App")
- [ ] Click "Register"
- [ ] **Save Application (client) ID**: `________________________`
- [ ] **Save Directory (tenant) ID**: `________________________`

### Step 2: Create Client Secret
- [ ] Go to "Certificates & secrets"
- [ ] Click "New client secret"
- [ ] Add description (e.g., "PowerBI Embed Secret")
- [ ] Set expiration (6 months, 12 months, or 24 months)
- [ ] Click "Add"
- [ ] **IMMEDIATELY save the Value**: `________________________`
  - ⚠️ You can only see this once!

### Step 3: Configure API Permissions
- [ ] Go to "API permissions"
- [ ] Click "Add a permission"
- [ ] Select "Power BI Service"
- [ ] Choose "Delegated permissions"
- [ ] Add these permissions:
  - [ ] Dataset.Read.All
  - [ ] Report.Read.All
  - [ ] Workspace.Read.All
- [ ] Click "Grant admin consent for [Your Organization]"
- [ ] Verify "Status" shows green checkmark

---

## 📊 Power BI Configuration Checklist

### Step 4: Enable Service Principal in Tenant
- [ ] Go to Power BI Admin Portal (https://app.powerbi.com/admin-portal)
- [ ] Navigate to "Tenant settings"
- [ ] Find "Developer settings" section
- [ ] Enable "Allow service principals to use Power BI APIs"
- [ ] Choose "Apply to" option:
  - [ ] Entire organization, OR
  - [ ] Specific security groups (add your SP)
- [ ] Click "Apply"
- [ ] ⚠️ **CRITICAL**: This must be enabled or reports won't load!

### Step 5: Grant Service Principal Workspace Access
- [ ] Open your Power BI workspace
- [ ] Click "Access" or "Workspace access"
- [ ] Click "Add people or groups"
- [ ] Search for your Service Principal (by app name)
- [ ] Assign role:
  - [ ] Viewer (minimum, read-only)
  - [ ] Member (recommended, more features)
  - [ ] Admin (if needed)
- [ ] Click "Add"

---

## 💻 Application Setup Checklist

### Step 6: Install Backend Dependencies
- [ ] Open terminal in project root
- [ ] Navigate to backend:
  ```bash
  cd be-node
  ```
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Wait for installation to complete
- [ ] Verify no errors in output

### Step 7: Configure Backend Environment File
- [ ] Create `.env` file in `be-node/` directory
- [ ] Copy from `.env.example` if available
- [ ] Add your credentials:
  ```
  TENANT_ID=your_tenant_id_here
  CLIENT_ID=your_client_id_here
  CLIENT_SECRET=your_client_secret_here
  PORT=3000
  ```
- [ ] Replace all placeholder values with actual credentials
- [ ] Save the file
- [ ] ⚠️ **NEVER commit `.env` to Git!**

### Step 8: Install Frontend Dependencies
- [ ] Open a new terminal in project root
- [ ] Navigate to frontend:
  ```bash
  cd fe-angular
  ```
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Wait for installation to complete
- [ ] Verify no errors in output

### Step 9: Configure Frontend Environment
- [ ] Open `fe-angular/src/environments/environment.ts`
- [ ] Verify API URL is correct:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api'
  };
  ```
- [ ] Save the file (usually no changes needed)

---

## 🚀 Running the Application Checklist

### Step 10: Start Backend Server
- [ ] Open terminal in `be-node/` directory
- [ ] Run: `npm start`
- [ ] Verify server starts successfully
- [ ] Look for message: "Power BI Embed API Server - Status: Running"
- [ ] Check environment variables show ✅ (checkmarks)
- [ ] Server should be running on port 3000
- [ ] Keep this terminal open

### Step 11: Start Frontend Application
- [ ] Open a NEW terminal (keep backend terminal running)
- [ ] Navigate to `fe-angular/` directory
- [ ] Run: `npm start`
- [ ] Wait for compilation to complete
- [ ] Look for message: "Compiled successfully"
- [ ] Application should be available at http://localhost:4201
- [ ] Browser may open automatically

### Step 12: Test the Application
- [ ] Open browser to http://localhost:4201
- [ ] Verify you see the home page with workspaces
- [ ] Click on a workspace to see reports
- [ ] Click "Embed Report" on a report
- [ ] Wait for report to load
- [ ] Verify report displays correctly
- [ ] Test interactions (click visuals, use filters)
- [ ] Try refresh button
- [ ] Try fullscreen button

---

## ✅ Success Verification Checklist

If everything is working, you should see:
- [ ] Home page displays available workspaces
- [ ] Clicking workspace shows list of reports
- [ ] Reports embed and are fully interactive
- [ ] No error messages in the UI
- [ ] Report responds to interactions
- [ ] Data loads correctly
- [ ] Navigation between pages works

### Browser Console Check
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for these messages:
  - [ ] "Report loaded successfully"
  - [ ] "Report rendered successfully"
- [ ] Verify NO red error messages
- [ ] ⚠️ If you see 403 errors, check Step 4 (Tenant settings)

### Backend Terminal Check
- [ ] Check backend terminal output
- [ ] Look for successful API calls:
  - [ ] "Getting Azure AD token..."
  - [ ] "Successfully generated embed token"
- [ ] Verify NO error messages
- [ ] Should see successful token generation logs

---

## 🐛 Troubleshooting Quick Checks

If something doesn't work, verify:

### Common Issues Checklist
- [ ] Both terminals are running (backend and frontend)
- [ ] No typos in Tenant ID, Client ID, Client Secret
- [ ] Service Principal has workspace access
- [ ] **Service Principal APIs enabled in tenant settings** (most common issue!)
- [ ] Client secret hasn't expired
- [ ] No firewall blocking localhost ports 3000 or 4201
- [ ] Backend `.env` file exists in `be-node/` directory
- [ ] Frontend can connect to backend (check browser Network tab)

### Quick Tests
- [ ] Test backend health:
  ```bash
  curl http://localhost:3000/api/health
  ```
  Should return: `{"status":"OK",...}`
- [ ] Test Azure AD token manually (see CONFIGURATION_EXAMPLE.md)
- [ ] Verify Service Principal shows in workspace access list
- [ ] Check browser console for specific error messages
- [ ] Check that ports 3000 and 4201 are not in use:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000,4201
  ```

---

## 📝 Credential Reference Sheet

Keep this filled out in a secure location (NOT in version control!):

```
PROJECT: Power BI Embed Angular
DATE CONFIGURED: _______________

AZURE AD CREDENTIALS:
├─ Tenant ID:      ________________________________
├─ Client ID:      ________________________________
├─ Client Secret:  ________________________________
└─ Secret Expires: _______________

APPLICATION URLs:
├─ Frontend:       http://localhost:4201
├─ Backend:        http://localhost:3000
└─ Backend Health: http://localhost:3000/api/health

NOTES:
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

## 🎉 Completion Checklist

- [ ] Application runs successfully
- [ ] Workspaces load and display
- [ ] Reports load and display
- [ ] All controls work (refresh, fullscreen, print)
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Reports are interactive (filters, clicks work)
- [ ] Credentials are secured (`.env` in `.gitignore`)
- [ ] Documentation reviewed and understood

---

## 📚 Next Steps After Success

Once everything works:
- [ ] Read ARCHITECTURE.md to understand how it works
- [ ] Review PROJECT_STRUCTURE.md for project organization
- [ ] Customize the UI (colors, layout, branding)
- [ ] Plan user authentication (if needed)
- [ ] Plan production deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Test with different workspaces and reports
- [ ] Show it to stakeholders! 🎊

---

## ⏱️ Estimated Time

- Azure Setup: 15-20 minutes
- Application Setup: 10 minutes
- Testing & Verification: 5 minutes
- **Total: ~30-35 minutes**

---

## 🆘 Most Common Issue

### Power BI 403 Forbidden Errors

If reports don't load and you see 403 errors in browser console:

**THE ISSUE**: "Allow service principals to use Power BI APIs" is NOT enabled in Power BI Admin Portal.

**THE FIX**: 
1. Go to Power BI Admin Portal (requires admin access)
2. Tenant settings → Developer settings
3. Enable "Allow service principals to use Power BI APIs"
4. Apply to entire organization or specific security group
5. Wait 5-10 minutes for changes to propagate
6. Refresh your application

**This is the #1 reason reports fail to embed!**

---

**You've got this! Follow the checklist step-by-step and you'll have your Power BI reports embedded in no time! 🚀**

---

## 📞 Need Help?

Refer to these files:
- **Quick Setup**: QUICKSTART.md
- **Detailed Docs**: README.md
- **Configuration Help**: CONFIGURATION_EXAMPLE.md
- **Architecture Info**: ARCHITECTURE.md
- **Error Solutions**: COMMON_ERRORS.md
- **Project Structure**: PROJECT_STRUCTURE.md
