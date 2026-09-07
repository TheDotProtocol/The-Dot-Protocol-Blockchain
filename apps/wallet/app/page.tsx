"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const TOKENS = [
  { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", decimals: 18, color: "#F97316", icon: "🟠", price: 1.0 },
  { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", decimals: 18, color: "#26A17B", icon: "🟢", price: 1.0 },
  { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", decimals: 18, color: "#F7931A", icon: "🟤", price: 60000 },
  { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", decimals: 18, color: "#F3BA2F", icon: "🟡", price: 580 },
  { symbol: "USDC", address: "0x7b7cAa5D76e3877e91D4B80d4Bb8C27e0b30e713", decimals: 18, color: "#2775CA", icon: "🔵", price: 1.0 },
  { symbol: "XRP", address: "0x3e1E51a4fC8e83A8e6e5eC4F2e4C9C4B0e5e8F7a", decimals: 18, color: "#00AAE4", icon: "💎", price: 0.55 },
];

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"];

export default function WalletHome() {
  const [tab, setTab] = useState<"portfolio" | "send" | "receive" | "history">("portfolio");
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState(0);
  const [balances, setBalances] = useState<Record<string, { balance: string; usd: number }>>({});
  const [nativeBalance, setNativeBalance] = useState("0");
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendToken, setSendToken] = useState(TOKENS[0]);
  const [sending, setSending] = useState(false);
  const [txHistory, setTxHistory] = useState<any[]>([]);

  const connect = async () => {
    if (!(window as any).ethereum) { alert("Install MetaMask"); return; }
    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    const addr = await s.getAddress();
    const net = await p.getNetwork();
    setProvider(p); setSigner(s); setAddress(addr); setChainId(Number(net.chainId));
    const bal = await p.getBalance(addr);
    setNativeBalance(ethers.formatEther(bal));
  };

  const fetchBalances = useCallback(async () => {
    if (!provider || !address) return;
    const b: Record<string, { balance: string; usd: number }> = {};
    for (const t of TOKENS) {
      try {
        const c = new ethers.Contract(t.address, ERC20_ABI, provider);
        const bal = await c.balanceOf(address);
        const fmt = ethers.formatUnits(bal, t.decimals);
        b[t.symbol] = { balance: fmt, usd: parseFloat(fmt) * t.price };
      } catch { b[t.symbol] = { balance: "0", usd: 0 }; }
    }
    setBalances(b);
  }, [provider, address]);

  useEffect(() => { connect(); }, []);
  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const handleSend = async () => {
    if (!signer || !sendTo || !sendAmount) return;
    setSending(true);
    try {
      const c = new ethers.Contract(sendToken.address, ERC20_ABI, signer);
      const tx = await c.transfer(sendTo, ethers.parseUnits(sendAmount, 18));
      setTxHistory(prev => [{ hash: tx.hash, to: sendTo, amount: sendAmount, token: sendToken.symbol, status: "pending", time: "Just now" }, ...prev]);
      await tx.wait();
      setTxHistory(prev => prev.map(tx => ({ ...tx, status: "confirmed" })));
      fetchBalances(); setSendTo(""); setSendAmount("");
    } catch (e: any) { alert(e.reason || e.message); }
    setSending(false);
  };

  const totalUsd = Object.values(balances).reduce((s, b) => s + b.usd, 0);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 24px", display: "flex", gap: 24, minHeight: "calc(100vh - 100px)" }}>
      {/* Left Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Portfolio Hero — Figma: 972x149 bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, color: "#686D7D", marginBottom: 4 }}>Total Balance</div>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>
            ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 13, color: "#686D7D", marginTop: 4 }}>
            Native: {parseFloat(nativeBalance).toFixed(4)} {chainId === 1546 ? "3DOT" : "TDOT"}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { icon: "📤", label: "Send", action: () => setTab("send") },
            { icon: "📥", label: "Receive", action: () => setTab("receive") },
            { icon: "🔄", label: "Swap", action: () => window.location.href = "http://localhost:3005" },
            { icon: "💳", label: "Pay", action: () => setTab("send") },
          ].map((a) => (
            <button key={a.label} onClick={a.action} style={{ flex: 1, padding: "16px 0", background: "#0d0f16", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#F3F4F6" }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Assets Table — Figma: 972x464 bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Assets</div>
          <div style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 600, color: "#686D7D", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span style={{ flex: 2 }}>Asset</span>
            <span style={{ flex: 1, textAlign: "right" }}>Balance</span>
            <span style={{ flex: 1, textAlign: "right" }}>Price</span>
            <span style={{ flex: 1, textAlign: "right" }}>Value</span>
          </div>
          {TOKENS.map((t) => (
            <div key={t.symbol} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: t.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6" }}>{t.symbol}</div>
                  <div style={{ fontSize: 11, color: "#686D7D" }}>{t.price >= 1000 ? `$${t.price.toLocaleString()}` : `$${t.price.toFixed(2)}`}</div>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>{parseFloat(balances[t.symbol]?.balance || "0").toFixed(4)}</div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono', monospace", color: "#A0A5B5" }}>${t.price.toFixed(2)}</div>
              <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono', monospace", color: "#F3F4F6" }}>${(balances[t.symbol]?.usd || 0).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ width: 400, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Status Card — Figma: 210x190 bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#F3F4F6" }}>Network Status</div>
          {[
            { label: "Chain", value: chainId === 1546 ? "Dot Mainnet" : chainId === 1545 ? "Chennai Testnet" : "Not Connected" },
            { label: "Block", value: "#5,095" },
            { label: "Gas", value: "0.000001 gwei" },
            { label: "Latency", value: "1.2s" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
              <span style={{ color: "#686D7D" }}>{s.label}</span>
              <span style={{ color: "#A0A5B5", fontFamily: "'Geist Mono', monospace" }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity — Figma: 400x702 bg[#0d0f16] r=16 */}
        <div style={{ background: "#0d0f16", borderRadius: 16, padding: 20, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#F3F4F6" }}>Recent Activity</div>
          {txHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#686D7D", fontSize: 13 }}>No recent transactions</div>
          ) : txHistory.map((tx, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: tx.status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(234,179,8,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: tx.status === "confirmed" ? "#10B981" : "#EAB308" }}>
                  {tx.status === "confirmed" ? "✓" : "⏳"}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#F3F4F6" }}>Send {tx.amount} {tx.token}</div>
                  <div style={{ fontSize: 11, color: "#686D7D" }}>To {tx.to.slice(0, 10)}...</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: tx.status === "confirmed" ? "#10B981" : "#EAB308" }}>{tx.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
