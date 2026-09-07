'use client';
import { useState } from 'react';

const mintBurnHistory = [
  { date: '2026-09-07', block: 45231, type: 'Mint', amount: '374,812', reason: 'Daily Rebase', by: 'Protocol', txHash: '0xabc...123' },
  { date: '2026-09-06', block: 43891, type: 'Mint', amount: '374,438', reason: 'Daily Rebase', by: 'Protocol', txHash: '0xdef...456' },
  { date: '2026-09-05', block: 42551, type: 'Mint', amount: '373,881', reason: 'Daily Rebase', by: 'Protocol', txHash: '0x789...abc' },
  { date: '2026-09-04', block: 41211, type: 'Burn', amount: '50,000', reason: 'Bridge Outflow', by: 'Bridge Contract', txHash: '0x123...def' },
  { date: '2026-09-03', block: 39871, type: 'Mint', amount: '372,953', reason: 'Daily Rebase', by: 'Protocol', txHash: '0x456...789' },
  { date: '2026-09-02', block: 38531, type: 'Mint', amount: '25,000,000', reason: 'Presale Phase 2', by: 'Presale Contract', txHash: '0xabc...def' },
  { date: '2026-09-01', block: 37191, type: 'Burn', amount: '5,000,000', reason: 'Governance Vote #5', by: 'Governance', txHash: '0x789...123' },
  { date: '2026-08-30', block: 35151, type: 'Mint', amount: '100,000,000', reason: 'Initial Token Mint', by: 'Deployer', txHash: '0x456...abc' },
];

const typeColors: Record<string, string> = { Mint: '#00c853', Burn: '#ff3d71' };

export default function MintBurn() {
  const [tab, setTab] = useState<'history' | 'schedule' | 'analytics'>('history');
  
  const totalMinted = mintBurnHistory.filter(e => e.type === 'Mint').reduce((acc, e) => {
    const num = parseInt(e.amount.replace(/,/g, ''));
    return acc + num;
  }, 0);
  
  const totalBurned = mintBurnHistory.filter(e => e.type === 'Burn').reduce((acc, e) => {
    const num = parseInt(e.amount.replace(/,/g, ''));
    return acc + num;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Mint & Burn Analytics</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>Track 3DOT token creation, destruction, and supply changes across all mechanisms</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Minted', value: '125,748,246', sub: '3DOT', color: '#00c853' },
          { label: 'Total Burned', amount: '5,050,000', value: '5,050,000', sub: '3DOT', color: '#ff3d71' },
          { label: 'Net Supply Change', value: '+120,698,246', sub: 'from genesis', color: '#385CE6' },
          { label: 'Burn Rate', value: '4.0%', sub: 'of total minted', color: '#ffaa00' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#555770', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e2030' }}>
        {(['history', 'schedule', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', background: 'none', border: 'none', color: tab === t ? '#fff' : '#555770',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: tab === t ? '2px solid #385CE6' : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === 'history' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Mint/Burn History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2030' }}>
                {['Date', 'Block', 'Type', 'Amount', 'Reason', 'Initiated By', 'Tx Hash'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mintBurnHistory.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2030' }}>
                  <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{e.date}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>#{e.block}</span></td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: typeColors[e.type] + '20', color: typeColors[e.type] }}>{e.type}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12, color: typeColors[e.type] }}>{e.amount}</td>
                  <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{e.reason}</td>
                  <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{e.by}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 11, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{e.txHash}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'schedule' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Upcoming Rebase Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { next: '2026-09-08', block: 46571, est: '+375,000 3DOT', rate: '0.05%' },
              { next: '2026-09-09', block: 47911, est: '+375,187 3DOT', rate: '0.05%' },
              { next: '2026-09-10', block: 49251, est: '+375,375 3DOT', rate: '0.05%' },
              { next: '2026-09-11', block: 50591, est: '+375,562 3DOT', rate: '0.05%' },
              { next: '2026-09-12', block: 51931, est: '+375,750 3DOT', rate: '0.05%' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0d0e16', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#385CE6' }} />
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{r.next}</span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#555770' }}>Block #{r.block}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: '#00c853', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.est}</span>
                  <span style={{ color: '#385CE6', fontSize: 12 }}>{r.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Mint by Source</h3>
            {[
              ['Daily Rebase', 75, '#385CE6'],
              ['Presale', 20, '#00c853'],
              ['Bridge Inflow', 3, '#ffaa00'],
              ['Other', 2, '#8b8fa3'],
            ].map(([label, pct, color]) => (
              <div key={label as string} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#8b8fa3' }}>{label}</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#0d0e16', borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Burn by Destination</h3>
            {[
              ['Bridge Outflow', 60, '#ff3d71'],
              ['Governance Vote', 30, '#ffaa00'],
              ['Fee Burning', 7, '#385CE6'],
              ['Other', 3, '#8b8fa3'],
            ].map(([label, pct, color]) => (
              <div key={label as string} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#8b8fa3' }}>{label}</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#0d0e16', borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
