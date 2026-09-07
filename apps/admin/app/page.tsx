"use client";
import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";
const TOKEN_KEY = "hexchange_admin_token";
const SIDEBAR = [
  { icon: "📊", label: "Overview" },
  { icon: "👥", label: "Users" },
  { icon: "📈", label: "Trades" },
  { icon: "💧", label: "Liquidity" },
  { icon: "🔒", label: "Security" },
  { icon: "📜", label: "Contracts" },
  { icon: "⚙️", label: "Settings" },
];
export default function AdminPage() {
  const [tab, setTab] = useState("Overview");
  const [token, setToken] = useState("");
  const [loginEmail, setLoginEmail] = useState("admin@thedotprotocol.com");
  const [loginPass, setLoginPass] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const fetchDashboard = async (t?: string) => {
    const authToken = t || token;
    if (!authToken) return;
    const h = { Authorization: `Bearer ${authToken}` };
    try {
      const [s, u, tr] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: h }).then(r => r.ok ? r.json() : null),
        fetch(`${API}/api/admin/users`, { headers: h }).then(r => r.ok ? r.json() : null),
        fetch(`${API}/api/admin/trades`, { headers: h }).then(r => r.ok ? r.json() : null),
      ]);
      if (s) setStats(s);
      if (u) setUsers(u.users);
      if (tr) setTrades(tr.trades);
    } catch {}
  };
  useEffect(() => { const saved = localStorage.getItem(TOKEN_KEY); if (saved) { setToken(saved); fetchDashboard(saved); } }, []);
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPass }) });
      if (res.ok) { const d = await res.json(); setToken(d.token); localStorage.setItem(TOKEN_KEY, d.token); fetchDashboard(d.token); }
    } catch {}
  };
  if (!token) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ width: 380, background: "#0d0e16", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Admin Portal</h2>
          <p style={{ fontSize: 12, color: "#686D7D", marginTop: 4 }}>The Dot Protocol — Operations Center</p>
        </div>
        <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: "10px 14px", background: "#080910", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F3F4F6", fontSize: 13, marginBottom: 12 }} />
        <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" style={{ width: "100%", padding: "10px 14px", background: "#080910", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F3F4F6", fontSize: 13, marginBottom: 16 }} />
        <button onClick={handleLogin} style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "#385CE6", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Login</button>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 100px)" }}>
      {/* Sidebar — Figma: left-sidebar 240x1024 bg[#12141f] */}
      <div style={{ width: 240, background: "#12141f", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: "#686D7D", marginTop: 2 }}>Dot Protocol</div>
        </div>
        {SIDEBAR.map((s) => (
          <button key={s.label} onClick={() => setTab(s.label)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === s.label ? 600 : 400, color: tab === s.label ? "#F3F4F6" : "#9CA3AF", background: tab === s.label ? "rgba(56,92,230,0.1)" : "transparent", textAlign: "left", fontFamily: "'Geist', sans-serif" }}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{tab}</h1>
        {tab === "Overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Users", value: stats?.users?.total ?? "—", icon: "👥", color: "#385CE6" },
                { label: "Orders", value: stats?.orders?.total ?? "—", icon: "📋", color: "#8B5CF6" },
                { label: "Trades", value: stats?.trades?.total ?? "—", icon: "📈", color: "#10B981" },
                { label: "Volume", value: `$${(stats?.trades?.volume ?? 0).toLocaleString()}`, icon: "💰", color: "#F97316" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#0d0e16", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: "#686D7D" }}>{s.label}</span><span>{s.icon}</span></div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Chain Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { name: "Chennai Testnet", blocks: "5,095", chain: "1545", status: "Operational" },
                { name: "Dot Mainnet", blocks: "4,218", chain: "1546", status: "Operational" },
              ].map((c) => (
                <div key={c.name} style={{ background: "#0d0e16", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}></span><span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><div style={{ fontSize: 11, color: "#686D7D" }}>Blocks</div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Geist Mono'" }}>{c.blocks}</div></div>
                    <div><div style={{ fontSize: 11, color: "#686D7D" }}>Chain ID</div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Geist Mono'" }}>{c.chain}</div></div>
                    <div><div style={{ fontSize: 11, color: "#686D7D" }}>Validators</div><div style={{ fontSize: 15, fontWeight: 600 }}>7/7</div></div>
                    <div><div style={{ fontSize: 11, color: "#686D7D" }}>Status</div><div style={{ fontSize: 15, fontWeight: 600, color: "#10B981" }}>{c.status}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "Users" && (
          <div style={{ background: "#0d0e16", borderRadius: 12, padding: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ padding: "10px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Email</th>
                <th style={{ padding: "10px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Wallet</th>
                <th style={{ padding: "10px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>KYC</th>
                <th style={{ padding: "10px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Joined</th>
              </tr></thead>
              <tbody>{users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 0", fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: "10px 0", fontSize: 12, fontFamily: "'Geist Mono'", color: "#A0A5B5" }}>{u.wallet_address?.slice(0, 10)}...</td>
                  <td style={{ padding: "10px 0" }}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: u.kyc_status === "approved" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: u.kyc_status === "approved" ? "#10B981" : "#686D7D" }}>{u.kyc_status}</span></td>
                  <td style={{ padding: "10px 0", fontSize: 12, color: "#A0A5B5" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {tab === "Trades" && (
          <div style={{ background: "#0d0e16", borderRadius: 12, padding: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ padding: "10px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Pair</th>
                <th style={{ padding: "10px 0", textAlign: "right", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Price</th>
                <th style={{ padding: "10px 0", textAlign: "right", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Amount</th>
                <th style={{ padding: "10px 0", textAlign: "right", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Total</th>
                <th style={{ padding: "10px 0", textAlign: "right", fontSize: 11, fontWeight: 600, color: "#686D7D" }}>Date</th>
              </tr></thead>
              <tbody>{trades.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{t.pair}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono'" }}>${t.price}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono'" }}>{t.amount}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontFamily: "'Geist Mono'", color: "#F97316" }}>${(t.price * t.amount).toFixed(2)}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontSize: 12, color: "#A0A5B5" }}>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {tab === "Security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { item: "TimelockController on all contracts", status: true },
              { item: "Rebase capped at ±5% per 30 days", status: true },
              { item: "No hardcoded private keys", status: true },
              { item: "JWT uses jsonwebtoken library", status: true },
              { item: "CORS restricted to known origins", status: true },
              { item: "Rate limiting on all endpoints", status: true },
              { item: "WebSocket authentication", status: true },
              { item: "CSP headers on API", status: true },
              { item: "Multi-sig admin (GnosisSafeL2)", status: false },
              { item: "CCIP Bridge integration", status: false },
              { item: "Professional audit", status: false },
            ].map((s) => (
              <div key={s.item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#0d0e16", borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>{s.status ? "✅" : "❌"}</span>
                <span style={{ fontSize: 13, color: s.status ? "#F3F4F6" : "#686D7D" }}>{s.item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
