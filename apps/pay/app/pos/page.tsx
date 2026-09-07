'use client';
import { useState } from 'react';

const recentTransactions = [
  { time: '14:23', amount: '250.00', token: 'USDT', customer: '0x542E...0185', status: 'Success' },
  { time: '14:18', amount: '1,200.00', token: '3DOT', customer: '0x435d...41931', status: 'Success' },
  { time: '14:12', amount: '75.50', token: 'USDC', customer: '0xde45...Ac81', status: 'Success' },
  { time: '14:05', amount: '500.00', token: 'USDT', customer: '0xd28f...37a4', status: 'Pending' },
  { time: '13:58', amount: '3,000.00', token: '3DOT', customer: '0x84ed...ced56', status: 'Success' },
];

export default function POS() {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDT');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>POS Terminal</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, marginTop: 4 }}>Point-of-Sale payment terminal for in-person transactions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Payment Terminal */}
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 20px' }}>New Payment</h3>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#555770', marginBottom: 6 }}>Amount</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1, padding: '14px 16px', borderRadius: 10, border: '1px solid #1e2030', background: '#0d0e16',
                  color: '#fff', fontSize: 24, fontWeight: 600, outline: 'none', fontFamily: 'Geist Mono',
                }}
              />
              <select value={token} onChange={e => setToken(e.target.value)} style={{
                padding: '14px 12px', borderRadius: 10, border: '1px solid #1e2030', background: '#0d0e16',
                color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', outline: 'none',
              }}>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="3DOT">3DOT</option>
                <option value="BTC">BTC</option>
                <option value="BNB">BNB</option>
              </select>
            </div>
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {['10', '25', '50', '100', '250', '500', '1000', '2500'].map(a => (
              <button key={a} onClick={() => setAmount(a)} style={{
                padding: '8px 0', borderRadius: 8, border: '1px solid #1e2030', background: amount === a ? '#385CE6' : '#0d0e16',
                color: amount === a ? '#fff' : '#8b8fa3', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>${a}</button>
            ))}
          </div>

          {/* Payment methods */}
          <div style={{ fontSize: 12, color: '#555770', marginBottom: 8 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['QR Code', 'NFC Tap', 'Manual Entry'].map((method, i) => (
              <button key={method} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: i === 0 ? '#385CE6' : 'transparent',
                borderColor: i === 0 ? '#385CE6' : '#1e2030',
                color: i === 0 ? '#fff' : '#8b8fa3',
              }}>{method}</button>
            ))}
          </div>

          <button style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: '#385CE6', color: '#fff',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>Generate Payment Request</button>
        </div>

        {/* Recent Transactions */}
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0d0e16', borderRadius: 10 }}>
                <div>
                  <div style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 500 }}>{tx.amount} <span style={{ color: '#8b8fa3', fontSize: 12 }}>{tx.token}</span></div>
                  <div style={{ fontSize: 11, color: '#555770', marginTop: 2 }}>{tx.customer} · {tx.time}</div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                  background: tx.status === 'Success' ? '#00c85320' : '#ffaa0020',
                  color: tx.status === 'Success' ? '#00c853' : '#ffaa00',
                }}>{tx.status}</span>
              </div>
            ))}
          </div>

          {/* Today's Summary */}
          <div style={{ marginTop: 16, padding: 16, background: '#0d0e16', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>Today&apos;s Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              {[
                ['Transactions', '47', '#385CE6'],
                ['Total Volume', '$12,847', '#00c853'],
                ['Avg Transaction', '$273.34', '#ffaa00'],
                ['Success Rate', '99.1%', '#00c853'],
              ].map(([label, value, color]) => (
                <div key={label as string}>
                  <div style={{ fontSize: 11, color: '#555770' }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: color as string, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
