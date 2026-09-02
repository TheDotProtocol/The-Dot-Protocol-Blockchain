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
    // Load existing orders from DB
    orderBook.loadFromDb();
    return;
  }

  // Seed demo data — use the demo user ID to satisfy foreign key
  const demoUser = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
  const seedUserId = demoUser ? demoUser.id : "00000000-0000-0000-0000-000000000001";

  // Disable foreign keys for seeding (random user addresses in seed data)
  db.pragma("foreign_keys = OFF");

  const pairs = ["3DOT/USDT", "TDOT/USDT"];
  for (const pair of pairs) {
    for (let i = 0; i < 10; i++) {
      const price =
        pair === "3DOT/USDT"
          ? 0.01 - i * 0.0001
          : 0.005 - i * 0.00005;
      orderBook.submitOrder({
        user: `0x${uuidv4().slice(0, 40)}`,
        pair,
        side: "buy",
        price: parseFloat(price.toFixed(6)),
        amount: Math.floor(Math.random() * 50000) + 1000,
      });
    }
    for (let i = 0; i < 10; i++) {
      const price =
        pair === "3DOT/USDT"
          ? 0.0101 + i * 0.0001
          : 0.00505 + i * 0.00005;
      orderBook.submitOrder({
        user: `0x${uuidv4().slice(0, 40)}`,
        pair,
        side: "sell",
        price: parseFloat(price.toFixed(6)),
        amount: Math.floor(Math.random() * 50000) + 1000,
      });
    }
  }

  // Re-enable foreign keys
  db.pragma("foreign_keys = ON");
}
