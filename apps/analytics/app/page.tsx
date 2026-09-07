'use client';
import { useState, useEffect } from 'react';

const stats = [
  { label: 'Total Supply', value: '1,000,000,000', sub: '3DOT', color: '#385CE6' },
  { label: 'Circulating Supply', value: '750,000,000', sub: '3DOT', color: '#00c853' },
  { label: 'Market Cap', value: '$750,000,000', sub: 'est.', color: '#ffaa00' },
  { label: 'Rebase Rate', value: '+0.05%/day', sub: 'compound', color: '#385CE6' },
  { label: 'Holders', value: '12,847', sub: 'addresses', color: '#00c853' },
  { label: 'Avg Tx/Day', value: '3,241', sub: 'transactions', color: '#8b8fa3' },
];

const rebases = [
  { date: '2026-09-07', block: 45231, supplyBefore: '749,625,000', supplyAfter: '749,999,812', delta: '+374,812', rate: '0.05%' },
  { date: '2026-09-06', block: 43891, supplyBefore: '749,250,562', supplyAfter: '749,625,000', delta: '+374,438', rate: '0.05%' },
  { date: '2026-09-05', block: 42551, supplyBefore: '748,876,681', supplyAfter: '749,250,562', delta: '+373,881', rate: '0.05%' },
  { date: '2026-09-04', block: 41211, supplyBefore: '748,503,269', supplyAfter: '748,876,681', delta: '+373,412', rate: '0.05%' },
  { date: '2026-09-03', block: 39871, supplyBefore: '748,130,316', supplyAfter: '748,503,269', delta: '+372,953', rate: '0.05%' },
  { date: '2026-09-02', block: 38531, supplyBefore: '747,757,822', supplyAfter: '748,130,316', delta: '+372,494', rate: '0.05%' },
  { date: '2026-09-01', block: 37191, supplyBefore: '747,385,787', supplyAfter: '747,757,822', delta: '+372,035', rate: '0.05%' },
];

const topHolders = [
  { rank: 1, address: '0x542E...0185', label: 'TDOT Token Contract', balance: '100,000,000', pct: '10.00%' },
  { rank: 2, address: '0x84ed...ced56', label: '3DOT Mainnet Token', balance: '85,000,000', pct: '8.50%' },
  { rank: 3, address: '0x435d...41931', label: 'Treasury Multisig', balance: '72,500,000', pct: '7.25%' },
  { rank: 4, address: '0xde45...Ac81', label: 'Presale Contract', balance: '50,000,000', pct: '5.00%' },
  { rank: 5, address: '0xd28f...37a4', label: 'Bridge Contract', balance: '25,000,000', pct: '2.50%' },
  { rank: 6, address: '0x1234...abcd', label: 'Ecosystem Fund', balance: '20,000,000', pct: '2.00%' },
  { rank: 7, address: '0xabcd...5678', label: 'Team Vesting', balance: '15,000,000', pct: '1.50%' },
];

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20, ...style }}>{children}</div>;
}

export default function DPC20Intelligence() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rebases' | 'holders' | 'transfers'>('overview');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>DPC20 Intelligence</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>Real-time analytics for 3DOT (DPC20) token — rebase tracking, holder distribution, and transfer analytics</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#555770', marginTop: 2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e2030', paddingBottom: 0 }}>
        {(['overview', 'rebases', 'holders', 'transfers'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 16px', background: 'none', border: 'none', color: activeTab === tab ? '#fff' : '#555770',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #385CE6' : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{tab}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Token Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Name', 'The Dot Protocol Token'],
                ['Symbol', '3DOT'],
                ['Standard', 'DPC20 (ERC-20 + Rebase + Snapshots)'],
                ['Decimals', '18'],
                ['Chain', 'The Dot Protocol (ID: 1545/1546)'],
                ['Rebase Frequency', 'Every ~1440 blocks (~1 day)'],
                ['Rebase Rate', '0.05% per epoch (compound)'],
                ['Max Supply Cap', '10% annual inflation'],
                ['Governance', 'On-chain (DPC20Governance.sol)'],
                ['Bridge', 'DPC20Bridge.sol (ERC-20/BEP-20/TRC-20)'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#8b8fa3' }}>{k}</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Supply Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Token Contract', 10, '#385CE6'],
                ['Treasury', 7.25, '#385CE6'],
                ['Presale', 5, '#00c853'],
                ['Bridge', 2.5, '#ffaa00'],
                ['Ecosystem', 2, '#ff3d71'],
                ['Team', 1.5, '#8b8fa3'],
                ['Circulating', 71.75, '#2a2d3e'],
              ].map(([label, pct, color]) => (
                <div key={label as string}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#8b8fa3' }}>{label}</span>
                    <span style={{ color: '#fff' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#0d0e16', borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${Math.min(pct as number * 2, 100)}%`, background: color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Rebase History Tab */}
      {activeTab === 'rebases' && (
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Rebase History (Last 7 Epochs)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2030' }}>
                {['Date', 'Block', 'Supply Before', 'Supply After', 'Delta', 'Rate'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rebases.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2030' }}>
                  <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{r.date}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>#{r.block}</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.supplyBefore}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.supplyAfter}</td>
                  <td style={{ padding: '10px 12px', color: '#00c853', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.delta}</td>
                  <td style={{ padding: '10px 12px', color: '#385CE6' }}>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Holders Tab */}
      {activeTab === 'holders' && (
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Top Holders</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2030' }}>
                {['Rank', 'Address', 'Label', 'Balance', '% Supply'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topHolders.map(h => (
                <tr key={h.rank} style={{ borderBottom: '1px solid #1e2030' }}>
                  <td style={{ padding: '10px 12px', color: '#555770' }}>#{h.rank}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{h.address}</span></td>
                  <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{h.label}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{h.balance}</td>
                  <td style={{ padding: '10px 12px', color: '#385CE6', fontWeight: 600 }}>{h.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Transfer Volume (24h)</h3>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#385CE6' }}>12,481,320</div>
              <div style={{ color: '#555770', fontSize: 13, marginTop: 4 }}>3DOT transferred in 24h</div>
              <div style={{ color: '#00c853', fontSize: 13, marginTop: 8 }}>↑ 12.4% from yesterday</div>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Unique Senders (24h)</h3>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#00c853' }}>1,847</div>
              <div style={{ color: '#555770', fontSize: 13, marginTop: 4 }}>unique addresses sent</div>
              <div style={{ color: '#00c853', fontSize: 13, marginTop: 8 }}>↑ 8.2% from yesterday</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
