'use client';
import { useState } from 'react';

const reserves = [
  { token: '3DOT', balance: '50,000,000', value: '$50,000,000', pct: 66.7 },
  { token: 'USDT', balance: '12,500,000', value: '$12,500,000', pct: 16.7 },
  { token: 'USDC', balance: '7,500,000', value: '$7,500,000', pct: 10.0 },
  { token: 'BTC', balance: '50', value: '$3,500,000', pct: 4.7 },
  { token: 'ETH', balance: '1,250', value: '$1,500,000', pct: 2.0 },
];

const events = [
  { date: '2026-09-07', type: 'Deposit', token: 'USDT', amount: '500,000', from: '0x542E...0185', txHash: '0xabc...123' },
  { date: '2026-09-06', type: 'Withdrawal', token: 'USDC', amount: '200,000', from: '0x435d...41931', txHash: '0xdef...456' },
  { date: '2026-09-05', type: 'Deposit', token: 'BTC', amount: '5', from: '0xde45...Ac81', txHash: '0x789...abc' },
  { date: '2026-09-04', type: 'Rebalance', token: 'Multi', amount: '—', from: 'Governance', txHash: '0x123...def' },
  { date: '2026-09-03', type: 'Deposit', token: 'ETH', amount: '250', from: '0xd28f...37a4', txHash: '0x456...789' },
];

const typeColors: Record<string, string> = { Deposit: '#00c853', Withdrawal: '#ff3d71', Rebalance: '#ffaa00' };

export default function Reserve() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Reserve Management</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>Multi-asset reserve backing for 3DOT stabilization — real-time composition and movement tracking</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>Total Reserve Value</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#385CE6', marginTop: 4 }}>$75,000,000</div>
          <div style={{ fontSize: 12, color: '#00c853', marginTop: 4 }}>Backed 1:1 with stablecoins + crypto</div>
        </div>
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>Reserve Ratio</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#00c853', marginTop: 4 }}>100%</div>
          <div style={{ fontSize: 12, color: '#8b8fa3', marginTop: 4 }}>Fully collateralized</div>
        </div>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Reserve Composition</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['Token', 'Balance', 'USD Value', 'Allocation'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reserves.map(r => (
              <tr key={r.token} style={{ borderBottom: '1px solid #1e2030' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.token}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.balance}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{r.value}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 100, height: 6, background: '#0d0e16', borderRadius: 3 }}>
                      <div style={{ width: `${r.pct}%`, height: 6, background: '#385CE6', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#8b8fa3' }}>{r.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Recent Reserve Activity</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['Date', 'Type', 'Token', 'Amount', 'From', 'Tx Hash'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e2030' }}>
                <td style={{ padding: '10px 12px', color: '#8b8fa3' }}>{e.date}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: typeColors[e.type] + '20', color: typeColors[e.type] }}>{e.type}</span>
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{e.token}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{e.amount}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12, color: '#8b8fa3' }}>{e.from}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 11, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{e.txHash}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
