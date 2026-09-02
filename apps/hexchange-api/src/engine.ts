import { v4 as uuidv4 } from "uuid";

export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partial" | "filled" | "cancelled";

export interface Order {
  id: string;
  user: string;
  pair: string;         // e.g., "3DOT/USDT"
  side: OrderSide;
  price: number;        // price in quote token
  amount: number;       // amount of base token
  filled: number;       // amount already filled
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
  bids: OrderBookLevel[];  // sorted high to low
  asks: OrderBookLevel[];  // sorted low to high
  lastPrice: number;
  timestamp: number;
}

// In-memory order book
class OrderBook {
  private orders: Map<string, Order> = new Map();
  private pairOrders: Map<string, Set<string>> = new Map();  // pair => order IDs
  private trades: Trade[] = [];
  private listeners: Map<string, (snapshot: OrderBookSnapshot) => void> = new Map();

  submitOrder(order: Omit<Order, "id" | "filled" | "status" | "timestamp">): Order {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      filled: 0,
      status: "open",
      timestamp: Date.now(),
    };

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
    this.notify(order.pair);
    return true;
  }

  getOrderBook(pair: string): OrderBookSnapshot {
    const orderIds = this.pairOrders.get(pair) || new Set();
    const bids: Map<number, number> = new Map();  // price => total amount
    const asks: Map<number, number> = new Map();

    for (const id of orderIds) {
      const order = this.orders.get(id);
      if (!order || order.status === "cancelled" || order.status === "filled") continue;

      const remaining = order.amount - order.filled;
      const bucket = order.side === "buy" ? bids : asks;
      bucket.set(order.price, (bucket.get(order.price) || 0) + remaining);
    }

    // Sort: bids high->low, asks low->high
    const sortedBids = Array.from(bids.entries())
      .sort((a, b) => b[0] - a[0])
      .reduce((acc, [price, amount], i) => {
        const total = i === 0 ? amount : acc[i - 1].total + amount;
        acc.push({ price, amount, total });
        return acc;
      }, [] as OrderBookLevel[]);

    const sortedAsks = Array.from(asks.entries())
      .sort((a, b) => a[0] - b[0])
      .reduce((acc, [price, amount], i) => {
        const total = i === 0 ? amount : acc[i - 1].total + amount;
        acc.push({ price, amount, total });
        return acc;
      }, [] as OrderBookLevel[]);

    const lastTrade = this.trades.filter(t => t.pair === pair).pop();

    return {
      pair,
      bids: sortedBids,
      asks: sortedAsks,
      lastPrice: lastTrade?.price || 0,
      timestamp: Date.now(),
    };
  }

  getTrades(pair: string, limit: number = 50): Trade[] {
    return this.trades.filter(t => t.pair === pair).slice(-limit);
  }

  getUserOrders(pair: string, user: string): Order[] {
    const orderIds = this.pairOrders.get(pair) || new Set();
    return Array.from(orderIds)
      .map(id => this.orders.get(id)!)
      .filter(o => o && o.user === user && o.status !== "cancelled");
  }

  subscribe(pair: string, callback: (snapshot: OrderBookSnapshot) => void): () => void {
    const id = uuidv4();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  private matchOrder(incoming: Order) {
    const orderIds = this.pairOrders.get(incoming.pair) || new Set();
    const oppositeSide = incoming.side === "buy" ? "sell" : "buy";

    // Get opposite orders sorted by price priority
    const oppositeOrders = Array.from(orderIds)
      .map(id => this.orders.get(id)!)
      .filter(o => o && o.side === oppositeSide && o.status !== "cancelled" && o.status !== "filled")
      .sort((a, b) => incoming.side === "buy" ? a.price - b.price : b.price - a.price);

    for (const existing of oppositeOrders) {
      if (incoming.status === "filled") break;

      // Price check
      const canMatch = incoming.side === "buy"
        ? incoming.price >= existing.price
        : incoming.price <= existing.price;

      if (!canMatch) continue;

      const incomingRemaining = incoming.amount - incoming.filled;
      const existingRemaining = existing.amount - existing.filled;
      const fillAmount = Math.min(incomingRemaining, existingRemaining);

      // Fill both orders
      incoming.filled += fillAmount;
      existing.filled += fillAmount;

      incoming.status = incoming.filled >= incoming.amount ? "filled" : "partial";
      existing.status = existing.filled >= existing.amount ? "filled" : "partial";

      // Record trade
      const trade: Trade = {
        id: uuidv4(),
        pair: incoming.pair,
        buyOrderId: incoming.side === "buy" ? incoming.id : existing.id,
        sellOrderId: incoming.side === "sell" ? incoming.id : existing.id,
        buyer: incoming.side === "buy" ? incoming.user : existing.user,
        seller: incoming.side === "sell" ? incoming.user : existing.user,
        price: existing.price, // maker price
        amount: fillAmount,
        timestamp: Date.now(),
      };
      this.trades.push(trade);
    }
  }

  private notify(pair: string) {
    const snapshot = this.getOrderBook(pair);
    this.listeners.forEach(cb => cb(snapshot));
  }
}

// Singleton
export const orderBook = new OrderBook();

// Pre-populate with some mock data for demo
export function seedOrderBook() {
  const pairs = ["3DOT/USDT", "TDOT/USDT"];

  for (const pair of pairs) {
    // Seed bids
    for (let i = 0; i < 10; i++) {
      const price = pair === "3DOT/USDT" ? 0.01 - i * 0.0001 : 0.005 - i * 0.00005;
      orderBook.submitOrder({
        user: `0x${uuidv4().slice(0, 40)}`,
        pair,
        side: "buy",
        price: parseFloat(price.toFixed(6)),
        amount: Math.floor(Math.random() * 50000) + 1000,
      });
    }
    // Seed asks
    for (let i = 0; i < 10; i++) {
      const price = pair === "3DOT/USDT" ? 0.0101 + i * 0.0001 : 0.00505 + i * 0.00005;
      orderBook.submitOrder({
        user: `0x${uuidv4().slice(0, 40)}`,
        pair,
        side: "sell",
        price: parseFloat(price.toFixed(6)),
        amount: Math.floor(Math.random() * 50000) + 1000,
      });
    }
  }
}
