"use client";

import "./globals.css";

const TOP_NAV = [
  { label: "Explorer", href: "http://localhost:3002" },
  { label: "Hexchange", href: "/", active: true },
  { label: "Wallet", href: "http://localhost:3003" },
  { label: "Pay", href: "http://localhost:3004" },
  { label: "Developers", href: "http://localhost:3007" },
];

const EXCHANGE_NAV = [
  { label: "Swap", href: "/" },
  { label: "Trade", href: "/trade" },
  { label: "Pool", href: "/pool" },
  { label: "P2P", href: "/p2p" },
  { label: "Presale", href: "/presale" },
  { label: "Portfolio", href: "/portfolio" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg-primary)", color: "var(--text-primary)", margin: 0 }}>
        {/* ─── Top Bar (Figma: top-bar 1440x64 bg[#0d0e16] pad=24) ─── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 64, padding: "0 24px",
          background: "#0d0e16", borderBottom: "1px solid var(--border-subtle)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Left: Logo + Global Nav (Figma: logo-products 534x34) */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {/* Brand (Figma: brand 135x28) */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{
                width: 28, height: 28, background: "#385CE6", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "var(--font-body)",
              }}>D</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#F3F4F6", letterSpacing: "-0.02em" }}>Hexchange</span>
            </a>

            {/* Global Tabs (Figma: tabs 367x34) */}
            <nav style={{ display: "flex", gap: 0 }}>
              {TOP_NAV.map((item) => (
                <a key={item.label} href={item.href} style={{
                  padding: "0 12px", height: 34,
                  display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center",
                  fontSize: 14, fontWeight: item.active ? 600 : 500,
                  color: item.active ? "#F3F4F6" : "#9CA3AF",
                  textDecoration: "none", position: "relative", transition: "color 0.15s",
                }}>
                  {item.label}
                  {item.active && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#385CE6", borderRadius: 1 }} />}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Search + Network + Wallet + Avatar (Figma: global-actions 532x36) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search (Figma: 220x36 bg[#121420] r=8 p=12) */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, width: 220, height: 36,
              background: "#121420", borderRadius: 8, padding: "0 12px",
              border: "1px solid var(--border-subtle)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Search markets...</span>
            </div>

            {/* Network (Figma: 104x36 r=8 p=12) */}
            <button style={{
              display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px",
              borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle)",
              color: "#F3F4F6", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}></span>
              Mainnet
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Connect Wallet (Figma: 128x36 bg[#385CE6] r=8 p=16) */}
            <button style={{
              height: 36, padding: "0 16px", borderRadius: 8,
              background: "#385CE6", color: "#fff", fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
              transition: "background 0.15s",
            }}>Connect Wallet</button>

            {/* Avatar (Figma: avatar-container 32x32 r=16) */}
            <div style={{
              width: 32, height: 32, borderRadius: 16, overflow: "hidden",
              background: "linear-gradient(135deg, #385CE6, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}>0x</div>
          </div>
        </header>

        {/* ─── Exchange Sub-nav (optional, for inner pages) ─── */}
        <div style={{ display: "none" }}>
          {EXCHANGE_NAV.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </div>

        {/* ─── Main Content ─── */}
        {children}

        {/* ─── Bottom Strip (Figma: bottom-strip 1440x36 bg-secondary) ─── */}
        <footer style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 36, padding: "0 24px",
          background: "#0d0e16", borderTop: "1px solid var(--border-subtle)",
          fontSize: 11, color: "#686D7D",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}></span>
            System Status: Operational
          </div>
          <div style={{ display: "flex", gap: 24, fontFamily: "var(--font-mono)" }}>
            <span>Network: 1.2s avg block</span>
            <span>Gas: 0.000001 gwei</span>
            <span>Block: #5,095</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
