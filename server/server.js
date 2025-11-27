const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
 */
async function getAzureADToken(tenantId, clientId, clientSecret) {
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
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Power BI Embed API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      embedToken: 'POST /api/powerbi/embed-token'
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

