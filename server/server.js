const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Token cache for Azure AD token (server-side memory cache)
let tokenCache = {
  token: null,
  expiresAt: null
};

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Get Azure AD token using Service Principal credentials
 * TOKEN CACHING DISABLED - Always fetches fresh token
 */
async function getAzureADToken(tenantId, clientId, clientSecret) {
  // CACHING DISABLED - Always fetch new token
  /* 
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer before expiry
  
  if (tokenCache.token && tokenCache.expiresAt && (tokenCache.expiresAt - bufferTime) > now) {
    const timeRemaining = Math.floor((tokenCache.expiresAt - now) / 1000 / 60);
    console.log(`✅ Using cached Azure AD token (valid for ${timeRemaining} more minutes)`);
    return tokenCache.token;
  }
  */

  console.log('🔄 Fetching new Azure AD token (caching disabled)...');
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');

  try {
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // CACHING DISABLED - Still store for status endpoint but don't use
    /*
    tokenCache.token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3599;
    tokenCache.expiresAt = Date.now() + (expiresIn * 1000);
    console.log(`✅ New Azure AD token cached (expires in ${Math.floor(expiresIn / 60)} minutes)`);
    */
    
    console.log(`✅ New Azure AD token fetched (caching disabled)`);
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Azure AD token:', error.response?.data || error.message);
    throw new Error('Failed to get Azure AD token');
  }
}

/**
 * Get Power BI embed token for a specific report
 */
async function getPowerBIEmbedToken(accessToken, workspaceId, reportId) {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
  
  try {
    console.log('Fetching report details from Power BI...');
    // First, get the report details including embed URL
    const reportResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Report details retrieved:', reportResponse.data.name);
    console.log('Dataset ID:', reportResponse.data.datasetId);
    console.log('Dataset Workspace ID:', reportResponse.data.datasetWorkspaceId);

    // Check if dataset is in a different workspace
    const datasetWorkspaceId = reportResponse.data.datasetWorkspaceId || workspaceId;
    if (datasetWorkspaceId !== workspaceId) {
      console.log('⚠️  WARNING: Dataset is in a different workspace!');
      console.log('   Report Workspace:', workspaceId);
      console.log('   Dataset Workspace:', datasetWorkspaceId);
    }

    // Try the simpler GenerateToken API first
    console.log('Generating embed token...');
    console.log('Workspace ID:', workspaceId);
    console.log('Report ID:', reportId);
    console.log('Dataset ID:', reportResponse.data.datasetId);
    
    // First try: Simple approach with just datasets and reports
    let embedTokenResponse;
    let embedToken;
    let tokenType = 'Embed';
    
    try {
      const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/GenerateToken`;
      embedTokenResponse = await axios.post(
        embedTokenUrl,
        {
          datasets: [{ id: reportResponse.data.datasetId }],
          reports: [{ id: reportId }]
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      embedToken = embedTokenResponse.data.token;
      console.log('✅ Embed token generated successfully (simple method)');
    } catch (simpleError) {
      console.log('❌ Simple method failed:', simpleError.response?.status);
      console.log('Trying with targetWorkspaces...');
      
      try {
        // Second try: Add targetWorkspaces and dataset workspace
        const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/GenerateToken`;
        embedTokenResponse = await axios.post(
          embedTokenUrl,
          {
            datasets: [{ 
              id: reportResponse.data.datasetId,
              xmlaPermissions: 'ReadOnly'
            }],
            reports: [{ 
              allowEdit: false,
              id: reportId 
            }],
            targetWorkspaces: [{
              id: datasetWorkspaceId
            }]
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        embedToken = embedTokenResponse.data.token;
        console.log('✅ Embed token generated successfully (with targetWorkspaces)');
      } catch (workspaceError) {
        console.log('❌ Both methods failed. Trying Service Principal token directly...');
        console.log('⚠️  This requires "Service principals can use Power BI APIs" to be enabled in tenant settings');
        
        // Third try: Use the Azure AD token directly (Service Principal mode)
        embedToken = accessToken;
        tokenType = 'Aad';
        console.log('ℹ️  Using Service Principal token directly (Aad token type)');
      }
    }

    return {
      accessToken: embedToken,
      embedUrl: reportResponse.data.embedUrl,
      reportId: reportResponse.data.id,
      tokenExpiry: embedTokenResponse?.data?.expiration || new Date(Date.now() + 3600000).toISOString(),
      tokenType: tokenType
    };
  } catch (error) {
    console.error('Error getting Power BI embed token:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    throw new Error('Failed to get Power BI embed token');
  }
}

/**
 * API endpoint to get embed token
 */
app.post('/api/powerbi/embed-token', async (req, res) => {
  try {
    // Get credentials from environment variables (server-side only)
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const workspaceId = process.env.WORKSPACE_ID;
    const reportId = process.env.REPORT_ID;

    // Validate required parameters
    if (!tenantId || !clientId || !clientSecret || !workspaceId || !reportId) {
      console.error('Missing environment variables!');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing required environment variables. Please check .env file.'
      });
    }

    console.log('Getting Azure AD token...');
    const azureToken = await getAzureADToken(tenantId, clientId, clientSecret);
    
    console.log('Getting Power BI embed token...');
    const embedData = await getPowerBIEmbedToken(azureToken, workspaceId, reportId);
    
    console.log('Successfully generated embed token');
    res.json(embedData);
  } catch (error) {
    console.error('Error in embed-token endpoint:', error.message);
    res.status(500).json({
      error: 'Failed to generate embed token',
      message: error.message
    });
  }
});

/**
 * Test Azure AD authentication
 */
app.get('/api/test-auth', async (req, res) => {
  try {
    console.log('Testing Azure AD authentication...');
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    
    const azureToken = await getAzureADToken(tenantId, clientId, clientSecret);
    console.log('Azure AD token received successfully');
    
    res.json({
      status: 'SUCCESS',
      message: 'Azure AD authentication working',
      tokenPreview: azureToken.substring(0, 50) + '...'
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Power BI Embed API'
  });
});

/**
 * Get all workspaces (groups) the Service Principal has access to
 * This verifies that the token has Workspace.Read.All or Workspace.ReadWrite.All permission
 */
app.get('/api/powerbi/workspaces', async (req, res) => {
  try {
    console.log('Getting list of workspaces...');
    
    // Get Azure AD token (uses cache if available)
    const accessToken = await getAzureADToken(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
    
    // Call Power BI API to get workspaces
    const response = await axios.get(
      'https://api.powerbi.com/v1.0/myorg/groups',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log(`✅ Found ${response.data.value?.length || 0} workspace(s)`);
    
    res.json({
      status: 'SUCCESS',
      workspaceCount: response.data.value?.length || 0,
      workspaces: response.data.value
    });
    
  } catch (error) {
    console.error('❌ Error getting workspaces:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        status: 'PERMISSION_DENIED',
        message: 'Token does not have Workspace.Read.All permission',
        details: 'Add "Workspace.Read.All" permission to your Azure AD App Registration',
        error: error.response?.data
      });
    }
    
    res.status(500).json({
      status: 'FAILED',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Get all reports in a specific workspace
 */
app.get('/api/powerbi/workspaces/:workspaceId/reports', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    console.log(`Getting reports for workspace: ${workspaceId}...`);
    
    // Get Azure AD token (uses cache if available)
    const accessToken = await getAzureADToken(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
    
    // Call Power BI API to get reports in the workspace
    const response = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log(`✅ Found ${response.data.value?.length || 0} report(s) in workspace ${workspaceId}`);
    
    res.json({
      status: 'SUCCESS',
      workspaceId: workspaceId,
      reportCount: response.data.value?.length || 0,
      reports: response.data.value
    });
    
  } catch (error) {
    console.error('❌ Error getting reports:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        status: 'PERMISSION_DENIED',
        message: 'Token does not have Report.Read.All permission',
        error: error.response?.data
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: 'Workspace not found or no access',
        error: error.response?.data
      });
    }
    
    res.status(500).json({
      status: 'FAILED',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Token cache status endpoint
 */
app.get('/api/token-cache/status', (req, res) => {
  const now = Date.now();
  const isValid = tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > now;
  
  res.json({
    cached: !!tokenCache.token,
    valid: isValid,
    expiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
    timeRemainingSeconds: isValid ? Math.floor((tokenCache.expiresAt - now) / 1000) : 0
  });
});

/**
 * Clear token cache endpoint (useful for testing or forcing refresh)
 */
app.post('/api/token-cache/clear', (req, res) => {
  tokenCache.token = null;
  tokenCache.expiresAt = null;
  console.log('🗑️ Token cache cleared');
  
  res.json({
    message: 'Token cache cleared successfully',
    timestamp: new Date().toISOString()
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Power BI Embed API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      embedToken: 'POST /api/powerbi/embed-token',
      workspaces: 'GET /api/powerbi/workspaces',
      workspaceReports: 'GET /api/powerbi/workspaces/:workspaceId/reports',
      tokenCacheStatus: 'GET /api/token-cache/status',
      clearTokenCache: 'POST /api/token-cache/clear'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Power BI Embed API Server                              ║
║   Status: Running                                         ║
║   Port: ${PORT}                                              ║
║   Time: ${new Date().toISOString()}           ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /                                                ║
║   - GET  /api/health                                      ║
║   - POST /api/powerbi/embed-token                         ║
║   - GET  /api/powerbi/workspaces                          ║
║   - GET  /api/powerbi/workspaces/:id/reports              ║
║   - GET  /api/token-cache/status                          ║
║   - POST /api/token-cache/clear                           ║
║                                                           ║
║   Token Caching: DISABLED ⚠️                              ║
║   (Fetching fresh Azure AD token on every request)       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Environment Variables Status:
  TENANT_ID: ${process.env.TENANT_ID ? '✓ Loaded' : '✗ Missing'}
  CLIENT_ID: ${process.env.CLIENT_ID ? '✓ Loaded' : '✗ Missing'}
  CLIENT_SECRET: ${process.env.CLIENT_SECRET ? '✓ Loaded' : '✗ Missing'}
  WORKSPACE_ID: ${process.env.WORKSPACE_ID ? '✓ Loaded' : '✗ Missing'}
  REPORT_ID: ${process.env.REPORT_ID ? '✓ Loaded' : '✗ Missing'}
  `);
});

module.exports = app;

