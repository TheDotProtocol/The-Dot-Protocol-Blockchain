"use client";

import "./globals.css";

const NAV_ITEMS = [
  { label: "Explorer", href: "http://localhost:3002" },
  { label: "Hexchange", href: "http://localhost:3005" },
  { label: "Wallet", href: "/", active: true },
  { label: "Pay", href: "http://localhost:3004" },
  { label: "Developers", href: "http://localhost:3007" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#080910", color: "#F3F4F6", margin: 0, fontFamily: "'Geist', -apple-system, sans-serif" }}>
        {/* Topbar — Figma: 1440x64 bg[#0d0f16] */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 24px", background: "#0d0f16", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, background: "#385CE6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>D</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#F3F4F6" }}>3Dot Wallet</span>
            </a>
            <nav style={{ display: "flex" }}>
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} style={{ padding: "0 12px", height: 34, display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center", fontSize: 14, fontWeight: item.active ? 600 : 500, color: item.active ? "#F3F4F6" : "#9CA3AF", textDecoration: "none", position: "relative" }}>
                  {item.label}
                  {item.active && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#385CE6", borderRadius: 1 }} />}
                </a>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#F3F4F6", fontSize: 13, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}></span>
              Mainnet
            </div>
            <button style={{ height: 36, padding: "0 16px", borderRadius: 8, background: "#385CE6", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Connect Wallet</button>
          </div>
        </header>
        {children}
        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, padding: "0 24px", background: "#0d0f16", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#686D7D" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}></span>System Status: Operational</div>
          <div style={{ display: "flex", gap: 24, fontFamily: "'Geist Mono', monospace" }}><span>Network: 1.2s avg block</span><span>Gas: 0.000001 gwei</span></div>
        </footer>
      </body>
    </html>
  );
}
