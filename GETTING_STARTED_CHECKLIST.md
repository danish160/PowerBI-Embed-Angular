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

### Step 5: Get Workspace Information
- [ ] Open your Power BI workspace
- [ ] Copy the URL
- [ ] **Extract Workspace ID from URL**: `________________________`
  - URL format: `https://app.powerbi.com/groups/WORKSPACE_ID/...`

### Step 6: Get Report Information
- [ ] Open your Power BI report
- [ ] Copy the URL
- [ ] **Extract Report ID from URL**: `________________________`
  - URL format: `https://app.powerbi.com/groups/{workspace}/reports/REPORT_ID/...`

### Step 7: Grant Service Principal Access
- [ ] In your workspace, click "Access"
- [ ] Click "Add people or groups"
- [ ] Search for your Service Principal (by app name)
- [ ] Assign role:
  - [ ] Viewer (minimum, read-only)
  - [ ] Member (recommended, more features)
  - [ ] Admin (if needed)
- [ ] Click "Add"

---

## 💻 Application Setup Checklist

### Step 8: Install Dependencies
- [ ] Open terminal in project directory
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Verify no errors in output

### Step 9: Configure Environment File
- [ ] Open `src/environments/environment.ts`
- [ ] Replace `YOUR_TENANT_ID` with actual Tenant ID
- [ ] Replace `YOUR_CLIENT_ID` with actual Client ID
- [ ] Replace `YOUR_CLIENT_SECRET` with actual Client Secret
- [ ] Replace `YOUR_WORKSPACE_ID` with actual Workspace ID
- [ ] Replace `YOUR_REPORT_ID` with actual Report ID
- [ ] Save the file

### Step 10: Verify Configuration
Review your `environment.ts` - it should look like:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  powerbi: {
    tenantId: '12345678-1234-1234-1234-123456789abc',
    clientId: '87654321-4321-4321-4321-cba987654321',
    clientSecret: 'abc123~DefGHI456.JklMNO789-PqrSTU012',
    workspaceId: 'abcdef12-3456-7890-abcd-ef1234567890',
    reportId: '98765432-fedc-ba98-7654-321098765432'
  }
};
```
- [ ] All placeholders replaced with real GUIDs
- [ ] No "YOUR_" prefixes remaining
- [ ] All values in single quotes
- [ ] No extra spaces or line breaks

---

## 🚀 Running the Application Checklist

### Step 11: Start Backend Server
- [ ] Open terminal in project directory
- [ ] Run: `npm run start:server`
- [ ] Verify server starts successfully
- [ ] Look for message: "Power BI Embed API Server - Status: Running"
- [ ] Server should be running on port 3000
- [ ] Keep this terminal open

### Step 12: Start Frontend Application
- [ ] Open a NEW terminal (keep backend terminal running)
- [ ] Navigate to project directory
- [ ] Run: `npm start` or `ng serve`
- [ ] Wait for compilation to complete
- [ ] Look for message: "Compiled successfully"
- [ ] Application should be available at http://localhost:4200

### Step 13: Test the Application
- [ ] Open browser
- [ ] Navigate to: http://localhost:4200
- [ ] Verify loading spinner appears
- [ ] Wait for report to load
- [ ] Verify report displays correctly
- [ ] Test refresh button
- [ ] Test fullscreen button
- [ ] Interact with report (click visuals, use filters)

---

## ✅ Success Verification Checklist

If everything is working, you should see:
- [ ] Beautiful gradient header with title
- [ ] Three control buttons (Refresh, Fullscreen, Print)
- [ ] Your Power BI report embedded and fully interactive
- [ ] No error messages
- [ ] Report responds to interactions
- [ ] Data loads correctly

### Browser Console Check
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for these messages:
  - [ ] "Report loaded successfully"
  - [ ] "Report rendered successfully"
- [ ] Verify NO red error messages

### Backend Terminal Check
- [ ] Check backend terminal output
- [ ] Look for these log messages:
  - [ ] "Getting Azure AD token..."
  - [ ] "Getting Power BI embed token..."
  - [ ] "Successfully generated embed token"
- [ ] Verify NO error messages

---

## 🐛 Troubleshooting Quick Checks

If something doesn't work, verify:

### Common Issues Checklist
- [ ] Both terminals are running (backend and frontend)
- [ ] No typos in Tenant ID, Client ID, Client Secret
- [ ] Service Principal has workspace access
- [ ] Service Principal APIs enabled in tenant settings
- [ ] Client secret hasn't expired
- [ ] Workspace ID and Report ID are correct
- [ ] No firewall blocking localhost ports
- [ ] Browser allows localhost connections

### Quick Tests
- [ ] Test backend health: Open http://localhost:3000/api/health
  - Should return: `{"status":"OK",...}`
- [ ] Test Azure AD token manually (see CONFIGURATION_EXAMPLE.md)
- [ ] Verify Service Principal shows in workspace access list
- [ ] Check browser console for specific error messages

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

POWER BI IDENTIFIERS:
├─ Workspace ID:   ________________________________
└─ Report ID:      ________________________________

APPLICATION URLs:
├─ Frontend:       http://localhost:4200
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
- [ ] Report loads and displays
- [ ] All controls work (refresh, fullscreen, print)
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Report is interactive (filters, clicks work)
- [ ] Credentials are secured (.gitignore configured)
- [ ] Documentation reviewed and understood

---

## 📚 Next Steps After Success

Once everything works:
- [ ] Read ARCHITECTURE.md to understand how it works
- [ ] Customize the UI (colors, layout, branding)
- [ ] Add more reports (modify code to support multiple)
- [ ] Implement user authentication (if needed)
- [ ] Plan production deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Test with different reports
- [ ] Show it to stakeholders! 🎊

---

## ⏱️ Estimated Time

- Azure Setup: 15-20 minutes
- Application Setup: 5 minutes
- Testing & Verification: 5 minutes
- **Total: ~30 minutes**

---

**You've got this! Follow the checklist step-by-step and you'll have your Power BI report embedded in no time! 🚀**

---

## 📞 Need Help?

Refer to these files:
- **Quick Setup**: QUICKSTART.md
- **Detailed Docs**: README.md
- **Configuration Help**: CONFIGURATION_EXAMPLE.md
- **Architecture Info**: ARCHITECTURE.md
- **Complete Overview**: PROJECT_SUMMARY.md

