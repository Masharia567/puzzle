const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const msalConfig = require('../config/msalConfig');

// Middleware to validate JWT tokens from Azure AD
const validateJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://login.microsoftonline.com/${msalConfig.auth.tenantId}/discovery/v2.0/keys`,
  }),
  audience: msalConfig.validation.audience,
  issuer: msalConfig.validation.issuer,
  algorithms: ['RS256'],
});

// Error handler for JWT validation
const handleJwtError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message,
    });
  }
  next(err);
};

// Optional: Middleware to extract user info from token
const extractUserInfo = (req, res, next) => {
  if (req.auth) {
    req.user = {
      id: req.auth.oid || req.auth.sub, // Object ID or Subject
      email: req.auth.preferred_username || req.auth.email,
      name: req.auth.name,
      tenantId: req.auth.tid,
    };
  }
  next();
};

module.exports = {
  validateJwt,
  handleJwtError,
  extractUserInfo,
};