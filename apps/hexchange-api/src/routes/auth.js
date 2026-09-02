const express = require("express");
const crypto = require("crypto");
const { getDb } = require("../db/schema");
const { createToken, authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { email, password, walletAddress } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const userId = crypto.randomUUID();
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  db.prepare("INSERT INTO users (id, email, password_hash, wallet_address) VALUES (?, ?, ?, ?)").run(
    userId, email, passwordHash, walletAddress || null
  );

  // Create default custodial wallets
  const defaultTokens = [
    { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56" },
    { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84" },
    { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2" },
    { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3" },
  ];
  for (const t of defaultTokens) {
    db.prepare("INSERT INTO custodial_wallets (id, user_id, token_symbol, token_address, balance) VALUES (?, ?, ?, ?, 0)").run(
      crypto.randomUUID(), userId, t.symbol, t.address
    );
  }

  const token = createToken(userId, email);
  res.json({ token, user: { id: userId, email, kycStatus: "none" } });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const db = getDb();
  const user = db.prepare("SELECT id, email, password_hash, kyc_status FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== user.password_hash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = createToken(user.id, user.email);
  res.json({ token, user: { id: user.id, email: user.email, kycStatus: user.kyc_status } });
});

// Get profile
router.get("/profile", authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT id, email, wallet_address, kyc_status, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const wallets = db.prepare("SELECT token_symbol, balance, locked_balance FROM custodial_wallets WHERE user_id = ?").all(req.user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
      kycStatus: user.kyc_status,
      memberSince: user.created_at,
    },
    balances: wallets,
  });
});

// Update wallet address
router.put("/wallet", authMiddleware, (req, res) => {
  const { walletAddress } = req.body;
  const db = getDb();
  db.prepare("UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(walletAddress, req.user.id);
  res.json({ success: true });
});

module.exports = router;
