'use client';
import { useState } from 'react';

export default function Recovery() {
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  const recoveryPhrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  const words = recoveryPhrase.split(' ');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Recovery Phrase</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, margin: '4px 0 0' }}>Your 12-word secret recovery phrase — never share it with anyone</p>
      </div>

      <div style={{ background: '#181a24', border: '1px solid #ff3d71', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#ff3d71' }}>Critical Security Warning</div>
          <div style={{ fontSize: 12, color: '#8b8fa3', marginTop: 2 }}>Anyone with these words can permanently steal all your funds. Never share them, never screenshot them, never store them digitally.</div>
        </div>
      </div>

      {!revealed ? (
        <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Recovery Phrase Protected</div>
          <div style={{ color: '#8b8fa3', fontSize: 13, marginBottom: 20 }}>Click below to reveal your 12-word recovery phrase. Make sure no one is watching your screen.</div>
          <button onClick={() => setRevealed(true)} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none', background: '#385CE6', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>Reveal Recovery Phrase</button>
        </div>
      ) : (
        <>
          <div style={{ background: '#181a24', border: '1px solid #ffaa00', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {words.map((w, i) => (
                <div key={i} style={{ padding: '10px', background: '#0d0e16', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#555770' }}>{i + 1}.</div>
                  <div style={{ fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 500, marginTop: 2 }}>{w}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#181a24', border: '1px solid #1e2030', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Backup Checklist</div>
            {[
              'Written down on paper (not digitally)',
              'Stored in a secure physical location',
              'Verified by re-reading all 12 words',
              'Never shared with anyone',
            ].map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#385CE6' }} />
                <span style={{ color: '#8b8fa3' }}>{item}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
