# Configuration Example

This file shows you exactly what your configuration should look like with real values.

## ✏️ Example Configuration

Here's what your `src/environments/environment.ts` should look like with actual values (these are fake examples):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  powerbi: {
    // Your Azure AD Tenant ID (looks like a GUID)
    tenantId: '12345678-1234-1234-1234-123456789abc',
    
    // Your App Registration Client ID (looks like a GUID)
    clientId: '87654321-4321-4321-4321-cba987654321',
    
    // Your Client Secret (looks like a random string)
    clientSecret: 'abc123~DefGHI456.JklMNO789-PqrSTU012',
    
    // Your Power BI Workspace ID (looks like a GUID)
    workspaceId: 'abcdef12-3456-7890-abcd-ef1234567890',
    
    // Your Power BI Report ID (looks like a GUID)
    reportId: '98765432-fedc-ba98-7654-321098765432'
  }
};
```

## 🔍 How to Identify Each Value

### Tenant ID
- **Where**: Azure Portal → Azure Active Directory → Overview
- **Looks like**: `12345678-1234-1234-1234-123456789abc`
- **Also called**: Directory ID

### Client ID
- **Where**: Azure Portal → App registrations → Your App → Overview
- **Looks like**: `87654321-4321-4321-4321-cba987654321`
- **Also called**: Application ID

### Client Secret
- **Where**: Azure Portal → App registrations → Your App → Certificates & secrets
- **Looks like**: `abc123~DefGHI456.JklMNO789-PqrSTU012`
- **Note**: You can only see this once when you create it!

### Workspace ID
- **Where**: Power BI Service → Your Workspace → Check URL
- **URL format**: `https://app.powerbi.com/groups/WORKSPACE_ID/list`
- **Looks like**: `abcdef12-3456-7890-abcd-ef1234567890`

### Report ID
- **Where**: Power BI Service → Open your report → Check URL
- **URL format**: `https://app.powerbi.com/groups/{workspace}/reports/REPORT_ID/ReportSection`
- **Looks like**: `98765432-fedc-ba98-7654-321098765432`

## 📋 Format Checklist

Make sure your values:
- ✅ Are actual GUIDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- ✅ Don't have extra spaces or quotes
- ✅ Are within the single quotes in the config file
- ✅ Don't include "YOUR_" prefix (that's just a placeholder!)

## 🔐 Security Reminder

**Before committing to Git:**

1. Check that `.gitignore` includes:
   ```
   src/environments/environment.ts
   src/environments/environment.prod.ts
   ```

2. Never commit files with real credentials!

3. Use environment variables or Azure Key Vault in production.

## 🧪 Test Your Configuration

After setting up, test each piece:

### 1. Test Azure AD Authentication
```bash
# In PowerShell or Terminal
curl -X POST https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=https://analysis.windows.net/powerbi/api/.default"
```

If successful, you'll get an access token back!

### 2. Test Backend API
```bash
# Start your backend server first
curl http://localhost:3000/api/health
```

Expected response: `{"status":"OK","timestamp":"...","service":"Power BI Embed API"}`

### 3. Test Full Flow
Run your app and check the browser console for any errors.

## ❓ Still Having Issues?

Common mistakes:
- ❌ Using the wrong secret (object ID instead of value)
- ❌ Copying IDs with extra characters
- ❌ Service Principal not added to workspace
- ❌ Service Principal APIs not enabled in tenant

---

**Tip**: Keep a secure note with these values for easy reference, but never share them or commit to Git!

