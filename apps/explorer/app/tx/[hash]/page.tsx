'use client';
import { useParams } from 'next/navigation';

export default function TxDetail() {
  const params = useParams();
  const hash = params?.hash || '0xabc123...def456';
  
  const tx = {
    hash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef1234567890',
    block: 45231,
    timestamp: '2026-09-07 14:23:45 UTC',
    from: '0x542E95FD423962505EBfb279C1361351507A0185',
    to: '0x84ed5E46280c6911551925329C3af6c58e4ced56',
    value: '0 3DOT',
    gasPrice: '1.0 Gwei',
    gasUsed: '21,000',
    gasLimit: '50,000',
    nonce: 142,
    status: 'Success',
    method: 'transfer',
    input: '0xa9059cbb00000000000000000000000084ed5e46280c6911551925329c3af6c58e4ced56',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Transaction Details</h1>
        <p style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4 }}>Full details for this transaction on The Dot Protocol</p>
      </div>
      
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Tx Hash', <span key="h" style={{ fontFamily: 'Geist Mono', fontSize: 12, background: '#0d0e16', padding: '2px 6px', borderRadius: 4, wordBreak: 'break-all' }}>{tx.hash}</span>],
            ['Status', <span key="s" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#00c85320', color: '#00c853' }}>✓ {tx.status}</span>],
            ['Block', <span key="b" style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#385CE6' }}>#{tx.block}</span>],
            ['Timestamp', tx.timestamp],
            ['From', <span key="f" style={{ fontFamily: 'Geist Mono', fontSize: 12, wordBreak: 'break-all' }}>{tx.from}</span>],
            ['To', <span key="t" style={{ fontFamily: 'Geist Mono', fontSize: 12, wordBreak: 'break-all' }}>{tx.to}</span>],
            ['Value', <span key="v" style={{ fontWeight: 600 }}>{tx.value}</span>],
            ['Method', <span key="m" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#385CE620', color: '#385CE6' }}>{tx.method}</span>],
            ['Gas Price', tx.gasPrice],
            ['Gas Used', tx.gasUsed],
            ['Gas Limit', tx.gasLimit],
            ['Nonce', tx.nonce],
          ].map(([label, value]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0d0e16' }}>
              <span style={{ color: '#555770', fontSize: 13 }}>{label}</span>
              <span style={{ fontSize: 13 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Input Data</h3>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: '#8b8fa3', background: '#0d0e16', padding: 12, borderRadius: 8, wordBreak: 'break-all' }}>
          {tx.input}
        </div>
      </div>
    </div>
  );
}
