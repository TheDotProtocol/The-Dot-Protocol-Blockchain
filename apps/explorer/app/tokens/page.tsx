'use client';

const tokens = [
  { rank: 1, name: 'The Dot Protocol Token', symbol: '3DOT', type: 'DPC20', price: '$1.00', marketCap: '$750,000,000', holders: 12847, supply: '750,000,000', chain: 'Mainnet' },
  { rank: 2, name: 'TDOT Test Token', symbol: 'TDOT', type: 'DPC20', price: '$0.01', marketCap: '$1,000,000', holders: 3421, supply: '100,000,000', chain: 'Testnet' },
  { rank: 3, name: 'Tether USD', symbol: 'USDT', type: 'ERC-20', price: '$1.00', marketCap: '$12,500,000', holders: 892, supply: '12,500,000', chain: 'Testnet' },
  { rank: 4, name: 'USD Coin', symbol: 'USDC', type: 'ERC-20', price: '$1.00', marketCap: '$7,500,000', holders: 654, supply: '7,500,000', chain: 'Testnet' },
  { rank: 5, name: 'Bitcoin (Bridged)', symbol: 'BTC', type: 'BEP-20', price: '$70,000', marketCap: '$3,500,000', holders: 231, supply: '50', chain: 'Testnet' },
  { rank: 6, name: 'BNB (Bridged)', symbol: 'BNB', type: 'BEP-20', price: '$600', marketCap: '$750,000', holders: 187, supply: '1,250', chain: 'Testnet' },
];

export default function Tokens() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Tokens</h1>
        <p style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4 }}>All tokens on The Dot Protocol blockchain</p>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['#', 'Token', 'Type', 'Price', 'Market Cap', 'Holders', 'Supply', 'Chain'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555770', fontSize: 11, textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.rank} style={{ borderBottom: '1px solid #1e2030', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px', color: '#555770' }}>{t.rank}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{t.symbol}</div>
                  <div style={{ color: '#555770', fontSize: 12 }}>{t.name}</div>
                </td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, background: '#385CE620', color: '#385CE6' }}>{t.type}</span></td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{t.price}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12 }}>{t.marketCap}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12 }}>{t.holders.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'Geist Mono', fontSize: 12 }}>{t.supply}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, background: t.chain === 'Mainnet' ? '#00c85320' : '#ffaa0020', color: t.chain === 'Mainnet' ? '#00c853' : '#ffaa00' }}>{t.chain}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
