"use client";

import { useState } from "react";

const TICKER = [
  { pair: "DOT/USDT", price: "6.42", change: "+4.2%", up: true },
  { pair: "BTC/USDT", price: "63,842.10", change: "-0.8%", up: false },
  { pair: "ETH/USDT", price: "3,450.25", change: "+1.5%", up: true },
  { pair: "3DOT/USDT", price: "12.84", change: "+12.4%", up: true },
  { pair: "SOL/USDT", price: "142.50", change: "+2.8%", up: true },
];

const WATCHLIST = [
  { symbol: "3DOT", name: "3DOT Token", price: "12.84", change: "+12.4%", up: true, vol: "$847M", market: "$1.24B" },
  { symbol: "DOT", name: "Polkadot", price: "6.42", change: "+4.2%", up: true, vol: "$312M", market: "$8.9B" },
  { symbol: "BTC", name: "Bitcoin", price: "63,842.10", change: "-0.8%", up: false, vol: "$18.2B", market: "$1.25T" },
  { symbol: "ETH", name: "Ethereum", price: "3,450.25", change: "+1.5%", up: true, vol: "$9.8B", market: "$414B" },
  { symbol: "SOL", name: "Solana", price: "142.50", change: "+2.8%", up: true, vol: "$2.1B", market: "$64B" },
  { symbol: "USDT", name: "Tether", price: "1.00", change: "+0.01%", up: true, vol: "$52B", market: "$112B" },
];

const RECENT_TRADES = [
  { pair: "3DOT/USDT", side: "buy", price: "12.847", amount: "1,250", total: "$16,059", time: "2m ago" },
  { pair: "BTC/USDT", side: "sell", price: "63,841.50", amount: "0.025", total: "$1,596", time: "5m ago" },
  { pair: "3DOT/USDT", side: "buy", price: "12.830", amount: "500", total: "$6,415", time: "8m ago" },
  { pair: "ETH/USDT", side: "sell", price: "3,449.00", amount: "2.5", total: "$8,623", time: "12m ago" },
  { pair: "3DOT/USDT", side: "buy", price: "12.815", amount: "2,000", total: "$25,630", time: "15m ago" },
];

export default function DashboardPage() {
  return (
    <div style={{ padding: "24px", maxWidth: 1440, margin: "0 auto" }}>
      {/* Market Ticker — Figma: market-ticker 1440x44 */}
      <div style={{ display: "flex", gap: 0, overflow: "hidden", padding: "12px 0", marginBottom: 24 }}>
        {TICKER.map((t) => (
          <div key={t.pair} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6" }}>{t.pair}</span>
            <span style={{ fontSize: 13, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>${t.price}</span>
            <span style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", color: t.up ? "#10B981" : "#EF4444" }}>{t.change}</span>
          </div>
        ))}
      </div>

      {/* Hero Stats — Figma: 4x stat cards 336x110 bg[#0d0f16] r=12 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Value Locked", value: "$1.24B", change: "+5.2%", icon: "🔒" },
          { label: "24h Trading Volume", value: "$847.2M", change: "+18.3%", icon: "📊" },
          { label: "24h Users", value: "12,847", change: "+8.7%", icon: "👥" },
          { label: "3DOT Price", value: "$12.84", change: "+12.4%", icon: "🟠" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#0d0f16", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#686D7D" }}>{s.label}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Watchlist — Figma: watchlist-container bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Watchlist</div>
          <div style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 600, color: "#686D7D", textTransform: "uppercase" }}>
            <span style={{ flex: 2 }}>Asset</span>
            <span style={{ flex: 1, textAlign: "right" }}>Price</span>
            <span style={{ flex: 1, textAlign: "right" }}>24h Change</span>
            <span style={{ flex: 1, textAlign: "right" }}>Volume</span>
            <span style={{ flex: 1, textAlign: "right" }}>Market Cap</span>
          </div>
          {WATCHLIST.map((w) => (
            <div key={w.symbol} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(56,92,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#385CE6" }}>{w.symbol[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6" }}>{w.symbol}</div>
                  <div style={{ fontSize: 11, color: "#686D7D" }}>{w.name}</div>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>${w.price}</div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono', monospace", color: w.up ? "#10B981" : "#EF4444" }}>{w.change}</div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>{w.vol}</div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>{w.market}</div>
            </div>
          ))}
        </div>

        {/* Recent Trades — Figma: trades-container bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Recent Trades</div>
          {RECENT_TRADES.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: t.side === "buy" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: t.side === "buy" ? "#10B981" : "#EF4444", fontWeight: 600 }}>{t.side.toUpperCase()}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6" }}>{t.pair}</span>
                </div>
                <div style={{ fontSize: 11, color: "#686D7D", marginTop: 2 }}>{t.time}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>{t.amount} @ ${t.price}</div>
                <div style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>{t.total}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row — Figma: activity-feed + liquidity-card */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Network Activity</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Block Height", value: "#5,095" },
              { label: "Avg Block Time", value: "1.2s" },
              { label: "Gas Price", value: "0.000001 gwei" },
              { label: "Active Validators", value: "7/7" },
              { label: "Total Accounts", value: "12,847" },
              { label: "Smart Contracts", value: "14" },
            ].map((n) => (
              <div key={n.label} style={{ padding: 12, background: "#080910", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#686D7D" }}>{n.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6", marginTop: 4 }}>{n.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Liquidity Pools</div>
          {[
            { pair: "3DOT/USDT", tvl: "$450K", apr: "45.2%" },
            { pair: "3DOT/BTC", tvl: "$280K", apr: "38.7%" },
            { pair: "3DOT/BNB", tvl: "$195K", apr: "42.1%" },
            { pair: "3DOT/USDC", tvl: "$320K", apr: "36.5%" },
          ].map((p) => (
            <div key={p.pair} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#F3F4F6" }}>{p.pair}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>TVL {p.tvl}</div>
                <div style={{ fontSize: 11, color: "#10B981" }}>APR {p.apr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
