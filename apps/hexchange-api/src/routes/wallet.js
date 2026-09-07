const express = require("express");
const crypto = require("crypto");
const { getDb } = require("../db/schema");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ─── Generate deposit address ──────────────────────────────────────
router.get("/deposit-address/:token", authMiddleware, (req, res) => {
  const { token } = req.params;
  const chainId = parseInt(req.query.chainId) || 1546;
  const db = getDb();

  // Check if user already has a deposit address for this token+chain
  const existing = db.prepare(
    "SELECT address FROM deposit_addresses WHERE user_id = ? AND chain_id = ? AND label = ?"
  ).get(req.user.id, chainId, token);

  if (existing) {
    return res.json({ address: existing.address, chainId, token });
  }

  // Generate a deterministic deposit address (in production, use HD wallet)
  const depositAddress = "0x" + crypto.createHash("sha256")
    .update(req.user.id + token + chainId)
    .digest("hex").slice(0, 40);

  db.prepare(
    "INSERT OR IGNORE INTO deposit_addresses (id, user_id, chain_id, address, label) VALUES (?, ?, ?, ?, ?)"
  ).run(crypto.randomUUID(), req.user.id, chainId, depositAddress, token);

  res.json({ address: depositAddress, chainId, token });
});

// ─── Request deposit (user sends tokens to deposit address) ────────
router.post("/deposit", authMiddleware, (req, res) => {
  const { token, amount, txHash, chainId } = req.body;
  if (!token || !amount || !txHash) {
    return res.status(400).json({ error: "token, amount, and txHash required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const db = getDb();
  const depositId = crypto.randomUUID();

  db.prepare(
    "INSERT INTO deposits (id, user_id, token_symbol, amount, tx_hash, chain_id, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
  ).run(depositId, req.user.id, token, parsedAmount, txHash, chainId || 1546);

  // In production: monitor blockchain for confirmations
  // For now: auto-confirm after 12 confirmations (simulated)
  setTimeout(() => {
    try {
      const d = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
      if (d && d.status === "pending") {
        db.prepare("UPDATE deposits SET status = 'confirmed', confirmations = 12, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?").run(depositId);
        // Credit custodial wallet
        const wallet = db.prepare("SELECT * FROM custodial_wallets WHERE user_id = ? AND token_symbol = ?").get(req.user.id, token);
        if (wallet) {
          db.prepare("UPDATE custodial_wallets SET balance = balance + ? WHERE id = ?").run(parsedAmount, wallet.id);
          db.prepare("UPDATE deposits SET status = 'credited' WHERE id = ?").run(depositId);
        }
      }
    } catch (e) { console.error("Deposit auto-confirm error:", e); }
  }, 5000);

  res.json({ depositId, status: "pending", token, amount: parsedAmount, txHash });
});

// ─── Get deposit history ───────────────────────────────────────────
router.get("/deposits", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const deposits = db.prepare(
    "SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(req.user.id, limit, offset);

  const total = db.prepare("SELECT COUNT(*) as count FROM deposits WHERE user_id = ?").get(req.user.id);

  res.json({ deposits, total: total.count, limit, offset });
});

// ─── Request withdrawal ────────────────────────────────────────────
router.post("/withdraw", authMiddleware, (req, res) => {
  const { token, amount, toAddress, chainId } = req.body;
  if (!token || !amount || !toAddress) {
    return res.status(400).json({ error: "token, amount, and toAddress required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Calculate fee (0.1%)
  const fee = Math.max(parsedAmount * 0.001, 0.0001);
  const totalDeduction = parsedAmount + fee;

  const db = getDb();

  // Check balance
  const wallet = db.prepare("SELECT * FROM custodial_wallets WHERE user_id = ? AND token_symbol = ?").get(req.user.id, token);
  if (!wallet || wallet.balance < totalDeduction) {
    return res.status(400).json({ error: "Insufficient balance", available: wallet ? wallet.balance : 0, required: totalDeduction });
  }

  // Lock balance
  db.prepare("UPDATE custodial_wallets SET balance = balance - ?, locked_balance = locked_balance + ? WHERE id = ?")
    .run(totalDeduction, totalDeduction, wallet.id);

  const withdrawalId = crypto.randomUUID();
  db.prepare(
    "INSERT INTO withdrawals (id, user_id, token_symbol, amount, fee, to_address, chain_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'processing')"
  ).run(withdrawalId, req.user.id, token, parsedAmount, fee, toAddress, chainId || 1546);

  // In production: sign and broadcast transaction
  // For now: simulate completion
  setTimeout(() => {
    try {
      const fakeTxHash = "0x" + crypto.randomBytes(32).toString("hex");
      db.prepare("UPDATE withdrawals SET status = 'completed', tx_hash = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(fakeTxHash, withdrawalId);
      db.prepare("UPDATE custodial_wallets SET locked_balance = locked_balance - ? WHERE id = ?")
        .run(totalDeduction, wallet.id);
    } catch (e) { console.error("Withdrawal simulation error:", e); }
  }, 3000);

  res.json({ withdrawalId, status: "processing", token, amount: parsedAmount, fee, toAddress, totalDeduction });
});

// ─── Get withdrawal history ────────────────────────────────────────
router.get("/withdrawals", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const withdrawals = db.prepare(
    "SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(req.user.id, limit, offset);

  const total = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE user_id = ?").get(req.user.id);

  res.json({ withdrawals, total: total.count, limit, offset });
});

// ─── Get wallet balances ───────────────────────────────────────────
router.get("/wallet/balances", authMiddleware, (req, res) => {
  const db = getDb();
  const wallets = db.prepare(
    "SELECT token_symbol, token_address, balance, locked_balance FROM custodial_wallets WHERE user_id = ?"
  ).all(req.user.id);

  res.json({ wallets });
});

// ─── Trade history ─────────────────────────────────────────────────
router.get("/trades/history", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 50;
  const pair = req.query.pair;

  let trades;
  if (pair) {
    trades = db.prepare(
      "SELECT * FROM trades WHERE pair = ? ORDER BY created_at DESC LIMIT ?"
    ).all(pair, limit);
  } else {
    trades = db.prepare(
      "SELECT * FROM trades WHERE buyer_id = ? OR seller_id = ? ORDER BY created_at DESC LIMIT ?"
    ).all(req.user.id, req.user.id, limit);
  }

  res.json({ trades });
});

// ─── Open orders ───────────────────────────────────────────────────
router.get("/orders/open", authMiddleware, (req, res) => {
  const db = getDb();
  const orders = db.prepare(
    "SELECT * FROM orders WHERE user_id = ? AND status IN ('open', 'partial') ORDER BY created_at DESC"
  ).all(req.user.id);

  res.json({ orders });
});

// ─── Order history ─────────────────────────────────────────────────
router.get("/orders/history", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 50;
  const orders = db.prepare(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(req.user.id, limit);

  res.json({ orders });
});

module.exports = router;
