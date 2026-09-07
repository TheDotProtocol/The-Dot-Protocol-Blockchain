"use client";

import { useState, useEffect, useCallback } from "react";
import OrderBook from "@/components/OrderBook";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";
const TOKEN_KEY = "hexchange_token";

export default function TradePage() {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const pairs = ["3DOT/USDT", "TDOT/USDT", "3DOT/BTC", "3DOT/BNB", "3DOT/USDC", "3DOT/XRP"];
  const [selectedPair, setSelectedPair] = useState("3DOT/USDT");

  // Check auth on mount
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  // Fetch user balances
  const fetchBalances = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/wallet/wallet/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, number> = {};
        data.wallets.forEach((w: any) => { map[w.token_symbol] = w.balance; });
        setBalances(map);
      }
    } catch (e) { /* ignore */ }
  }, [token]);

  // Fetch open orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/wallet/orders/open`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOpenOrders(data.orders);
      }
    } catch (e) { /* ignore */ }
  }, [token]);

  // Fetch order history
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/wallet/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrderHistory(data.orders);
      }
    } catch (e) { /* ignore */ }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBalances();
      fetchOrders();
      fetchHistory();
      const interval = setInterval(() => { fetchOrders(); fetchHistory(); }, 5000);
      return () => clearInterval(interval);
    }
  }, [token, fetchBalances, fetchOrders, fetchHistory]);

  // Submit order
  const handleSubmit = async () => {
    if (!token) { setError("Please login first"); return; }
    if (!price && orderType === "limit") { setError("Enter a price"); return; }
    if (!amount) { setError("Enter an amount"); return; }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pair: selectedPair,
          side,
          price: orderType === "market" ? (side === "buy" ? "999999" : "0.01") : price,
          amount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Order failed");
      } else {
        setSuccess(`${side === "buy" ? "Buy" : "Sell"} order placed!`);
        setAmount("");
        setPrice("");
        fetchOrders();
        fetchHistory();
      }
    } catch (e) {
      setError("Network error — is the API running?");
    }
    setSubmitting(false);
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (e) { /* ignore */ }
  };

  const baseToken = selectedPair.split("/")[0];
  const quoteToken = selectedPair.split("/")[1];
  const available = balances[quoteToken] || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Trade</h1>
          <span className="mode-badge mode-cex">CEX</span>
        </div>
        {!token && (
          <a href="/" className="text-xs text-orange-400 hover:text-orange-300">Login to trade →</a>
        )}
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
                onClick={() => { setSide("buy"); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  side === "buy"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => { setSide("sell"); setError(""); setSuccess(""); }}
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
                <label className="text-xs text-gray-500 mb-1 block">Price ({quoteToken})</label>
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
              <label className="text-xs text-gray-500 mb-1 block">Amount ({baseToken})</label>
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
                    onClick={() => {
                      const pctNum = parseInt(pct) / 100;
                      if (side === "buy" && price) {
                        setAmount(((available * pctNum) / parseFloat(price)).toFixed(4));
                      }
                    }}
                    className="flex-1 py-1 rounded text-[10px] text-gray-500 bg-[#0a0e17] border border-white/5 hover:text-white transition-colors"
                  >
                    {pct}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Total ({quoteToken})</label>
              <div className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                {price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "0.00"}
              </div>
            </div>

            {/* Error / Success */}
            {error && <div className="mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
            {success && <div className="mb-3 text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{success}</div>}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !token}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                side === "buy"
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              } ${(!token || submitting) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {!token ? "Login to Trade" : submitting ? "Placing Order..." : side === "buy" ? `Buy ${baseToken}` : `Sell ${baseToken}`}
            </button>

            {/* Available */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
              <span>Available {quoteToken}</span>
              <span className="text-white">{available.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="lg:col-span-2">
          <OrderBook />
        </div>
      </div>

      {/* Open Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Open Orders</h3>
          <span className="text-xs text-gray-500">{openOrders.length} orders</span>
        </div>
        {openOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            {token ? "No open orders" : "Login to view your orders"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Pair</th>
                  <th className="text-left py-2 font-medium">Side</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-right py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Filled</th>
                  <th className="text-right py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-2 text-white">{o.pair}</td>
                    <td className={`py-2 ${o.side === "buy" ? "text-green-400" : "text-red-400"}`}>{o.side.toUpperCase()}</td>
                    <td className="py-2 text-gray-400">{o.type}</td>
                    <td className="py-2 text-right text-white">{o.price}</td>
                    <td className="py-2 text-right text-white">{o.amount}</td>
                    <td className="py-2 text-right text-gray-400">{o.filled}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => cancelOrder(o.id)} className="text-red-400 hover:text-red-300">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Order History</h3>
          <span className="text-xs text-gray-500">{orderHistory.length} orders</span>
        </div>
        {orderHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            {token ? "No recent orders" : "Login to view history"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Pair</th>
                  <th className="text-left py-2 font-medium">Side</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Filled</th>
                  <th className="text-right py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.slice(0, 20).map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-2 text-white">{o.pair}</td>
                    <td className={`py-2 ${o.side === "buy" ? "text-green-400" : "text-red-400"}`}>{o.side.toUpperCase()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        o.status === "filled" ? "bg-green-500/10 text-green-400" :
                        o.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{o.status}</span>
                    </td>
                    <td className="py-2 text-right text-white">{o.price}</td>
                    <td className="py-2 text-right text-white">{o.amount}</td>
                    <td className="py-2 text-right text-gray-400">{o.filled}</td>
                    <td className="py-2 text-right text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
