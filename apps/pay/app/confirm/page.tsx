'use client';
import { useState } from 'react';

export default function ConfirmPayment() {
  const [confirmed, setConfirmed] = useState(false);
  
  const payment = {
    merchant: 'The Dot Protocol Store',
    amount: '250.00',
    currency: 'USDT',
    network: 'The Dot Protocol',
    orderId: 'ORD-2026-0907-001',
    networkFee: '0.001 USDT',
    total: '250.001 USDT',
    expires: '14:32',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 40, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#385CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💳</div>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Confirm Payment</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, marginTop: 4 }}>Review and confirm your transaction</p>
      </div>

      <div style={{ width: '100%', background: '#181a24', border: '1px solid #1e2030', borderRadius: 16, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>Amount</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#385CE6', marginTop: 4 }}>{payment.amount}</div>
          <div style={{ fontSize: 14, color: '#8b8fa3' }}>{payment.currency}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #1e2030', paddingTop: 16 }}>
          {[
            ['Merchant', payment.merchant],
            ['Order ID', payment.orderId],
            ['Network', payment.network],
            ['Network Fee', payment.networkFee],
            ['Expires', payment.expires],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#555770' }}>{k}</span>
              <span style={{ fontFamily: k === 'Order ID' ? 'Geist Mono' : 'inherit', fontSize: k === 'Order ID' ? 11 : 13 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {!confirmed ? (
        <button onClick={() => setConfirmed(true)} style={{
          width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: '#385CE6', color: '#fff',
          fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
        }}>Pay {payment.total}</button>
      ) : (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#00c853' }}>Payment Sent!</div>
          <div style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4 }}>Transaction submitted to the network</div>
          <div style={{ marginTop: 16, padding: '10px 16px', background: '#0d0e16', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#555770' }}>Tx Hash</div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#385CE6', marginTop: 2, wordBreak: 'break-all' }}>0xabc123def456789012345678901234567890abcdef</div>
          </div>
        </div>
      )}
    </div>
  );
}
