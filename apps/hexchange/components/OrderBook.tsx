"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchOrderBook } from "@/lib/wallet";

interface OrderLevel { price: number; amount: number; total: number; }
interface OrderBookData { pair: string; bids: OrderLevel[]; asks: OrderLevel[]; lastPrice: number; timestamp: number; }
interface Trade { id: string; price: number; amount: number; side: string; timestamp: number; }

export default function OrderBook() {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [pair, setPair] = useState("3DOT/USDT");
  const [view, setView] = useState<"both" | "bids" | "asks">("both");
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("orderbook");

  const loadOrderBook = useCallback(async () => {
    const result = await fetchOrderBook(pair);
    setData(result);
  }, [pair]);

  useEffect(() => {
    loadOrderBook();
    const interval = setInterval(loadOrderBook, 3000);
    return () => clearInterval(interval);
  }, [loadOrderBook]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("ws://localhost:3006");
      ws.onopen = () => { setConnected(true); ws?.send(JSON.stringify({ type: "subscribe", pair })); };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "update" && msg.data.pair === pair) setData(msg.data);
      };
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
    } catch { setConnected(false); }
    return () => { ws?.close(); };
  }, [pair]);

  const maxBidTotal = data?.bids.length ? data.bids[data.bids.length - 1].total : 1;
  const maxAskTotal = data?.asks.length ? data.asks[data.asks.length - 1].total : 1;
  const spread = data?.asks.length && data?.bids.length ? (data.asks[0].price - data.bids[0].price).toFixed(6) : "—";

  return (
    <div className="card p-0 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Order Book</h2>
            {connected && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live" />}
          </div>
          <select value={pair} onChange={(e) => setPair(e.target.value)}
            className="bg-[#1a1f2e] text-sm px-3 py-1.5 rounded-lg border border-gray-700/50 text-gray-300 outline-none focus:border-orange-500/30 cursor-pointer">
            <option value="3DOT/USDT">3DOT / USDT</option>
            <option value="3DOT/BTC">3DOT / BTC</option>
            <option value="3DOT/BNB">3DOT / BNB</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0d1117] p-1 rounded-lg">
          {(["orderbook", "trades"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${activeTab === tab ? "bg-[#1f2937] text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {tab === "orderbook" ? "Order Book" : "Trades"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "orderbook" ? (
        <>
          {/* View Toggle */}
          <div className="px-5 py-2 flex gap-1">
            {(["both", "bids", "asks"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${view === v ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-gray-500 hover:text-gray-300"}`}>
                {v === "both" ? "Both" : v === "bids" ? "Bids" : "Asks"}
              </button>
            ))}
          </div>

          {/* Column Headers */}
          <div className="px-5 flex justify-between text-[10px] text-gray-600 uppercase tracking-wider mb-1">
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          {!data ? (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm py-8">
              <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-5">
              {/* Asks (reversed) */}
              {(view === "both" || view === "asks") && (
                <div className="space-y-0.5 mb-1">
                  {[...data.asks].reverse().slice(0, 12).map((ask, i) => (
                    <LevelRow key={`a-${i}`} {...ask} maxTotal={maxAskTotal} side="ask" />
                  ))}
                </div>
              )}

              {/* Spread */}
              <div className="flex items-center justify-between py-2.5 px-2 my-1 rounded-lg bg-[#0d1117]">
                <span className="text-lg font-bold text-green-400">
                  ${data.lastPrice.toFixed(data.lastPrice < 0.1 ? 6 : 2)}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600">Spread</span>
                  <span className="text-orange-400 font-medium">{spread}</span>
                </div>
              </div>

              {/* Bids */}
              {(view === "both" || view === "bids") && (
                <div className="space-y-0.5">
                  {data.bids.slice(0, 12).map((bid, i) => (
                    <LevelRow key={`b-${i}`} {...bid} maxTotal={maxBidTotal} side="bid" />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Trades Tab */
        <div className="flex-1 px-5 py-3 space-y-1">
          <div className="flex justify-between text-[10px] text-gray-600 uppercase tracking-wider mb-2">
            <span>Price</span>
            <span>Amount</span>
            <span>Time</span>
          </div>
          {data?.asks.slice(0, 15).map((ask, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span className="text-red-400 font-mono text-xs">{ask.price.toFixed(6)}</span>
              <span className="text-gray-400 font-mono text-xs">{ask.amount.toLocaleString()}</span>
              <span className="text-gray-600 text-xs">{new Date(Date.now() - i * 15000).toLocaleTimeString()}</span>
            </div>
          ))}
          {data?.bids.slice(0, 15).map((bid, i) => (
            <div key={`b-${i}`} className="flex justify-between text-sm py-1">
              <span className="text-green-400 font-mono text-xs">{bid.price.toFixed(6)}</span>
              <span className="text-gray-400 font-mono text-xs">{bid.amount.toLocaleString()}</span>
              <span className="text-gray-600 text-xs">{new Date(Date.now() - (i + 15) * 15000).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LevelRow({ price, amount, total, maxTotal, side }: OrderLevel & { maxTotal: number; side: "bid" | "ask" }) {
  const width = Math.min((total / maxTotal) * 100, 100);
  return (
    <div className="relative flex justify-between text-sm py-0.5 hover:bg-white/[0.02] cursor-pointer rounded-sm group">
      <div className={`absolute inset-0 ${side === "bid" ? "bg-green-500/5" : "bg-red-500/5"}`} style={{ width: `${width}%` }} />
      <span className={`relative font-mono text-xs ${side === "bid" ? "text-green-400" : "text-red-400"}`}>{price.toFixed(6)}</span>
      <span className="relative font-mono text-xs text-gray-300">{amount.toLocaleString()}</span>
      <span className="relative font-mono text-xs text-gray-600">${total.toFixed(0)}</span>
    </div>
  );
}
