import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Initialize JWKS (JSON Web Key Set) client
const client = jwksClient({
  jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
});

// Helper to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware to verify MSAL/Azure token
export function verifyAzureToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      audience:'cd0bff20-4879-4647-a692-f9dde7bba74a',
      issuer: [
        "https://login.microsoftonline.com/common/v2.0",
        "https://login.microsoftonline.com/91e95e88-09ab-48f2-9f79-22f9e7f56da5/v2.0"
      ]
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid token", error: err.message });
      }

      req.azureUser = decoded;
      next();
    }
  );
}
