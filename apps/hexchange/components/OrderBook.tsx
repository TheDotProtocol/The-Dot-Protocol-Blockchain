"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchOrderBook } from "@/lib/wallet";

interface OrderLevel {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookData {
  pair: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  lastPrice: number;
  timestamp: number;
}

export default function OrderBook() {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [pair, setPair] = useState("3DOT/USDT");
  const [view, setView] = useState<"both" | "bids" | "asks">("both");
  const [connected, setConnected] = useState(false);

  const loadOrderBook = useCallback(async () => {
    const result = await fetchOrderBook(pair);
    setData(result);
  }, [pair]);

  // Initial load + polling
  useEffect(() => {
    loadOrderBook();
    const interval = setInterval(loadOrderBook, 3000); // Refresh every 3s
    return () => clearInterval(interval);
  }, [loadOrderBook]);

  // WebSocket for live updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("ws://localhost:3006");
      ws.onopen = () => {
        setConnected(true);
        ws?.send(JSON.stringify({ type: "subscribe", pair }));
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "update" && msg.data.pair === pair) {
          setData(msg.data);
        }
      };
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
    } catch {
      setConnected(false);
    }
    return () => { ws?.close(); };
  }, [pair]);

  const maxBidTotal = data?.bids.length ? data.bids[data.bids.length - 1].total : 1;
  const maxAskTotal = data?.asks.length ? data.asks[data.asks.length - 1].total : 1;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Order Book</h2>
          {connected && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
        </div>
        <select
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          className="bg-gray-800 text-sm px-2 py-1 rounded border border-gray-700"
        >
          <option value="3DOT/USDT">3DOT/USDT</option>
          <option value="3DOT/BTC">3DOT/BTC</option>
          <option value="3DOT/BNB">3DOT/BNB</option>
        </select>
      </div>

      <div className="flex gap-1 mb-3">
        {(["both", "bids", "asks"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs px-2 py-1 rounded ${view === v ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-500"}`}
          >
            {v === "both" ? "Both" : v === "bids" ? "Bids" : "Asks"}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>

      {!data ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <>
          {/* Asks (reversed) */}
          {(view === "both" || view === "asks") && (
            <div className="space-y-0.5 mb-1">
              {[...data.asks].reverse().map((ask, i) => (
                <LevelRow key={`a-${i}`} {...ask} maxTotal={maxAskTotal} side="ask" />
              ))}
            </div>
          )}

          {/* Spread */}
          <div className="text-center py-2 border-y border-gray-800 my-1">
            <span className="text-lg font-bold text-green-400">
              ${data.lastPrice.toFixed(data.lastPrice < 0.1 ? 6 : 2)}
            </span>
          </div>

          {/* Bids */}
          {(view === "both" || view === "bids") && (
            <div className="space-y-0.5">
              {data.bids.map((bid, i) => (
                <LevelRow key={`b-${i}`} {...bid} maxTotal={maxBidTotal} side="bid" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LevelRow({ price, amount, total, maxTotal, side }: OrderLevel & { maxTotal: number; side: "bid" | "ask" }) {
  const width = Math.min((total / maxTotal) * 100, 100);
  const color = side === "bid" ? "green" : "red";

  return (
    <div className="relative flex justify-between text-sm px-2 py-0.5 hover:bg-gray-800/30 cursor-pointer">
      <div
        className={`absolute inset-0 opacity-[0.07] bg-${color}-500`}
        style={{ width: `${width}%` }}
      />
      <span className={`relative text-${color}-400 font-mono text-xs`}>{price.toFixed(6)}</span>
      <span className="relative text-gray-300 font-mono text-xs">{amount.toLocaleString()}</span>
      <span className="relative text-gray-500 font-mono text-xs">${total.toFixed(0)}</span>
    </div>
  );
}
