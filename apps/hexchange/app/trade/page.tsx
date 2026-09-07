"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";
const TOKEN_KEY = "hexchange_token";

const PAIRS = ["DOT/USDT", "BTC/USDT", "ETH/USDT", "3DOT/USDT", "SOL/USDT"];

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"];

export default function TradePage() {
  const [selectedPair, setSelectedPair] = useState("DOT/USDT");
  const [activeTimeframe, setActiveTimeframe] = useState("1H");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [bottomTab, setBottomTab] = useState("Open Orders");
  const [token, setToken] = useState("");
  const [orderBook, setOrderBook] = useState<any>({ bids: [], asks: [], lastPrice: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  // Fetch order book
  const fetchOrderBook = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/orderbook/${encodeURIComponent(selectedPair)}`);
      if (res.ok) setOrderBook(await res.json());
    } catch {}
  }, [selectedPair]);

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 3000);
    return () => clearInterval(interval);
  }, [fetchOrderBook]);

  // Submit order
  const handleSubmit = async () => {
    if (!token || !amount) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pair: selectedPair, side, price: orderType === "market" ? (side === "buy" ? "999999" : "0.01") : price, amount }),
      });
      if (res.ok) { setAmount(""); setPrice(""); }
    } catch {}
    setSubmitting(false);
  };

  const asks = orderBook.asks?.slice(0, 8) || [];
  const bids = orderBook.bids?.slice(0, 8) || [];
  const maxAsk = Math.max(...asks.map((a: any) => a.amount), 1);
  const maxBid = Math.max(...bids.map((b: any) => b.amount), 1);

  // Candlestick data for chart
  const candles = [
    { o: 12.5, c: 12.8, h: 12.9, l: 12.4 }, { o: 12.8, c: 12.6, h: 12.9, l: 12.5 },
    { o: 12.6, c: 12.9, h: 13.0, l: 12.5 }, { o: 12.9, c: 13.1, h: 13.2, l: 12.8 },
    { o: 13.1, c: 12.9, h: 13.2, l: 12.8 }, { o: 12.9, c: 13.0, h: 13.1, l: 12.8 },
    { o: 13.0, c: 12.7, h: 13.1, l: 12.6 }, { o: 12.7, c: 12.9, h: 13.0, l: 12.6 },
    { o: 12.9, c: 13.2, h: 13.3, l: 12.8 }, { o: 13.2, c: 13.0, h: 13.3, l: 12.9 },
    { o: 13.0, c: 13.1, h: 13.2, l: 12.9 }, { o: 13.1, c: 12.8, h: 13.2, l: 12.7 },
    { o: 12.8, c: 12.6, h: 12.9, l: 12.5 }, { o: 12.6, c: 12.9, h: 13.0, l: 12.5 },
    { o: 12.9, c: 13.1, h: 13.2, l: 12.8 }, { o: 13.1, c: 12.9, h: 13.2, l: 12.8 },
    { o: 12.9, c: 13.0, h: 13.1, l: 12.8 }, { o: 13.0, c: 12.8, h: 13.1, l: 12.7 },
    { o: 12.8, c: 12.7, h: 12.9, l: 12.6 }, { o: 12.7, c: 12.9, h: 13.0, l: 12.6 },
    { o: 12.9, c: 13.1, h: 13.2, l: 12.8 }, { o: 13.1, c: 12.9, h: 13.2, l: 12.8 },
    { o: 12.9, c: 13.0, h: 13.1, l: 12.8 }, { o: 13.0, c: 13.2, h: 13.3, l: 12.9 },
  ];
  const vols = [50, 70, 40, 45, 80, 30, 65, 90, 55, 40, 75, 60, 45, 85, 100, 110, 70, 55, 60, 95, 75, 80, 65, 50];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ─── Sub-header: Pair info + Stats (Figma: sub-header 1440x60) ─── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, padding: "0 24px",
        background: "#0a0b13", borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Pair */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>D</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{selectedPair}</span>
          </div>
          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-green)" }}>
              ${orderBook.lastPrice?.toFixed(3) || "12.847"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-green)" }}>+3.24%</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { label: "24h High", value: "13.102" },
            { label: "24h Low", value: "12.341" },
            { label: "24h Volume", value: "$847.2M" },
            { label: "Liquidity", value: "$1.24B" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#6b7280" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Pair Tabs ─── */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", background: "#0a0b13", borderBottom: "1px solid var(--border-subtle)" }}>
        {PAIRS.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPair(p)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: selectedPair === p ? 600 : 500,
              color: selectedPair === p ? "var(--text-primary)" : "var(--text-tertiary)",
              background: "none", border: "none", borderBottom: selectedPair === p ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer", fontFamily: "var(--font-body)",
            }}
          >{p}</button>
        ))}
      </div>

      {/* ─── Main Split: Order Book | Chart | Order Entry ─── */}
      <div style={{ display: "flex", height: 480 }}>
        {/* Order Book (Figma: 280x480 bg-secondary) */}
        <div style={{ width: 280, background: "#0d0e16", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
          {/* OB Header */}
          <div style={{ padding: "12px 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Order Book</span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>0.001</span>
          </div>
          {/* Table Headers */}
          <div style={{ display: "flex", padding: "8px 12px", fontSize: 10, fontWeight: 600, color: "#6b7280" }}>
            <span style={{ flex: 1 }}>Price (USDT)</span>
            <span style={{ flex: 1, textAlign: "right" }}>Size ({selectedPair.split("/")[0]})</span>
            <span style={{ width: 50, textAlign: "right" }}>Total</span>
          </div>
          {/* Asks */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {asks.map((ask: any, i: number) => (
              <div key={i} style={{ position: "relative", height: 22, display: "flex", alignItems: "center", padding: "0 12px" }}>
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(ask.amount / maxAsk) * 100}%`, background: "rgba(239, 68, 68, 0.08)" }} />
                <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent-red)", position: "relative", zIndex: 1 }}>{ask.price.toFixed(3)}</span>
                <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "right", position: "relative", zIndex: 1 }}>{ask.amount.toFixed(0)}</span>
                <span style={{ width: 50, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textAlign: "right", position: "relative", zIndex: 1 }}>{(ask.price * ask.amount).toFixed(0)}</span>
              </div>
            ))}
          </div>
          {/* Spread */}
          <div style={{ padding: "8px 12px", background: "var(--bg-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Spread</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>0.002 (0.02%)</span>
            </div>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>${orderBook.lastPrice?.toFixed(3) || "12.846"}</span>
          </div>
          {/* Bids */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {bids.map((bid: any, i: number) => (
              <div key={i} style={{ position: "relative", height: 22, display: "flex", alignItems: "center", padding: "0 12px" }}>
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(bid.amount / maxBid) * 100}%`, background: "rgba(16, 185, 129, 0.08)" }} />
                <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent-green)", position: "relative", zIndex: 1 }}>{bid.price.toFixed(3)}</span>
                <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "right", position: "relative", zIndex: 1 }}>{bid.amount.toFixed(0)}</span>
                <span style={{ width: 50, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textAlign: "right", position: "relative", zIndex: 1 }}>{(bid.price * bid.amount).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Panel (Figma: 820x480) */}
        <div style={{ flex: 1, background: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
          {/* Chart Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 36, background: "#0d0e16", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  style={{
                    padding: "4px 8px", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)",
                    background: activeTimeframe === tf ? "var(--accent-blue)" : "transparent",
                    color: activeTimeframe === tf ? "#fff" : "var(--text-tertiary)",
                    border: "none", cursor: "pointer",
                  }}
                >{tf}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", background: "#121420", borderRadius: 6, padding: 2 }}>
                <button style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "none" }}>Candles</button>
                <button style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, color: "var(--text-muted)", border: "none", background: "none" }}>Line</button>
              </div>
            </div>
          </div>
          {/* Chart Canvas */}
          <div style={{ flex: 1, padding: 24, position: "relative" }}>
            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8].map((y) => (
              <div key={y} style={{ position: "absolute", left: 24, right: 24, top: `${y * 100}%`, height: 1, background: "rgba(255,255,255,0.04)" }} />
            ))}
            {/* Candlesticks */}
            <div style={{ display: "flex", gap: 6, height: "70%", alignItems: "flex-end", paddingTop: 40 }}>
              {candles.map((c, i) => {
                const isGreen = c.c >= c.o;
                const bodyTop = Math.max(c.o, c.c);
                const bodyBot = Math.min(c.o, c.c);
                const range = 13.3 - 12.4;
                const bodyH = Math.max(((bodyTop - bodyBot) / range) * 100, 8);
                const wickH = ((c.h - c.l) / range) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    {/* Wick */}
                    <div style={{ width: 1, height: `${wickH}%`, background: isGreen ? "var(--accent-green)" : "var(--accent-red)" }} />
                    {/* Body */}
                    <div style={{ width: 10, height: `${bodyH}%`, background: isGreen ? "var(--accent-green)" : "var(--accent-red)", borderRadius: 1 }} />
                  </div>
                );
              })}
            </div>
            {/* Volume bars */}
            <div style={{ display: "flex", gap: 6, height: "25%", alignItems: "flex-end", marginTop: 4 }}>
              {vols.map((v, i) => {
                const isGreen = candles[i]?.c >= candles[i]?.o;
                return (
                  <div key={i} style={{ flex: 1, height: `${(v / 110) * 100}%`, background: isGreen ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", borderRadius: 1 }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Entry (Figma: 340x480 bg-secondary) */}
        <div style={{ width: 340, background: "#0d0e16", borderLeft: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
          {/* Side Tabs */}
          <div style={{ display: "flex", height: 40 }}>
            <button onClick={() => setSide("buy")} style={{ flex: 1, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: side === "buy" ? "rgba(16, 185, 129, 0.1)" : "transparent", color: side === "buy" ? "var(--accent-green)" : "var(--text-muted)", borderBottom: side === "buy" ? "2px solid var(--accent-green)" : "2px solid transparent" }}>Buy</button>
            <button onClick={() => setSide("sell")} style={{ flex: 1, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: side === "sell" ? "rgba(239, 68, 68, 0.1)" : "transparent", color: side === "sell" ? "var(--accent-red)" : "var(--text-muted)", borderBottom: side === "sell" ? "2px solid var(--accent-red)" : "2px solid transparent" }}>Sell</button>
          </div>

          {/* Order Form */}
          <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Order Type */}
            <div style={{ display: "flex", gap: 4, background: "var(--bg-primary)", borderRadius: 6, padding: 3 }}>
              {(["limit", "market", "stop"] as const).map((t) => (
                <button key={t} onClick={() => setOrderType(t)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
                  background: orderType === t ? "var(--bg-quaternary)" : "transparent",
                  color: orderType === t ? "var(--text-primary)" : "var(--text-muted)",
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            {/* Price */}
            {orderType === "limit" && (
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Price (USDT)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.000"
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: 6, color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-mono)" }} />
              </div>
            )}

            {/* Amount */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Amount ({selectedPair.split("/")[0]})</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.000"
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: 6, color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-mono)" }} />
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {["25%", "50%", "75%", "100%"].map((pct) => (
                  <button key={pct} style={{ flex: 1, padding: "3px 0", borderRadius: 4, fontSize: 10, color: "var(--text-muted)", background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>{pct}</button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Total (USDT)</label>
              <div style={{ padding: "8px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: 6, color: "var(--text-tertiary)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                {price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "0.00"}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!token || submitting || !amount}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", marginTop: 4,
                background: side === "buy" ? "var(--accent-green)" : "var(--accent-red)",
                color: "#fff",
                opacity: !token || submitting || !amount ? 0.5 : 1,
              }}
            >
              {!token ? "Connect Wallet" : submitting ? "Placing..." : side === "buy" ? `Buy ${selectedPair.split("/")[0]}` : `Sell ${selectedPair.split("/")[0]}`}
            </button>

            {/* Available */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
              <span>Available USDT</span>
              <span style={{ color: "var(--text-secondary)" }}>0.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Panel (Figma: bottom-panel 1440x420) ─── */}
      <div style={{ background: "#0d0e16", borderTop: "1px solid var(--border-subtle)" }}>
        {/* Panel Tabs */}
        <div style={{ display: "flex", gap: 0, padding: "0 16px", height: 40, borderBottom: "1px solid var(--border-subtle)" }}>
          {["Open Orders", "Order History", "Trade History", "Funds", "Positions"].map((tab) => (
            <button key={tab} onClick={() => setBottomTab(tab)} style={{
              padding: "8px 16px", fontSize: 12, fontWeight: bottomTab === tab ? 600 : 400,
              color: bottomTab === tab ? "var(--text-primary)" : "var(--text-muted)",
              background: "none", border: "none", borderBottom: bottomTab === tab ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer", fontFamily: "var(--font-body)",
            }}>{tab}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ padding: "12px 16px", minHeight: 100 }}>
          <div style={{ display: "flex", padding: "6px 8px", fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span style={{ width: 120 }}>Date</span>
            <span style={{ width: 80 }}>Pair</span>
            <span style={{ width: 60 }}>Side</span>
            <span style={{ width: 60 }}>Type</span>
            <span style={{ width: 80 }}>Price</span>
            <span style={{ width: 80 }}>Amount</span>
            <span style={{ width: 80 }}>Total</span>
            <span style={{ width: 80 }}>Filled</span>
            <span style={{ width: 80 }}>Status</span>
          </div>
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>
            {token ? "No open orders" : "Connect wallet to view orders"}
          </div>
        </div>
      </div>
    </div>
  );
}
