const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "hexchange-dev-secret-key-change-in-production";
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours

function createToken(userId, email) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ userId, email, exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.slice(7);
  const data = verifyToken(token);
  if (!data) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = { id: data.userId, email: data.email };
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const data = verifyToken(authHeader.slice(7));
    if (data) req.user = { id: data.userId, email: data.email };
  }
  next();
}

module.exports = { createToken, verifyToken, authMiddleware, optionalAuth };
