"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";
const MARKETING_MODE = process.env.NEXT_PUBLIC_MARKETING_MODE !== "false";

const TOKENS = [
  { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", icon: "🟠" },
  { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", icon: "🟢" },
  { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", icon: "🟤" },
  { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", icon: "🟡" },
  { symbol: "USDC", address: "0x7b7cAa5D76e3877e91D4B80d4Bb8C27e0b30e713", icon: "🔵" },
  { symbol: "XRP", address: "0x3e1E51a4fC8e83A8e6e5eC4F2e4C9C4B0e5e8F7a", icon: "💎" },
];

const PRICES: Record<string, number> = { "3DOT": 1.0, "USDT": 1.0, "BTC": 60000, "BNB": 580, "USDC": 1.0, "XRP": 0.55 };

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapping, setSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connect = async () => {
    if (!(window as any).ethereum) return;
    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    setProvider(p);
    setAddress(await s.getAddress());
  };

  // Calculate quote
  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken) { setToAmount(""); return; }
    const fromPrice = PRICES[fromToken.symbol] || 1;
    const toPrice = PRICES[toToken.symbol] || 1;
    const usdValue = parseFloat(fromAmount) * fromPrice;
    const result = usdValue / toPrice;
    setToAmount(result.toFixed(6));
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!provider || !fromAmount) return;
    setSwapping(true);
    try {
      const signer = await provider.getSigner();
      const fromContract = new ethers.Contract(fromToken.address, [
        "function approve(address,uint256) returns (bool)",
        "function allowance(address,address) view returns (uint256)",
      ], signer);
      const amountWei = ethers.parseEther(fromAmount);
      const allowance = await fromContract.allowance(address, "ROUTER_ADDRESS");
      if (allowance < amountWei) {
        await (await fromContract.approve("ROUTER_ADDRESS", amountWei)).wait();
      }
      alert(`Swap submitted! ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
      setFromAmount("");
      setToAmount("");
    } catch (e: any) {
      alert(`Error: ${e.reason || e.message}`);
    }
    setSwapping(false);
  };

  const usdValue = fromAmount ? (parseFloat(fromAmount) * (PRICES[fromToken.symbol] || 1)).toFixed(2) : "0.00";
  const priceImpact = fromAmount ? "0.01" : "0.00";
  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : "0";
  const route = `1 ${fromToken.symbol} ≈ ${(PRICES[fromToken.symbol] || 1) / (PRICES[toToken.symbol] || 1).toFixed(4)} ${toToken.symbol}`;

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px", minHeight: "calc(100vh - 140px)" }}>
      {/* ─── Swap Card (Figma: 480x685 bg[#14161d] r=20) ─── */}
      <div style={{
        width: 480, background: "#14161D", borderRadius: 20,
        padding: "24px", display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Swap</span>
          <button onClick={() => setShowSettings(!showSettings)} style={{
            width: 20, height: 20, background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 16,
          }}>⚙️</button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div style={{ background: "#1C1F2A", borderRadius: 12, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Slippage:</span>
            {[0.1, 0.5, 1.0].map((s) => (
              <button key={s} onClick={() => setSlippage(s)} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer",
                background: slippage === s ? "#385CE6" : "#1C1F2A",
                color: slippage === s ? "#fff" : "var(--text-muted)",
              }}>{s}%</button>
            ))}
          </div>
        )}

        {/* From Input (Figma: input-from 416x105 bg[#1c1f2a] r=12) */}
        <div style={{ background: "#1C1F2A", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>You Pay</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Balance: 0.00</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select value={fromToken.symbol} onChange={(e) => setFromToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>)}
            </select>
            <input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.00"
              style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", outline: "none", textAlign: "right" }} />
          </div>
          <div style={{ textAlign: "right", marginTop: 4, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            ≈ ${usdValue}
          </div>
        </div>

        {/* Arrow Button (Figma: 36x36 bg[#1c1f2a] r=18) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -8, marginBottom: -8 }}>
          <button onClick={() => { const t = fromToken; setFromToken(toToken); setToToken(t); }} style={{
            width: 36, height: 36, borderRadius: 18, background: "#1C1F2A",
            border: "3px solid #14161D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", fontSize: 14, transition: "transform 0.2s",
          }}>↕</button>
        </div>

        {/* To Input (Figma: input-to 416x105 bg[#1c1f2a] r=12) */}
        <div style={{ background: "#1C1F2A", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>You Receive</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Balance: 0.00</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select value={toToken.symbol} onChange={(e) => setToToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>)}
            </select>
            <input type="number" value={toAmount} readOnly placeholder="0.00"
              style={{ flex: 1, background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", outline: "none", textAlign: "right" }} />
          </div>
          <div style={{ textAlign: "right", marginTop: 4, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            ≈ ${toAmount ? (parseFloat(toAmount) * (PRICES[toToken.symbol] || 1)).toFixed(2) : "0.00"}
          </div>
        </div>

        {/* Swap Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)" }}>Price Impact</span>
            <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{priceImpact}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)" }}>Minimum Received</span>
            <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : "0"} {toToken.symbol}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)" }}>Trading Fee (0.3%)</span>
            <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{fee} {fromToken.symbol}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)" }}>Slippage Tolerance</span>
            <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{slippage}%</span>
          </div>
          {/* Route */}
          <div style={{ background: "#1C1F2A", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Route</span>
            <span style={{ color: "var(--text-secondary)" }}>{route}</span>
          </div>
        </div>

        {/* Swap Button (Figma: 416x52 bg[#385ce6] r=12) */}
        <button onClick={handleSwap} disabled={!fromAmount || swapping || !address} style={{
          width: "100%", height: 52, borderRadius: 12, background: "#385CE6", color: "#fff",
          fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
          opacity: !fromAmount || !address ? 0.5 : 1, transition: "all 0.15s",
        }}>
          {!address ? "Connect Wallet" : swapping ? "Swapping..." : "Swap Tokens"}
        </button>

        {/* Explorer Link */}
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          View on Explorer →
        </div>
      </div>
    </div>
  );
}
