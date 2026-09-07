import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexchange — The Dot Protocol Exchange",
  description: "The world's first true hybrid crypto exchange — seamlessly switch between CEX and DEX",
};

const NAV_ITEMS = [
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
      <body style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        {/* ─── Top Bar (Figma: top-bar 1440x64 bg-secondary) ─── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          padding: "0 var(--space-2xl)",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          {/* Left: Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 28, height: 28,
                background: "var(--accent-orange)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "white",
              }}>H</div>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Hexchange
              </span>
            </a>

            {/* Nav */}
            <nav style={{ display: "flex", gap: 4 }}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-tertiary)",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Mode Toggle + Wallet */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mode Toggle (Figma: mode-toggle 221x34 bg-quaternary) */}
            <div style={{
              display: "flex",
              background: "var(--bg-quaternary)",
              borderRadius: "var(--radius-md)",
              padding: 3,
              gap: 2,
            }}>
              <a href="/trade" style={{
                padding: "5px 20px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "all 0.15s",
              }}>CEX</a>
              <a href="/" style={{
                padding: "5px 20px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: "var(--bg-secondary)",
                color: "var(--accent-orange)",
                textDecoration: "none",
                border: "1px solid rgba(249, 115, 22, 0.2)",
              }}>DEX</a>
            </div>

            {/* Network Selector (Figma: net-dropdown 101x28 bg-primary) */}
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }}></span>
              Dot Mainnet
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Connect Wallet (Figma: connect-wallet 128x36 bg-blue) */}
            <button
              id="connect-wallet"
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-blue)",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-blue-hover)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent-blue)")}
            >
              Connect Wallet
            </button>

            {/* Avatar (Figma: avatar 32x32 radius-full) */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-orange), var(--accent-blue))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}>0x</div>
          </div>
        </header>

        {/* ─── Bottom Status Strip (Figma: bottom-strip 1440x36) ─── */}
        {children}

        <footer style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 36,
          padding: "0 var(--space-2xl)",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }}></span>
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
