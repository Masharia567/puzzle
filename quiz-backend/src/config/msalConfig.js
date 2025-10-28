require('dotenv').config();

const msalConfig = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    tenantId: process.env.MSAL_TENANT_ID,
    clientSecret: process.env.MSAL_CLIENT_SECRET,
  },
  // Token validation settings
  validation: {
    audience: process.env.MSAL_CLIENT_ID,
    issuer: `https://login.microsoftonline.com/${process.env.MSAL_TENANT_ID}/v2.0`,
  },
};

module.exports = msalConfig;