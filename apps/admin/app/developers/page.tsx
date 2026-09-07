'use client';
import { useState } from 'react';

const endpoints = [
  { method: 'POST', path: '/api/auth/register', desc: 'Register new user account', auth: false },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate and get JWT token', auth: false },
  { method: 'GET', path: '/api/auth/profile', desc: 'Get authenticated user profile', auth: true },
  { method: 'POST', path: '/api/orders', desc: 'Place a new order on the order book', auth: true },
  { method: 'GET', path: '/api/orders/history', desc: 'Get trade history for authenticated user', auth: true },
  { method: 'GET', path: '/api/orderbook/:pair', desc: 'Get order book for a trading pair', auth: false },
  { method: 'GET', path: '/api/trades/:pair', desc: 'Get recent trades for a pair', auth: false },
  { method: 'GET', path: '/api/ticker/:pair', desc: 'Get 24h ticker data for a pair', auth: false },
  { method: 'POST', path: '/api/wallet/deposit', desc: 'Request a deposit with tx hash', auth: true },
  { method: 'GET', path: '/api/wallet/deposits', desc: 'Get deposit history', auth: true },
  { method: 'POST', path: '/api/wallet/withdraw', desc: 'Request a withdrawal', auth: true },
  { method: 'GET', path: '/api/wallet/withdrawals', desc: 'Get withdrawal history', auth: true },
  { method: 'GET', path: '/api/wallet/balances', desc: 'Get custodial wallet balances', auth: true },
  { method: 'GET', path: '/api/admin/stats', desc: 'Get admin dashboard statistics', auth: true },
  { method: 'GET', path: '/api/admin/users', desc: 'Get all registered users', auth: true },
];

const methodColors: Record<string, string> = { GET: '#00c853', POST: '#385CE6', PUT: '#ffaa00', DELETE: '#ff3d71' };

const sdks = [
  { name: 'JavaScript / TypeScript', pkg: 'npm install @thedotprotocol/sdk', version: '1.0.0' },
  { name: 'Python', pkg: 'pip install thedotprotocol', version: '1.0.0' },
  { name: 'Go', pkg: 'go get github.com/TheDotProtocol/go-sdk', version: '1.0.0' },
  { name: 'Rust', pkg: 'cargo add thedotprotocol', version: '0.9.0' },
];

export default function DeveloperPortal() {
  const [tab, setTab] = useState<'api' | 'sdks' | 'contracts' | 'tools'>('api');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Developer Portal</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>API documentation, SDKs, and tools for building on The Dot Protocol</p>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'API Status', value: 'Operational', color: '#00c853', icon: '🟢' },
          { label: 'API Base URL', value: 'api.thedotprotocol.com', color: '#385CE6', icon: '🔗' },
          { label: 'SDK Version', value: 'v1.0.0', color: '#ffaa00', icon: '📦' },
          { label: 'WebSocket', value: 'wss://api.thedotprotocol.com', color: '#8b5cf6', icon: '🔌' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e2030' }}>
        {(['api', 'sdks', 'contracts', 'tools'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', background: 'none', border: 'none', color: tab === t ? '#fff' : '#555770',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: tab === t ? '2px solid #385CE6' : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* API Reference */}
      {tab === 'api' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2030' }}>
                {['Method', 'Endpoint', 'Description', 'Auth Required'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555770', fontSize: 11, textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2030', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: methodColors[ep.method] + '20', color: methodColors[ep.method], fontFamily: 'Geist Mono' }}>{ep.method}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'Geist Mono', fontSize: 12, color: '#fff' }}>{ep.path}</td>
                  <td style={{ padding: '10px 16px', color: '#8b8fa3' }}>{ep.desc}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: ep.auth ? '#ffaa0020' : '#00c85320', color: ep.auth ? '#ffaa00' : '#00c853' }}>{ep.auth ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SDKs */}
      {tab === 'sdks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {sdks.map(sdk => (
            <div key={sdk.name} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{sdk.name}</div>
              <div style={{ fontSize: 12, color: '#555770', marginBottom: 12 }}>Version {sdk.version}</div>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '8px 12px', borderRadius: 8, color: '#00c853' }}>{sdk.pkg}</div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Contracts */}
      {tab === 'contracts' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Smart Contract Addresses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['TDOT Token', '0x542E95FD423962505EBfb279C1361351507A0185', 'Chennai Testnet'],
              ['3DOT Token', '0x84ed5E46280c6911551925329C3af6c58e4ced56', 'Mainnet'],
              ['HexchangeFactory', 'See Explorer', 'Both Networks'],
              ['HexchangeRouter', 'See Explorer', 'Both Networks'],
              ['HexchangeEscrow', 'See Explorer', 'Both Networks'],
              ['Presale', 'See Explorer', 'Chennai Testnet'],
              ['DPC20 Bridge', 'See Explorer', 'Both Networks'],
              ['Oracle', 'See Explorer', 'Both Networks'],
              ['Governance', 'See Explorer', 'Both Networks'],
              ['Stabilization', 'See Explorer', 'Both Networks'],
            ].map(([name, addr, network]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#0d0e16', borderRadius: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#8b8fa3' }}>{addr}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, background: network === 'Mainnet' ? '#00c85320' : '#ffaa0020', color: network === 'Mainnet' ? '#00c853' : '#ffaa00' }}>{network}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      {tab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Faucet', desc: 'Get free TDOT tokens for testing on Chennai Testnet', icon: '🚰', url: 'http://localhost:3001' },
            { name: 'Block Explorer', desc: 'Browse blocks, transactions, and addresses', icon: '🔍', url: 'http://localhost:3002' },
            { name: 'ABI Repository', desc: 'Download contract ABIs for integration', icon: '📄', url: '#' },
            { name: 'Contract Verify', desc: 'Verify source code on the explorer', icon: '✅', url: '#' },
            { name: 'Network Status', desc: 'Real-time chain health and validator status', icon: '📊', url: 'http://localhost:3002/validators' },
            { name: 'DPC20 Analytics', desc: 'Token analytics, governance, and supply data', icon: '📈', url: 'http://localhost:3008' },
          ].map(tool => (
            <a key={tool.name} href={tool.url} style={{
              background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20,
              textDecoration: 'none', color: 'inherit', display: 'block',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{tool.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{tool.name}</div>
              <div style={{ color: '#8b8fa3', fontSize: 12 }}>{tool.desc}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
