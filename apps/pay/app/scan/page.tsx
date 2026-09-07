'use client';
import { useState } from 'react';

export default function QRScan() {
  const [scanned, setScanned] = useState(false);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 40, maxWidth: 480, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, textAlign: 'center' }}>Scan to Pay</h1>
        <p style={{ color: '#8b8fa3', fontSize: 14, marginTop: 4, textAlign: 'center' }}>Point your camera at a 3Dot Pay QR code</p>
      </div>

      {/* Camera Viewfinder */}
      <div style={{
        width: 300, height: 300, borderRadius: 24, background: '#0d0e16', border: '2px solid #385CE6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Corner brackets */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
          <div key={corner} style={{
            position: 'absolute',
            ...(corner.includes('top') ? { top: 16 } : { bottom: 16 }),
            ...(corner.includes('left') ? { left: 16 } : { right: 16 }),
            width: 24, height: 24,
            borderTop: corner.includes('top') ? '3px solid #385CE6' : 'none',
            borderBottom: corner.includes('bottom') ? '3px solid #385CE6' : 'none',
            borderLeft: corner.includes('left') ? '3px solid #385CE6' : 'none',
            borderRight: corner.includes('right') ? '3px solid #385CE6' : 'none',
          }} />
        ))}
        
        {!scanned ? (
          <div style={{ textAlign: 'center', color: '#555770' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 13 }}>Camera viewfinder</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#00c853' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>QR Code Detected!</div>
          </div>
        )}
        
        {/* Scanning animation line */}
        <div style={{
          position: 'absolute', left: 32, right: 32, height: 2,
          background: 'linear-gradient(90deg, transparent, #385CE6, transparent)',
          animation: 'scan 2s infinite',
        }} />
      </div>

      {!scanned ? (
        <button onClick={() => setScanned(true)} style={{
          padding: '12px 32px', borderRadius: 12, border: '1px solid #1e2030', background: '#181a24', color: '#8b8fa3',
          fontSize: 14, cursor: 'pointer',
        }}>Simulate Scan</button>
      ) : (
        <div style={{ width: '100%', background: '#181a24', border: '1px solid #1e2030', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: '#555770', textTransform: 'uppercase' }}>Detected Payment Request</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Merchant', 'The Dot Protocol Store'],
              ['Amount', '125.00 USDT'],
              ['Network', 'The Dot Protocol (ID: 1545)'],
              ['Memo', 'Order #ORD-2026-0907-002'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555770' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <a href="/confirm" style={{
            display: 'block', textAlign: 'center', marginTop: 16, padding: '12px 0', borderRadius: 10, background: '#385CE6', color: '#fff',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>Proceed to Payment</a>
        </div>
      )}
    </div>
  );
}
