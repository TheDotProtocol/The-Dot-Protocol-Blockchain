'use client';

const contracts = [
  { address: '0x542E...0185', name: 'TDOT Token (DPC20)', type: 'Token', verified: true, compiler: '0.8.20', balance: '—', txCount: 342 },
  { address: '0x435d...41931', name: 'Decentralized Oracle', type: 'Oracle', verified: true, compiler: '0.8.20', balance: '0 ETH', txCount: 891 },
  { address: '0x436A...8667', name: 'Stabilization Engine', type: 'DeFi', verified: true, compiler: '0.8.20', balance: '500,000 USDT', txCount: 156 },
  { address: '0xde45...c126', name: 'Governance', type: 'Governance', verified: true, compiler: '0.8.20', balance: '0 ETH', txCount: 45 },
  { address: '0xd28f...37a4', name: 'DPC20 Bridge', type: 'Bridge', verified: true, compiler: '0.8.20', balance: '25,000,000 3DOT', txCount: 234 },
  { address: '0x84ed...ed56', name: '3DOT Token Mainnet', type: 'Token', verified: true, compiler: '0.8.20', balance: '—', txCount: 189 },
  { address: '0xAE7D...8eeb', name: 'Mainnet Oracle', type: 'Oracle', verified: true, compiler: '0.8.20', balance: '0 ETH', txCount: 423 },
  { address: '0x2000...a552', name: 'Mainnet Stabilization', type: 'DeFi', verified: true, compiler: '0.8.20', balance: '—', txCount: 78 },
  { address: '0x002B...c81', name: 'Mainnet Governance', type: 'Governance', verified: true, compiler: '0.8.20', balance: '0 ETH', txCount: 23 },
  { address: '0xe908...13', name: 'Mainnet Bridge', type: 'Bridge', verified: true, compiler: '0.8.20', balance: '—', txCount: 112 },
];

const typeColors: Record<string, string> = { Token: '#385CE6', Oracle: '#ffaa00', DeFi: '#00c853', Governance: '#8b5cf6', Bridge: '#f472b6' };

export default function Contracts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Smart Contracts</h1>
        <p style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4 }}>Verified contracts deployed on The Dot Protocol</p>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['Address', 'Contract Name', 'Type', 'Verified', 'Compiler', 'Balance', 'Transactions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555770', fontSize: 11, textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e2030', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{c.address}</span></td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, background: typeColors[c.type] + '20', color: typeColors[c.type] }}>{c.type}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ color: '#00c853', fontSize: 12 }}>✓ Verified</span></td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12, color: '#8b8fa3' }}>v{c.compiler}</td>
                <td style={{ padding: '12px 16px', fontSize: 12 }}>{c.balance}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12 }}>{c.txCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
