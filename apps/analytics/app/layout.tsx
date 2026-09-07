import './globals.css';
import Link from 'next/link';

const nav = [
  { href: '/', label: 'DPC20 Intelligence' },
  { href: '/governance', label: 'Governance' },
  { href: '/reserve', label: 'Reserve' },
  { href: '/mint-burn', label: 'Mint/Burn' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>DPC20 Analytics — The Dot Protocol</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#080910', color: '#fff' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, background: '#0d0e16', borderBottom: '1px solid #1e2030' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#385CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>D</div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>DPC20 Analytics</span>
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            {nav.map(n => (
              <Link key={n.href} href={n.href} style={{ padding: '6px 12px', borderRadius: 8, color: '#8b8fa3', fontSize: 13, textDecoration: 'none', transition: 'all 0.2s' }}>{n.label}</Link>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="http://localhost:3005" style={{ color: '#8b8fa3', fontSize: 12, textDecoration: 'none' }}>Hexchange</a>
            <a href="http://localhost:3002" style={{ color: '#8b8fa3', fontSize: 12, textDecoration: 'none' }}>Explorer</a>
          </div>
        </header>
        {/* Status Strip */}
        <div style={{ display: 'flex', gap: 16, padding: '4px 24px', background: '#0a0b12', borderBottom: '1px solid #1e2030', fontSize: 11, color: '#555770' }}>
          <span>● System Status: <span style={{ color: '#00c853' }}>Operational</span></span>
          <span>Chain ID: <span style={{ color: '#8b8fa3' }}>1545</span></span>
          <span>Network: <span style={{ color: '#8b8fa3' }}>Chennai Testnet</span></span>
        </div>
        <main style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  );
}
