"use client";
import "./globals.css";
const NAV = [
  { label: "Explorer", href: "/", active: true },
  { label: "Hexchange", href: "http://localhost:3005" },
  { label: "Wallet", href: "http://localhost:3003" },
  { label: "Pay", href: "http://localhost:3004" },
  { label: "Developers", href: "http://localhost:3007" },
];
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body style={{ background: "#05060b", color: "#F8FAFC", margin: 0, fontFamily: "'Geist', -apple-system, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 24px", background: "#090a10", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "#385CE6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>D</div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Explorer</span>
          </a>
          <nav style={{ display: "flex" }}>{NAV.map((n) => (
            <a key={n.label} href={n.href} style={{ padding: "0 12px", height: 34, display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center", fontSize: 14, fontWeight: n.active ? 600 : 500, color: n.active ? "#F3F4F6" : "#94A3B8", textDecoration: "none", position: "relative" }}>
              {n.label}{n.active && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#385CE6", borderRadius: 1 }} />}
            </a>
          ))}</nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", height: 28, padding: "0 10px", borderRadius: 6, background: "#05060b", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#94A3B8" }}>Search blocks, txs...</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 27, padding: "0 10px", borderRadius: 6, background: "#05060b", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}></span>Mainnet
          </div>
          <button style={{ height: 28, padding: "0 14px", borderRadius: 6, background: "#385CE6", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Connect</button>
        </div>
      </header>
      {children}
      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, padding: "0 24px", background: "#090a10", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#686D7D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}></span>Dot Protocol Explorer</div>
        <div style={{ display: "flex", gap: 24, fontFamily: "'Geist Mono', monospace" }}><span>Chain ID: 1546</span><span>Consensus: QBFT</span><span>Validators: 7</span></div>
      </footer>
    </body></html>
  );
}
