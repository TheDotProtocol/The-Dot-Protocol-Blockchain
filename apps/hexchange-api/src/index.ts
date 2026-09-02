import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { orderBook, seedOrderBook } from "./engine";
import { authMiddleware, optionalAuth, verifyToken } from "./middleware/auth";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3006;

// ─── C-05 FIX: Restrict CORS to known origins ──────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3005",
  "http://localhost:3006",
  "https://hexchange.YOUR_DOMAIN.com",
  "https://YOUR_DOMAIN.com",
  "https://www.YOUR_DOMAIN.com",
  "https://presale.YOUR_DOMAIN.com",
  "https://wallet.YOUR_DOMAIN.com",
  "https://pay.YOUR_DOMAIN.com",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── M-06: Security + CSP Headers ──────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // M-06: Content Security Policy
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' ws://localhost:3006 wss://localhost:3006 https://rpc-chennai.YOUR_DOMAIN.com https://rpc-mainnet.YOUR_DOMAIN.com",
    "frame-ancestors 'none'",
  ].join("; "));
  next();
});

// Limit request body size (1MB max)
app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ─────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Order rate limit exceeded" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts" },
});

// ─── H-02 FIX: Per-user rate limiting ────────────────────────────
const userOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.user?.id || "anonymous",
  message: { error: "Per-user order rate limit exceeded" },
});

app.use("/api/", generalLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api/auth", authLimiter);

// ─── Auth Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Seed order book with demo data
seedOrderBook();

// ─── REST Endpoints ───────────────────────────────────────────────

app.get("/api/orderbook/:pair", (req, res) => {
  const pair = decodeURIComponent(req.params.pair);
  const snapshot = orderBook.getOrderBook(pair);
  res.json(snapshot);
});

app.get("/api/trades/:pair", (req, res) => {
  const pair = decodeURIComponent(req.params.pair);
  const limit = parseInt(req.query.limit as string) || 50;
  const trades = orderBook.getTrades(pair, limit);
  res.json(trades);
});

// ─── H-02 FIX: Submit order requires auth ──────────────────────────
app.post("/api/orders", authMiddleware, userOrderLimiter, (req, res) => {
  const { pair, side, price, amount } = req.body;
  const user = req.user?.id;

  if (!user || !pair || !side || !price || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const parsedPrice = parseFloat(price);
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedPrice) || isNaN(parsedAmount) || parsedPrice <= 0 || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid price or amount" });
  }
  if (!["buy", "sell"].includes(side)) {
    return res.status(400).json({ error: "Side must be 'buy' or 'sell'" });
  }

  const order = orderBook.submitOrder({ user, pair, side, price: parsedPrice, amount: parsedAmount });
  res.json(order);
});

// ─── H-02 FIX: Cancel order requires auth ──────────────────────────
app.delete("/api/orders/:id", authMiddleware, (req, res) => {
  const user = req.user?.id || "";
  const success = orderBook.cancelOrder(req.params.id, user);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Order not found or not yours" });
  }
});

app.get("/api/orders/:pair/:user", (req, res) => {
  const orders = orderBook.getUserOrders(req.params.pair, req.params.user);
  res.json(orders);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/pairs", (req, res) => {
  res.json(["3DOT/USDT", "TDOT/USDT", "3DOT/BTC", "3DOT/BNB", "3DOT/USDC", "3DOT/XRP"]);
});

// ─── HTTP + WebSocket Server ──────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server });

const pairSubscribers: Map<string, Set<WebSocket>> = new Map();

wss.on("connection", (ws, req) => {
  console.log("WebSocket client connected");

  // ─── L-03: WebSocket authentication ──────────────────────────────
  let authenticated = false;
  let userId: string | null = null;

  // Check for auth token in URL query params or first message
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (token) {
    const data = verifyToken(token) as any;
    if (data) {
      authenticated = true;
      userId = data.userId;
      console.log(`WS authenticated as user: ${userId}`);
    }
  }

  let subscribedPair: string | null = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // If not authenticated, first message must be auth
      if (!authenticated) {
        if (msg.type === "auth" && msg.token) {
          const authData = verifyToken(msg.token) as any;
          if (authData) {
            authenticated = true;
            userId = authData.userId;
            ws.send(JSON.stringify({ type: "auth", success: true }));
            console.log(`WS authenticated as user: ${userId}`);
            return;
          }
        }
        ws.send(JSON.stringify({ type: "auth", success: false, error: "Authentication required" }));
        return;
      }

      if (msg.type === "subscribe" && msg.pair) {
        subscribedPair = msg.pair;
        if (!pairSubscribers.has(msg.pair)) {
          pairSubscribers.set(msg.pair, new Set());
        }
        pairSubscribers.get(msg.pair)!.add(ws);

        const snapshot = orderBook.getOrderBook(msg.pair);
        ws.send(JSON.stringify({ type: "snapshot", data: snapshot }));

        orderBook.subscribe(msg.pair, (snap) => {
          const subs = pairSubscribers.get(msg.pair);
          if (subs) {
            const msg = JSON.stringify({ type: "update", data: snap });
            subs.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
              }
            });
          }
        });
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  ws.on("close", () => {
    if (subscribedPair) {
      pairSubscribers.get(subscribedPair)?.delete(ws);
    }
    console.log("WebSocket client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Hexchange API running on http://localhost:${PORT}`);
  console.log(`WebSocket available on ws://localhost:${PORT}`);
});
