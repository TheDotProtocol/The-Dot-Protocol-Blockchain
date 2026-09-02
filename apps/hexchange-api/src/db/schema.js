const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 12;

const DB_PATH = path.join(__dirname, "../../data/hexchange.db");

let db;

function getDb() {
  if (!db) {
    const fs = require("fs");
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      wallet_address TEXT,
      kyc_status TEXT DEFAULT 'none' CHECK(kyc_status IN ('none','pending','approved','rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Custodial wallets (internal balances per user per token)
    CREATE TABLE IF NOT EXISTS custodial_wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token_symbol TEXT NOT NULL,
      token_address TEXT,
      balance REAL DEFAULT 0,
      locked_balance REAL DEFAULT 0,  -- locked in open orders
      deposit_address TEXT,           -- unique deposit address for this user+token
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, token_symbol)
    );

    -- Deposit addresses (generated per user per chain)
    CREATE TABLE IF NOT EXISTS deposit_addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      chain_id INTEGER NOT NULL,
      address TEXT NOT NULL,
      label TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, chain_id, address)
    );

    -- Deposits
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token_symbol TEXT NOT NULL,
      amount REAL NOT NULL,
      tx_hash TEXT,
      chain_id INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','credited','failed')),
      confirmations INTEGER DEFAULT 0,
      required_confirmations INTEGER DEFAULT 12,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME
    );

    -- Withdrawals
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token_symbol TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL DEFAULT 0,
      to_address TEXT NOT NULL,
      chain_id INTEGER,
      tx_hash TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    -- Orders (persistent order book)
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      pair TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('buy','sell')),
      type TEXT NOT NULL CHECK(type IN ('limit','market')),
      price REAL,
      amount REAL NOT NULL,
      filled REAL DEFAULT 0,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','partial','filled','cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Trades (executed matches)
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      pair TEXT NOT NULL,
      buy_order_id TEXT REFERENCES orders(id),
      sell_order_id TEXT REFERENCES orders(id),
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      price REAL NOT NULL,
      amount REAL NOT NULL,
      buyer_fee REAL DEFAULT 0,
      seller_fee REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User trade history view
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_orders_pair ON orders(pair, status, side, price);
    CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair, created_at);
    CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id, status);
  `);

  // Seed demo user
  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@hexchange.com");
  if (!existingUser) {
    const userId = crypto.randomUUID();
    const walletId = crypto.randomUUID();
    const hash = bcrypt.hashSync("demo123", BCRYPT_ROUNDS);
    db.prepare("INSERT INTO users (id, email, password_hash, wallet_address) VALUES (?, ?, ?, ?)").run(
      userId, "demo@hexchange.com", hash, "0xAA0bf607b14109A01e94a30674a01e2BA22e9694"
    );
    // Seed demo balances
    const tokens = [
      { symbol: "3DOT", balance: 1000000, address: "0x84ed5E46280c6911551925329C3af6c58e4ced56" },
      { symbol: "USDT", balance: 50000, address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84" },
      { symbol: "BTC", balance: 5, address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2" },
      { symbol: "BNB", balance: 100, address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3" },
    ];
    for (const t of tokens) {
      db.prepare("INSERT INTO custodial_wallets (id, user_id, token_symbol, token_address, balance) VALUES (?, ?, ?, ?, ?)").run(
        crypto.randomUUID(), userId, t.symbol, t.address, t.balance
      );
    }
    console.log("Seeded demo user: demo@hexchange.com / demo123");
  }
}

module.exports = { getDb };
