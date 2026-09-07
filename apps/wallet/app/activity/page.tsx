'use client';
import { useState } from 'react';

const transactions = [
  { hash: '0xabc123...def456', type: 'Receive', token: '3DOT', amount: '+2,500.00', from: '0x542E...0185', to: '0x1234...abcd', date: '2026-09-07 14:23', status: 'Confirmed', block: 45123, gas: '21,000' },
  { hash: '0xdef789...abc123', type: 'Send', token: 'USDT', amount: '-500.00', from: '0x1234...abcd', to: '0x84ed...ced56', date: '2026-09-07 12:15', status: 'Confirmed', block: 45001, gas: '65,000' },
  { hash: '0x789abc...456def', type: 'Swap', token: '3DOT→USDC', amount: '1,000→998.50', from: 'Router', to: 'Pair', date: '2026-09-07 10:45', status: 'Confirmed', block: 44892, gas: '150,000' },
  { hash: '0x456def...789abc', type: 'Rebase', token: '3DOT', amount: '+125.00', from: 'Protocol', to: '0x1234...abcd', date: '2026-09-06 00:00', status: 'Confirmed', block: 43891, gas: '—' },
  { hash: '0x123abc...def456', type: 'Bridge', token: '3DOT', amount: '-5,000.00', from: '0x1234...abcd', to: 'BSC', date: '2026-09-05 18:30', status: 'Confirmed', block: 42551, gas: '200,000' },
  { hash: '0xdef456...789abc', type: 'Presale', token: '3DOT', amount: '-2,500 USDT', from: '0x1234...abcd', to: 'Presale', date: '2026-09-04 09:00', status: 'Confirmed', block: 41211, gas: '120,000' },
  { hash: '0xabc789...123def', type: 'Receive', token: 'ETH', amount: '+0.5', from: '0xabcd...5678', to: '0x1234...abcd', date: '2026-09-03 15:20', status: 'Confirmed', block: 39871, gas: '21,000' },
  { hash: '0x789def...456abc', type: 'Send', token: 'BNB', amount: '-10.0', from: '0x1234...abcd', to: '0xde45...Ac81', date: '2026-09-02 11:45', status: 'Confirmed', block: 38531, gas: '55,000' },
];

const typeColors: Record<string, string> = { Receive: '#00c853', Send: '#ff3d71', Swap: '#385CE6', Rebase: '#ffaa00', Bridge: '#8b5cf6', Presale: '#f472b6' };

export default function ActivityPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type.toLowerCase() === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Transaction History</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>{transactions.length} transactions across all tokens</p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['all', 'send', 'receive', 'swap', 'rebase', 'bridge'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            background: filter === f ? '#385CE6' : 'transparent',
            borderColor: filter === f ? '#385CE6' : '#1e2030',
            color: filter === f ? '#fff' : '#8b8fa3',
            textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {/* Transaction List */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['Tx Hash', 'Type', 'Token', 'Amount', 'Date', 'Status', 'Block'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555770', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e2030', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{tx.hash}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: typeColors[tx.type] + '20', color: typeColors[tx.type] }}>{tx.type}</span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{tx.token}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12, color: tx.amount.startsWith('+') ? '#00c853' : tx.amount.startsWith('-') ? '#ff3d71' : '#fff' }}>{tx.amount}</td>
                <td style={{ padding: '12px 16px', color: '#8b8fa3', fontSize: 12 }}>{tx.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853' }} />
                    <span style={{ color: '#00c853', fontSize: 12 }}>{tx.status}</span>
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#555770' }}>#{tx.block}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
