'use client';
import { useState } from 'react';

export default function WalletSecurity() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [lockTimeout, setLockTimeout] = useState('5');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Security Settings</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>Manage your wallet security preferences and authentication</p>
      </div>

      {/* Biometrics */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Biometric Authentication</div>
            <div style={{ color: '#8b8fa3', fontSize: 13, marginTop: 2 }}>Use Face ID, Touch ID, or fingerprint to unlock</div>
          </div>
          <button onClick={() => setBiometricEnabled(!biometricEnabled)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: biometricEnabled ? '#385CE6' : '#2a2d3e', position: 'relative', transition: 'all 0.2s'
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3,
              left: biometricEnabled ? 25 : 3, transition: 'all 0.2s'
            }} />
          </button>
        </div>
      </div>

      {/* Two Factor */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Two-Factor Authentication</div>
            <div style={{ color: '#8b8fa3', fontSize: 13, marginTop: 2 }}>Add an extra layer of security for transactions</div>
          </div>
          <button onClick={() => setTwoFactor(!twoFactor)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: twoFactor ? '#385CE6' : '#2a2d3e', position: 'relative', transition: 'all 0.2s'
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3,
              left: twoFactor ? 25 : 3, transition: 'all 0.2s'
            }} />
          </button>
        </div>
      </div>

      {/* Lock Timeout */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Auto-Lock Timeout</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1', '5', '15', '30', '60'].map(t => (
            <button key={t} onClick={() => setLockTimeout(t)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: lockTimeout === t ? '#385CE6' : 'transparent',
              borderColor: lockTimeout === t ? '#385CE6' : '#1e2030',
              color: lockTimeout === t ? '#fff' : '#8b8fa3',
            }}>{t} min</button>
          ))}
        </div>
      </div>

      {/* Recovery Phrase */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Recovery Phrase</div>
            <div style={{ color: '#00c853', fontSize: 13, marginTop: 2 }}>✓ Backed up on 2026-09-01</div>
          </div>
          <a href="/recovery" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #1e2030', background: 'transparent', color: '#8b8fa3', fontSize: 13, textDecoration: 'none' }}>View</a>
        </div>
      </div>

      {/* Advanced */}
      <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Advanced Security</div>
        {[
          { label: 'Transaction Signing', desc: 'Require explicit approval for every transaction', enabled: true },
          { label: 'Whitelist Only', desc: 'Only send to pre-approved addresses', enabled: false },
          { label: 'Session Timeout', desc: 'Disconnect after inactivity', enabled: true },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e2030' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#555770' }}>{item.desc}</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.enabled ? '#00c853' : '#ff3d71' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
