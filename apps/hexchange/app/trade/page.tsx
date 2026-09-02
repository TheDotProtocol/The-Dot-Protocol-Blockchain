"use client";

import { useState } from "react";
import OrderBook from "@/components/OrderBook";

export default function TradePage() {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  const pairs = ["3DOT/USDT", "TDOT/USDT", "3DOT/BTC", "3DOT/BNB", "3DOT/USDC", "3DOT/XRP"];
  const [selectedPair, setSelectedPair] = useState("3DOT/USDT");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Trade</h1>
          <span className="mode-badge mode-cex">CEX</span>
        </div>
        <span className="text-xs text-gray-500">Centralized order book trading</span>
      </div>

      {/* Pair Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {pairs.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPair(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPair === p
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "bg-[#111827] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            {/* Buy/Sell Tabs */}
            <div className="flex gap-1 mb-4 bg-[#0a0e17] rounded-lg p-1">
              <button
                onClick={() => setSide("buy")}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  side === "buy"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide("sell")}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  side === "sell"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Sell
              </button>
            </div>

            {/* Order Type */}
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => setOrderType("limit")}
                className={`trade-tab text-xs ${orderType === "limit" ? "active" : ""}`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType("market")}
                className={`trade-tab text-xs ${orderType === "market" ? "active" : ""}`}
              >
                Market
              </button>
            </div>

            {/* Price Input (limit only) */}
            {orderType === "limit" && (
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Price (USDT)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Amount ({selectedPair.split("/")[0]})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
              />
              <div className="flex gap-1 mt-2">
                {["25%", "50%", "75%", "100%"].map((pct) => (
                  <button
                    key={pct}
                    className="flex-1 py-1 rounded text-[10px] text-gray-500 bg-[#0a0e17] border border-white/5 hover:text-white transition-colors"
                  >
                    {pct}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Total (USDT)</label>
              <div className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                {price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "0.00"}
              </div>
            </div>

            {/* Submit */}
            <button
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                side === "buy"
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              }`}
            >
              {side === "buy" ? `Buy ${selectedPair.split("/")[0]}` : `Sell ${selectedPair.split("/")[0]}`}
            </button>

            {/* Available */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
              <span>Available USDT</span>
              <span className="text-white">0.00</span>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="lg:col-span-2">
          <OrderBook />
        </div>
      </div>

      {/* Open Orders */}
      <div className="card p-5 mt-4">
        <h3 className="text-sm font-semibold mb-3">Open Orders</h3>
        <div className="text-center py-8 text-gray-600 text-sm">
          Connect wallet to view your open orders
        </div>
      </div>

      {/* Order History */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-3">Order History</h3>
        <div className="text-center py-8 text-gray-600 text-sm">
          No recent orders
        </div>
      </div>
    </div>
  );
}
