# Configuration Example

This file shows you exactly what your configuration should look like with real values.

## ✏️ Backend Configuration

The backend stores Service Principal credentials securely in the `.env` file.

### Location
`be-node/.env`

### Example Configuration

Here's what your `be-node/.env` file should look like with actual values (these are fake examples):

```bash
# Azure AD Tenant ID (looks like a GUID)
TENANT_ID=12345678-1234-1234-1234-123456789abc

# App Registration Client ID (looks like a GUID)
CLIENT_ID=87654321-4321-4321-4321-cba987654321

# Client Secret (looks like a random string with special characters)
CLIENT_SECRET=abc123~DefGHI456.JklMNO789-PqrSTU012

# Backend server port (default: 3000)
PORT=3000
```

⚠️ **Important Notes:**
- No quotes needed around values in `.env` files
- No spaces around the `=` sign
- This file should be in `be-node/` directory
- This file is in `.gitignore` - NEVER commit it to Git!

## ✏️ Frontend Configuration

The frontend only needs the backend API URL - no credentials!

### Location
`fe-angular/src/environments/environment.ts`

### Example Configuration

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

That's it! The frontend never sees or needs the Service Principal credentials.

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

⚠️ **Note**: You do NOT need Workspace ID or Report ID! The application discovers these dynamically through the Power BI API. Just set up your Service Principal and grant it workspace access.

## 📋 Format Checklist

Make sure your `.env` values:
- ✅ Tenant ID and Client ID are GUIDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- ✅ Client Secret is the actual secret value (not the Secret ID)
- ✅ No quotes around values
- ✅ No spaces around the `=` sign
- ✅ File is named exactly `.env` (with the dot at the start)
- ✅ File is in `be-node/` directory

## 🔐 Security Reminder

**Your credentials are safe:**

1. `.env` file is in `.gitignore` - cannot be committed to Git ✅
2. Backend reads `.env` at startup - credentials stay on server ✅
3. Frontend NEVER sees or needs Service Principal credentials ✅
4. Only embed tokens (safe, short-lived) are sent to frontend ✅

**For production:**
- Use Azure Key Vault or similar secret management
- Use environment variables in deployment platform
- Rotate client secrets regularly
- Monitor for unauthorized access

## 🧪 Test Your Configuration

After setting up, test each piece:

### 1. Start Backend and Check Environment Variables
```bash
cd be-node
npm start
```

Look for these checkmarks in the terminal:
```
Environment Variables Status:
✅ TENANT_ID: Set
✅ CLIENT_ID: Set
✅ CLIENT_SECRET: Set
```

If you see ❌ instead, check your `.env` file!

### 2. Test Backend Health
```bash
curl http://localhost:3000/api/health
```

Expected response: 
```json
{
  "status": "OK",
  "service": "Power BI Embed API",
  "timestamp": "2025-11-28T..."
}
```

### 3. Test Azure AD Authentication
```bash
curl http://localhost:3000/api/test-auth
```

If successful, you'll see:
```json
{
  "status": "SUCCESS",
  "message": "Azure AD authentication working",
  "tokenPreview": "eyJ0eXAiOi..."
}
```

### 4. Test Workspace Discovery
```bash
curl http://localhost:3000/api/powerbi/workspaces
```

Should return a list of workspaces your Service Principal has access to!

### 5. Test Full Flow
```bash
# Terminal 1
cd be-node
npm start

# Terminal 2
cd fe-angular
npm start
```

Open http://localhost:4201 and check:
- Workspaces display
- Click workspace → reports display
- Click "Embed Report" → report loads

## ❓ Still Having Issues?

Common mistakes:

### `.env` File Issues
- ❌ File not named exactly `.env` (check for `.env.txt` or similar)
- ❌ File in wrong location (should be in `be-node/` directory)
- ❌ Quotes around values (remove them!)
- ❌ Spaces around `=` sign (remove them!)
- ❌ Using Secret ID instead of Secret Value

### Azure Configuration Issues
- ❌ Using Object ID instead of Application (client) ID
- ❌ Copying IDs with extra characters or spaces
- ❌ Service Principal not added to workspace
- ❌ **Service Principal APIs not enabled in tenant** (MOST COMMON!)
- ❌ Client secret expired

### Testing Tips
```bash
# Check if .env file exists
cd be-node
dir .env    # Windows
ls -la .env # Mac/Linux

# Check backend logs for environment variable status
npm start
# Look for ✅ or ❌ next to each variable
```

### Quick Reference Card

Keep this filled out securely (NOT in Git):

```
TENANT_ID=________________________________
CLIENT_ID=________________________________
CLIENT_SECRET=____________________________
Created: ___________
Expires: ___________
```

---

**Security Tip**: Store these in a password manager or secure note app, never in version control or shared documents!

