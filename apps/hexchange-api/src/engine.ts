import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db/schema";

export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partial" | "filled" | "cancelled";

export interface Order {
  id: string;
  user: string;
  pair: string;
  side: OrderSide;
  price: number;
  amount: number;
  filled: number;
  status: OrderStatus;
  timestamp: number;
}

export interface Trade {
  id: string;
  pair: string;
  buyOrderId: string;
  sellOrderId: string;
  buyer: string;
  seller: string;
  price: number;
  amount: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookSnapshot {
  pair: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastPrice: number;
  timestamp: number;
}

class OrderBook {
  private orders: Map<string, Order> = new Map();
  private pairOrders: Map<string, Set<string>> = new Map();
  private trades: Trade[] = [];
  private listeners: Map<string, (snapshot: OrderBookSnapshot) => void> = new Map();

  /** Load open orders and recent trades from SQLite on startup */
  loadFromDb(): void {
    const db = getDb();

    // Load open/partial orders
    const rows = db
      .prepare("SELECT * FROM orders WHERE status IN ('open', 'partial')")
      .all() as any[];

    for (const row of rows) {
      const order: Order = {
        id: row.id,
        user: row.user_id,
        pair: row.pair,
        side: row.side,
        price: row.price,
        amount: row.amount,
        filled: row.filled,
        status: row.status,
        timestamp: new Date(row.created_at).getTime(),
      };
      this.orders.set(order.id, order);
      if (!this.pairOrders.has(order.pair)) {
        this.pairOrders.set(order.pair, new Set());
      }
      this.pairOrders.get(order.pair)!.add(order.id);
    }

    // Load recent trades
    const tradeRows = db
      .prepare("SELECT * FROM trades ORDER BY created_at DESC LIMIT 500")
      .all() as any[];

    for (const row of tradeRows) {
      this.trades.push({
        id: row.id,
        pair: row.pair,
        buyOrderId: row.buy_order_id,
        sellOrderId: row.sell_order_id,
        buyer: row.buyer_id,
        seller: row.seller_id,
        price: row.price,
        amount: row.amount,
        timestamp: new Date(row.created_at).getTime(),
      });
    }

    console.log(
      `Loaded ${this.orders.size} open orders and ${this.trades.length} trades from DB`
    );
  }

  submitOrder(
    order: Omit<Order, "id" | "filled" | "status" | "timestamp">
  ): Order {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      filled: 0,
      status: "open",
      timestamp: Date.now(),
    };

    // Persist to SQLite
    const db = getDb();
    db.prepare(
      `INSERT INTO orders (id, user_id, pair, side, type, price, amount, filled, status)
       VALUES (?, ?, ?, ?, 'limit', ?, ?, ?, ?)`
    ).run(
      newOrder.id,
      newOrder.user,
      newOrder.pair,
      newOrder.side,
      newOrder.price,
      newOrder.amount,
      newOrder.filled,
      newOrder.status
    );

    // In-memory index
    this.orders.set(newOrder.id, newOrder);
    if (!this.pairOrders.has(order.pair)) {
      this.pairOrders.set(order.pair, new Set());
    }
    this.pairOrders.get(order.pair)!.add(newOrder.id);

    // Try to match
    this.matchOrder(newOrder);

    // Notify listeners
    this.notify(order.pair);

    return newOrder;
  }

  cancelOrder(orderId: string, user: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.user !== user) return false;
    if (order.status === "filled") return false;

    order.status = "cancelled";

    // Persist
    const db = getDb();
    db.prepare(
      "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(orderId);

    this.notify(order.pair);
    return true;
  }

  getOrderBook(pair: string): OrderBookSnapshot {
    const orderIds = this.pairOrders.get(pair) || new Set();
    const bids: Map<number, number> = new Map();
    const asks: Map<number, number> = new Map();

    for (const id of orderIds) {
      const order = this.orders.get(id);
      if (!order || order.status === "cancelled" || order.status === "filled")
        continue;

      const remaining = order.amount - order.filled;
      const bucket = order.side === "buy" ? bids : asks;
      bucket.set(
        order.price,
        (bucket.get(order.price) || 0) + remaining
      );
    }

    const sortedBids = Array.from(bids.entries())
      .sort((a, b) => b[0] - a[0])
      .reduce(
        (acc, [price, amount], i) => {
          const total = i === 0 ? amount : acc[i - 1].total + amount;
          acc.push({ price, amount, total });
          return acc;
        },
        [] as OrderBookLevel[]
      );

    const sortedAsks = Array.from(asks.entries())
      .sort((a, b) => a[0] - b[0])
      .reduce(
        (acc, [price, amount], i) => {
          const total = i === 0 ? amount : acc[i - 1].total + amount;
          acc.push({ price, amount, total });
          return acc;
        },
        [] as OrderBookLevel[]
      );

    const lastTrade = this.trades.filter((t) => t.pair === pair).pop();

    return {
      pair,
      bids: sortedBids,
      asks: sortedAsks,
      lastPrice: lastTrade?.price || 0,
      timestamp: Date.now(),
    };
  }

  getTrades(pair: string, limit: number = 50): Trade[] {
    return this.trades.filter((t) => t.pair === pair).slice(-limit);
  }

  getUserOrders(pair: string, user: string): Order[] {
    const orderIds = this.pairOrders.get(pair) || new Set();
    return Array.from(orderIds)
      .map((id) => this.orders.get(id)!)
      .filter(
        (o) => o && o.user === user && o.status !== "cancelled"
      );
  }

  subscribe(
    pair: string,
    callback: (snapshot: OrderBookSnapshot) => void
  ): () => void {
    const id = uuidv4();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  private matchOrder(incoming: Order) {
    const orderIds = this.pairOrders.get(incoming.pair) || new Set();
    const oppositeSide = incoming.side === "buy" ? "sell" : "buy";

    const oppositeOrders = Array.from(orderIds)
      .map((id) => this.orders.get(id)!)
      .filter(
        (o) =>
          o &&
          o.side === oppositeSide &&
          o.status !== "cancelled" &&
          o.status !== "filled"
      )
      .sort((a, b) =>
        incoming.side === "buy" ? a.price - b.price : b.price - a.price
      );

    const db = getDb();
    const insertTrade = db.prepare(
      `INSERT INTO trades (id, pair, buy_order_id, sell_order_id, buyer_id, seller_id, price, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateOrder = db.prepare(
      "UPDATE orders SET filled = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );

    // Use a transaction for atomicity
    const fillBoth = db.transaction(() => {
      for (const existing of oppositeOrders) {
        if (incoming.status === "filled") break;

        const canMatch =
          incoming.side === "buy"
            ? incoming.price >= existing.price
            : incoming.price <= existing.price;

        if (!canMatch) continue;

        const incomingRemaining = incoming.amount - incoming.filled;
        const existingRemaining = existing.amount - existing.filled;
        const fillAmount = Math.min(incomingRemaining, existingRemaining);

        // Fill both orders
        incoming.filled += fillAmount;
        existing.filled += fillAmount;

        incoming.status =
          incoming.filled >= incoming.amount ? "filled" : "partial";
        existing.status =
          existing.filled >= existing.amount ? "filled" : "partial";

        // Persist fills
        updateOrder.run(incoming.filled, incoming.status, incoming.id);
        updateOrder.run(existing.filled, existing.status, existing.id);

        // Record trade
        const trade: Trade = {
          id: uuidv4(),
          pair: incoming.pair,
          buyOrderId:
            incoming.side === "buy" ? incoming.id : existing.id,
          sellOrderId:
            incoming.side === "sell" ? incoming.id : existing.id,
          buyer:
            incoming.side === "buy" ? incoming.user : existing.user,
          seller:
            incoming.side === "sell" ? incoming.user : existing.user,
          price: existing.price,
          amount: fillAmount,
          timestamp: Date.now(),
        };
        this.trades.push(trade);

        insertTrade.run(
          trade.id,
          trade.pair,
          trade.buyOrderId,
          trade.sellOrderId,
          trade.buyer,
          trade.seller,
          trade.price,
          trade.amount
        );
      }
    });

    fillBoth();
  }

  private notify(pair: string) {
    const snapshot = this.getOrderBook(pair);
    this.listeners.forEach((cb) => cb(snapshot));
  }
}

// Singleton
export const orderBook = new OrderBook();

// Pre-populate with demo data if DB is empty
export function seedOrderBook() {
  const db = getDb();
  const existing = db
    .prepare("SELECT COUNT(*) as count FROM orders")
    .get() as any;

  if (existing.count > 0) {
    orderBook.loadFromDb();
    return;
  }

  db.pragma("foreign_keys = OFF");

  // ─── MARKETING MODE: Realistic order book data ──────────────────
  // Simulates a live exchange with tight spreads, realistic volumes, and active trading
  const MARKETING_MODE = process.env.NEXT_PUBLIC_MARKETING_MODE !== "false";

  const pairs = [
    { name: "3DOT/USDT", midPrice: 1.0, spread: 0.001, vol: 5000 },
    { name: "TDOT/USDT", midPrice: 1.0, spread: 0.002, vol: 2000 },
    { name: "3DOT/BTC", midPrice: 0.0000167, spread: 0.003, vol: 800 },
    { name: "3DOT/BNB", midPrice: 0.00172, spread: 0.002, vol: 1200 },
    { name: "3DOT/USDC", midPrice: 1.0, spread: 0.001, vol: 3000 },
    { name: "3DOT/XRP", midPrice: 1.82, spread: 0.002, vol: 1500 },
  ];

  // Generate realistic wallet addresses that look like real traders
  const traderWallets = [
    "0x742d3A8f91B24c7E6a30D1f8e29C4b5e8A6f1234",
    "0x1a2b3C4d5E6f7890AbCdEf01234567890aBcDeF0",
    "0x9f8e7D6c5B4a392817161514131211100f0e0d0c",
    "0x5e4f3A2b1C0d9E8f7A6B5C4d3E2f1A0b9C8d7E6F",
    "0xab12Cd34Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv",
    "0x3456789aBcDeF0123456789aBcDeF0123456789aB",
    "0xdeadBeef1234567890AbCdEf0123456789aBcDeF0",
    "0xfaceB00c1234567890AbCdEf0123456789aBcDeF1",
    "0xc0ffee1234567890AbCdEf0123456789aBcDeF2",
    "0xbaadf00d1234567890AbCdEf0123456789aBcDeF3",
  ];

  for (const pair of pairs) {
    // Buy side: 15-25 orders with realistic depth
    const buyCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < buyCount; i++) {
      const priceDrop = (i * pair.midPrice * pair.spread * (0.5 + Math.random() * 1.5));
      const price = pair.midPrice - priceDrop;
      if (price <= 0) continue;

      // Volume decreases further from mid price, with some large orders (whales)
      const isWhale = Math.random() > 0.85;
      const baseAmount = isWhale
        ? pair.vol * (2 + Math.random() * 5)
        : pair.vol * (0.1 + Math.random() * 1.5);
      const amount = baseAmount * (1 - i * 0.02);

      orderBook.submitOrder({
        user: traderWallets[i % traderWallets.length],
        pair: pair.name,
        side: "buy",
        price: parseFloat(price.toFixed(8)),
        amount: Math.floor(Math.max(amount, 1)),
      });
    }

    // Sell side: 15-25 orders with realistic depth
    const sellCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < sellCount; i++) {
      const priceRise = (i * pair.midPrice * pair.spread * (0.5 + Math.random() * 1.5));
      const price = pair.midPrice + priceRise;

      const isWhale = Math.random() > 0.85;
      const baseAmount = isWhale
        ? pair.vol * (2 + Math.random() * 5)
        : pair.vol * (0.1 + Math.random() * 1.5);
      const amount = baseAmount * (1 - i * 0.02);

      orderBook.submitOrder({
        user: traderWallets[(i + 3) % traderWallets.length],
        pair: pair.name,
        side: "sell",
        price: parseFloat(price.toFixed(8)),
        amount: Math.floor(Math.max(amount, 1)),
      });
    }

    // Seed some completed trades for volume history
    const tradeCount = 20 + Math.floor(Math.random() * 30);
    for (let i = 0; i < tradeCount; i++) {
      const price = pair.midPrice * (0.998 + Math.random() * 0.004);
      const amount = pair.vol * (0.05 + Math.random() * 0.5);
      const minutesAgo = Math.floor(Math.random() * 1440);

      orderBook.submitOrder({
        user: traderWallets[i % traderWallets.length],
        pair: pair.name,
        side: "buy",
        price: parseFloat(price.toFixed(8)),
        amount: Math.floor(amount),
      });
      orderBook.submitOrder({
        user: traderWallets[(i + 5) % traderWallets.length],
        pair: pair.name,
        side: "sell",
        price: parseFloat(price.toFixed(8)),
        amount: Math.floor(amount),
      });
    }
  }

  db.pragma("foreign_keys = ON");
  console.log(`Order book seeded with ${MARKETING_MODE ? "marketing" : "minimal"} data for ${pairs.length} pairs`);
}
