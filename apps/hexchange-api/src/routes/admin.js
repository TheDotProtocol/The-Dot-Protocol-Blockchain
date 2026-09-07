const express = require("express");
const { getDb } = require("../db/schema");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ─── Dashboard stats ───────────────────────────────────────────────
router.get("/stats", authMiddleware, (req, res) => {
  const db = getDb();

  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
  const openOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('open','partial')").get().count;
  const totalTrades = db.prepare("SELECT COUNT(*) as count FROM trades").get().count;
  const totalDeposits = db.prepare("SELECT COUNT(*) as count FROM deposits").get().count;
  const totalWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals").get().count;
  const pendingDeposits = db.prepare("SELECT COUNT(*) as count FROM deposits WHERE status = 'pending'").get().count;
  const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'processing'").get().count;

  const totalVolume = db.prepare("SELECT COALESCE(SUM(price * amount), 0) as vol FROM trades").get().vol;
  const kycPending = db.prepare("SELECT COUNT(*) as count FROM users WHERE kyc_status = 'pending'").get().count;
  const kycApproved = db.prepare("SELECT COUNT(*) as count FROM users WHERE kyc_status = 'approved'").get().count;

  // Total locked balance across all wallets
  const totalLocked = db.prepare("SELECT COALESCE(SUM(locked_balance), 0) as locked FROM custodial_wallets").get().locked;

  res.json({
    users: { total: totalUsers, kycPending, kycApproved },
    orders: { total: totalOrders, open: openOrders },
    trades: { total: totalTrades, volume: totalVolume },
    deposits: { total: totalDeposits, pending: pendingDeposits },
    withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals },
    liquidity: { totalLocked },
  });
});

// ─── User list ─────────────────────────────────────────────────────
router.get("/users", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const users = db.prepare(
    "SELECT id, email, wallet_address, kyc_status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(limit, offset);

  const total = db.prepare("SELECT COUNT(*) as count FROM users").get().count;

  // Attach order count and balance per user
  const enriched = users.map(u => {
    const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE user_id = ?").get(u.id).count;
    const balance = db.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM custodial_wallets WHERE user_id = ?").get(u.id).total;
    return { ...u, orderCount, totalBalance: balance };
  });

  res.json({ users: enriched, total, limit, offset });
});

// ─── Approve/Reject KYC ────────────────────────────────────────────
router.put("/users/:id/kyc", authMiddleware, (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  const db = getDb();
  db.prepare("UPDATE users SET kyc_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});

// ─── Recent trades ─────────────────────────────────────────────────
router.get("/trades", authMiddleware, (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 20;
  const trades = db.prepare("SELECT * FROM trades ORDER BY created_at DESC LIMIT ?").all(limit);
  res.json({ trades });
});

// ─── All open orders ───────────────────────────────────────────────
router.get("/orders", authMiddleware, (req, res) => {
  const db = getDb();
  const orders = db.prepare(
    "SELECT * FROM orders WHERE status IN ('open', 'partial') ORDER BY created_at DESC LIMIT 50"
  ).all();
  res.json({ orders });
});

// ─── All deposits (admin view) ─────────────────────────────────────
router.get("/deposits", authMiddleware, (req, res) => {
  const db = getDb();
  const deposits = db.prepare("SELECT * FROM deposits ORDER BY created_at DESC LIMIT 50").all();
  res.json({ deposits });
});

// ─── All withdrawals (admin view) ──────────────────────────────────
router.get("/withdrawals", authMiddleware, (req, res) => {
  const db = getDb();
  const withdrawals = db.prepare("SELECT * FROM withdrawals ORDER BY created_at DESC LIMIT 50").all();
  res.json({ withdrawals });
});

module.exports = router;
