# Power BI Token Caching Strategy

## Overview

This application implements **server-side token caching** for Azure AD tokens to optimize performance and reduce API calls to Microsoft Azure AD.

## 🔐 Security Architecture

### ❌ What We DON'T Do (Security Risk)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ────▶   │    Backend   │ ────▶   │  Azure AD   │
│             │         │              │         │             │
│  ⚠️ Store    │ ◀────   │   Get Token  │ ◀────   │  Return     │
│  Token in   │         │              │         │  Token      │
│  localStorage│         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
     ❌ BAD - Vulnerable to XSS attacks!
```

### ✅ What We DO (Secure Implementation)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ────▶   │    Backend   │ ────▶   │  Azure AD   │
│             │         │              │         │             │
│  Request    │         │  Check Cache │         │  Return     │
│  Report     │ ◀────   │  ↓           │         │  Token      │
│             │         │  Use Cached  │         │             │
│  Never      │         │  Token       │         │             │
│  Sees       │         │  (Memory)    │         │             │
│  AD Token   │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
     ✅ GOOD - Token stays on server
```

## 🚀 How It Works

### 1. Server-Side Memory Cache

The backend stores the Azure AD token in memory (not disk, not database):

```javascript
let tokenCache = {
  token: null,      // The Azure AD access token
  expiresAt: null   // Timestamp when token expires
};
```

### 2. Smart Token Retrieval

When `getAzureADToken()` is called:

1. **Check Cache First**
   - Is there a cached token?
   - Is it still valid (with 5-minute buffer)?
   - If YES → Return cached token ✅

2. **Fetch New Token**
   - If NO cached token or expired
   - Call Azure AD API
   - Cache the new token
   - Return new token ✅

### 3. Token Lifecycle

```
Request 1: ────▶ No cache ────▶ Fetch from Azure AD ────▶ Cache (59 min)
Request 2: ────▶ Use cache (58 min left)
Request 3: ────▶ Use cache (57 min left)
...
Request N: ────▶ Cache expired ────▶ Fetch new token ────▶ Cache (59 min)
```

## 📊 Benefits

### Performance
- **Reduced API Calls**: Azure AD called only once per hour instead of every request
- **Faster Response**: Cached tokens returned instantly
- **Cost Savings**: Fewer external API calls

### Security
- **Server-Side Only**: Token never leaves the backend
- **No XSS Risk**: Browser never stores sensitive tokens
- **Memory Cache**: Cleared on server restart
- **Automatic Expiry**: Old tokens automatically discarded

### Reliability
- **5-Minute Buffer**: Refresh token before actual expiry
- **Graceful Degradation**: Falls back to new token if cache invalid
- **Self-Healing**: Automatically refreshes when needed

## 🛠️ Management Endpoints

### Check Token Cache Status

```bash
curl http://localhost:3000/api/token-cache/status
```

Response:
```json
{
  "cached": true,
  "valid": true,
  "expiresAt": "2025-11-27T14:30:45.123Z",
  "timeRemainingSeconds": 3540
}
```

### Clear Token Cache

```bash
curl -X POST http://localhost:3000/api/token-cache/clear
```

Response:
```json
{
  "message": "Token cache cleared successfully",
  "timestamp": "2025-11-27T13:30:45.123Z"
}
```

## 🔍 Monitoring

The backend logs show cache usage:

```
✅ Using cached Azure AD token (valid for 54 more minutes)
```

Or when fetching new:

```
🔄 Fetching new Azure AD token...
✅ New Azure AD token cached (expires in 59 minutes)
```

## ⚠️ Important Notes

### Token Types

1. **Azure AD Token** (cached on server)
   - Used to call Power BI REST APIs
   - Full Service Principal permissions
   - Valid for ~1 hour
   - **Never sent to browser**

2. **Embed Token** (sent to browser)
   - Used to embed specific reports
   - Limited permissions (read-only for specific report)
   - Valid for ~1 hour
   - **Safe to send to browser**

### When Cache is Cleared

- Server restart
- Manual clear via API endpoint
- Token expiration
- Memory limits (rare)

### Production Considerations

For production, consider:

1. **Redis/Memcached**: For multi-instance deployments
2. **Token Refresh**: Implement proactive refresh before expiry
3. **Monitoring**: Track cache hit/miss rates
4. **Alerts**: Notify when token refresh fails

## 🎯 Best Practices Summary

✅ **DO**:
- Cache Azure AD tokens on backend (server memory)
- Use cache expiry with buffer time
- Send only embed tokens to frontend
- Monitor cache performance
- Clear cache on security events

❌ **DON'T**:
- Store Azure AD tokens in browser storage
- Send Service Principal credentials to frontend
- Cache tokens indefinitely
- Ignore token expiry
- Share tokens across different security contexts

## 📚 References

- [Azure AD Token Lifetime](https://learn.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes)
- [Power BI Embed Token Best Practices](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-tokens)
- [OWASP Token Storage Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

