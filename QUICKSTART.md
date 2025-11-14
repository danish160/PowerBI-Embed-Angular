# Quick Start Guide

Get your Power BI Embedded Angular app running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Configure Your Credentials (2 minutes)

Edit `src/environments/environment.ts` and replace the placeholders:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  powerbi: {
    tenantId: 'YOUR_TENANT_ID',        // From Azure AD
    clientId: 'YOUR_CLIENT_ID',        // From App Registration
    clientSecret: 'YOUR_CLIENT_SECRET', // From App Registration
    workspaceId: 'YOUR_WORKSPACE_ID',   // From Power BI workspace URL
    reportId: 'YOUR_REPORT_ID'          // From Power BI report URL
  }
};
```

### 3. Run the Application (2 minutes)

**Terminal 1** - Start Backend Server:
```bash
npm run start:server
```

**Terminal 2** - Start Angular App:
```bash
npm start
```

### 4. Open Your Browser

Navigate to: **http://localhost:4200**

You should see your Power BI report embedded and ready to interact with!

## 📍 Where to Find Your IDs

### Tenant ID & Client ID
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Select your app
4. Copy **Application (client) ID** and **Directory (tenant) ID**

### Client Secret
1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the **Value** immediately (you can't see it again later!)

### Workspace ID
From Power BI URL: `https://app.powerbi.com/groups/{WORKSPACE_ID}/...`

### Report ID
From Power BI URL: `https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/...`

## ⚠️ Common First-Time Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Run `npm install` again |
| CORS error | Make sure backend is running on port 3000 |
| "Unauthorized" error | Check your Service Principal credentials |
| Report not loading | Verify Service Principal has workspace access |

## ✅ Checklist Before Running

- [ ] Node.js installed (v18+)
- [ ] Service Principal created in Azure AD
- [ ] Service Principal has Power BI workspace access
- [ ] All credentials added to environment.ts
- [ ] Backend server running (port 3000)
- [ ] Angular dev server running (port 4200)

## 🎉 Next Steps

Once running successfully:
- Customize the report layout in `powerbi.service.ts`
- Modify the UI in `powerbi-report.component.html/css`
- Add authentication for your end users
- Deploy to production (see README.md)

---

Need help? Check the full [README.md](README.md) for detailed documentation!

