'use client';
import { useParams } from 'next/navigation';

const tokens = [
  { symbol: '3DOT', name: 'The Dot Protocol Token', balance: '12,500.00', value: '$12,500.00' },
  { symbol: 'USDT', name: 'Tether USD', balance: '5,000.00', value: '$5,000.00' },
  { symbol: 'USDC', name: 'USD Coin', balance: '2,500.00', value: '$2,500.00' },
];

const transactions = [
  { hash: '0xabc...123', from: '0x542E...0185', to: '0x1234...abcd', value: '2,500 3DOT', date: '2026-09-07 14:23', status: 'Success' },
  { hash: '0xdef...456', from: '0x1234...abcd', to: '0x84ed...ced56', value: '500 USDT', date: '2026-09-07 12:15', status: 'Success' },
  { hash: '0x789...abc', from: '0xabcd...5678', to: '0x1234...abcd', value: '1,000 USDC', date: '2026-09-06 09:30', status: 'Success' },
  { hash: '0x123...def', from: '0x1234...abcd', to: '0xde45...Ac81', value: '100 3DOT', date: '2026-09-05 18:45', status: 'Success' },
];

export default function AddressDetail() {
  const params = useParams();
  const address = params?.hash || '0x1234abcd56789012345678901234567890abcd';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Address Details</h1>
        <p style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4, fontFamily: 'Geist Mono' }}>{address}</p>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Balance', value: '20,000.00 3DOT', sub: '$20,000.00', color: '#385CE6' },
          { label: 'Total Transactions', value: '47', sub: 'outgoing + incoming', color: '#00c853' },
          { label: 'First / Last Tx', value: '2026-08-20 / 2026-09-07', sub: '18 days active', color: '#8b8fa3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#555770', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Token Balances */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Token Balances</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555770', fontSize: 11, textTransform: 'uppercase' }}>Token</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555770', fontSize: 11, textTransform: 'uppercase' }}>Balance</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555770', fontSize: 11, textTransform: 'uppercase' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.symbol} style={{ borderBottom: '1px solid #1e2030' }}>
                <td style={{ padding: '10px 12px' }}><span style={{ fontWeight: 600 }}>{t.symbol}</span> <span style={{ color: '#555770', fontSize: 12 }}>{t.name}</span></td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{t.balance}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{t.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transactions */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Transactions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['Tx Hash', 'From', 'To', 'Value', 'Date', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#555770', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e2030' }}>
                <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#385CE6' }}>{tx.hash}</span></td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{tx.from}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{tx.to}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{tx.value}</td>
                <td style={{ padding: '10px 12px', color: '#8b8fa3', fontSize: 12 }}>{tx.date}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ color: '#00c853', fontSize: 12 }}>✓ {tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
