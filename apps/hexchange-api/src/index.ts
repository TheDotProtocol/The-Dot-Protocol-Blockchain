import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { orderBook, seedOrderBook } from "./engine";
import { optionalAuth } from "./middleware/auth";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// ─── Auth Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Seed order book with demo data
seedOrderBook();

// ─── REST Endpoints ───────────────────────────────────────────────

// Get order book
app.get("/api/orderbook/:pair", (req, res) => {
  const pair = decodeURIComponent(req.params.pair);
  const snapshot = orderBook.getOrderBook(pair);
  res.json(snapshot);
});

// Get recent trades
app.get("/api/trades/:pair", (req, res) => {
  const pair = decodeURIComponent(req.params.pair);
  const limit = parseInt(req.query.limit as string) || 50;
  const trades = orderBook.getTrades(pair, limit);
  res.json(trades);
});

// Submit order (auth optional — user derived from token or body)
app.post("/api/orders", optionalAuth, (req, res) => {
  const { pair, side, price, amount } = req.body;
  const user = req.user?.id || req.body.user;

  if (!user || !pair || !side || !price || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const order = orderBook.submitOrder({ user, pair, side, price: parseFloat(price), amount: parseFloat(amount) });
  res.json(order);
});

// Cancel order
app.delete("/api/orders/:id", (req, res) => {
  const { user } = req.body || {};
  const success = orderBook.cancelOrder(req.params.id, user);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Order not found or not yours" });
  }
});

// Get user orders
app.get("/api/orders/:pair/:user", (req, res) => {
  const orders = orderBook.getUserOrders(req.params.pair, req.params.user);
  res.json(orders);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Available pairs
app.get("/api/pairs", (req, res) => {
  res.json(["3DOT/USDT", "TDOT/USDT"]);
});

// ─── HTTP + WebSocket Server ──────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connections per pair
const pairSubscribers: Map<string, Set<WebSocket>> = new Map();

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  let subscribedPair: string | null = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "subscribe" && msg.pair) {
        subscribedPair = msg.pair;
        if (!pairSubscribers.has(msg.pair)) {
          pairSubscribers.set(msg.pair, new Set());
        }
        pairSubscribers.get(msg.pair)!.add(ws);

        // Send initial snapshot
        const snapshot = orderBook.getOrderBook(msg.pair);
        ws.send(JSON.stringify({ type: "snapshot", data: snapshot }));

        // Subscribe to updates
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
