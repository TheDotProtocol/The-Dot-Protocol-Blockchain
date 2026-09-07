'use client';

const validators = [
  { id: 1, address: '0x542E95FD423962505EBfb279C1361351507A0185', name: 'Validator #1', status: 'Active', blocksSigned: 4521, uptime: '99.98%', stake: '10,000 TDOT', lastBlock: 45231 },
  { id: 2, address: '0x435d6A390c865De76c80c6262aD2D7a5b5D41931', name: 'Validator #2', status: 'Active', blocksSigned: 4519, uptime: '99.97%', stake: '10,000 TDOT', lastBlock: 45230 },
  { id: 3, address: '0x436A576D59f7C38BC804ED29251601Eb176f8667', name: 'Validator #3', status: 'Active', blocksSigned: 4520, uptime: '99.99%', stake: '10,000 TDOT', lastBlock: 45229 },
  { id: 4, address: '0xde455081D202269e8fD7B4b37bb85f1Fd81fF126', name: 'Validator #4', status: 'Active', blocksSigned: 4518, uptime: '99.96%', stake: '10,000 TDOT', lastBlock: 45231 },
  { id: 5, address: '0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4', name: 'Validator #5', status: 'Active', blocksSigned: 4522, uptime: '99.99%', stake: '10,000 TDOT', lastBlock: 45230 },
  { id: 6, address: '0x84ed5E46280c6911551925329C3af6c58e4ced56', name: 'Validator #6', status: 'Active', blocksSigned: 4517, uptime: '99.95%', stake: '10,000 TDOT', lastBlock: 45228 },
  { id: 7, address: '0xAE7D6822975e9050bF3AafB823351F95eD518eeb', name: 'Validator #7', status: 'Active', blocksSigned: 4521, uptime: '99.98%', stake: '10,000 TDOT', lastBlock: 45231 },
];

export default function Validators() {
  const totalSigned = validators.reduce((a, v) => a + v.blocksSigned, 0);
  const avgUptime = (validators.reduce((a, v) => a + parseFloat(v.uptime), 0) / validators.length).toFixed(2);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Validators</h1>
        <p style={{ color: '#8b8fa3', fontSize: 13, marginTop: 4 }}>QBFT consensus validators on The Dot Protocol (Chennai Testnet)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Active Validators', value: '7/7', color: '#00c853' },
          { label: 'Total Blocks Signed', value: totalSigned.toLocaleString(), color: '#385CE6' },
          { label: 'Average Uptime', value: avgUptime + '%', color: '#00c853' },
          { label: 'Total Stake', value: '70,000 TDOT', color: '#ffaa00' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2030' }}>
              {['ID', 'Name', 'Address', 'Status', 'Blocks Signed', 'Uptime', 'Stake', 'Last Block'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#555770', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validators.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #1e2030' }}>
                <td style={{ padding: '10px 12px', color: '#555770' }}>#{v.id}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{v.name}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: 'Geist Mono', fontSize: 11, background: '#0d0e16', padding: '2px 6px', borderRadius: 4 }}>{v.address.slice(0, 6)}...{v.address.slice(-4)}</span></td>
                <td style={{ padding: '10px 12px' }}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853' }} /><span style={{ color: '#00c853', fontSize: 12 }}>{v.status}</span></span></td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12 }}>{v.blocksSigned.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#00c853', fontWeight: 500 }}>{v.uptime}</td>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>{v.stake}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Geist Mono', fontSize: 12, color: '#385CE6' }}>#{v.lastBlock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
