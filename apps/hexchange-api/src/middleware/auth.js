// ─── C-04 + H-04 FIX: Use jsonwebtoken library, require env var ───────
const jwt = require("jsonwebtoken");

// REQUIRE JWT_SECRET from environment — crash if missing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  console.error("Set it with: export JWT_SECRET=$(openssl rand -hex 32)");
  process.exit(1);
}

const TOKEN_EXPIRY = "24h";

/**
 * Create a signed JWT token.
 */
function createToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY, algorithm: "HS256" }
  );
}

/**
 * Verify and decode a JWT token.
 * Uses constant-time comparison internally via jsonwebtoken library.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    return null;
  }
}

/**
 * Required auth middleware — rejects if no valid token.
 */
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

/**
 * Optional auth middleware — attaches user if token present, but doesn't reject.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const data = verifyToken(authHeader.slice(7));
    if (data) req.user = { id: data.userId, email: data.email };
  }
  next();
}

module.exports = { createToken, verifyToken, authMiddleware, optionalAuth };
