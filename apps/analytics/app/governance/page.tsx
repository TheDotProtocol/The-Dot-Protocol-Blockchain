'use client';
import { useState } from 'react';

const proposals = [
  { id: 1, title: 'Increase rebase rate from 0.05% to 0.075%', status: 'Active', votesFor: 2450000, votesAgainst: 320000, quorum: 65, deadline: '2026-09-14', proposer: '0x542E...0185' },
  { id: 2, title: 'Add USDC-USDT liquidity pair on Hexchange', status: 'Active', votesFor: 1890000, votesAgainst: 120000, quorum: 48, deadline: '2026-09-12', proposer: '0x435d...41931' },
  { id: 3, title: 'Deploy bridge to Polygon Amoy testnet', status: 'Passed', votesFor: 3200000, votesAgainst: 45000, quorum: 82, deadline: '2026-09-01', proposer: '0xde45...Ac81' },
  { id: 4, title: 'Reduce timelock delay from 48h to 24h', status: 'Defeated', votesFor: 500000, votesAgainst: 1200000, quorum: 42, deadline: '2026-08-28', proposer: '0xd28f...37a4' },
  { id: 5, title: 'Allocate 5M 3DOT to ecosystem grants', status: 'Passed', votesFor: 4100000, votesAgainst: 200000, quorum: 91, deadline: '2026-08-20', proposer: '0x1234...abcd' },
  { id: 6, title: 'Upgrade DPC20 to v2 with gas optimizations', status: 'Pending', votesFor: 0, votesAgainst: 0, quorum: 0, deadline: '2026-09-20', proposer: '0xabcd...5678' },
];

const statusColors: Record<string, string> = { Active: '#385CE6', Passed: '#00c853', Defeated: '#ff3d71', Pending: '#ffaa00' };

export default function Governance() {
  const [tab, setTab] = useState<'proposals' | 'delegates' | 'history'>('proposals');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Governance</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>On-chain governance for DPC20 token — propose, vote, and execute protocol changes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Proposals', value: '6', color: '#385CE6' },
          { label: 'Active Proposals', value: '2', color: '#00c853' },
          { label: 'Total Voters', value: '4,312', color: '#ffaa00' },
          { label: 'Participation Rate', value: '34.2%', color: '#8b8fa3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e2030' }}>
        {(['proposals', 'delegates', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', background: 'none', border: 'none', color: tab === t ? '#fff' : '#555770',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: tab === t ? '2px solid #385CE6' : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {proposals.map(p => (
            <div key={p.id} style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 12, color: '#555770' }}>#{p.id}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#555770' }}>Proposed by {p.proposer} · Deadline: {p.deadline}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: statusColors[p.status] + '20', color: statusColors[p.status] }}>{p.status}</span>
              </div>
              {p.status !== 'Pending' && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#00c853' }}>For: {(p.votesFor / 1e6).toFixed(1)}M</span>
                    <span style={{ color: '#ff3d71' }}>Against: {(p.votesAgainst / 1e6).toFixed(1)}M</span>
                    <span style={{ color: '#555770' }}>Quorum: {p.quorum}%</span>
                  </div>
                  <div style={{ height: 6, background: '#0d0e16', borderRadius: 3, display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${(p.votesFor / (p.votesFor + p.votesAgainst)) * 100}%`, background: '#00c853' }} />
                    <div style={{ width: `${(p.votesAgainst / (p.votesFor + p.votesAgainst)) * 100}%`, background: '#ff3d71' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'delegates' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20, textAlign: 'center', color: '#555770' }}>
          Delegate dashboard will show top delegates and their voting power. Connect MetaMask to delegate your voting power.
        </div>
      )}

      {tab === 'history' && (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20, textAlign: 'center', color: '#555770' }}>
          Execution history shows all past governance proposals and their on-chain execution results.
        </div>
      )}
    </div>
  );
}
