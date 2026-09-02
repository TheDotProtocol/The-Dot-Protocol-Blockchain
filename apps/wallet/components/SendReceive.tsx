'use client';

import { useState } from 'react';

export default function SendReceive({ mode }: { mode: 'send' | 'receive' }) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('3DOT');
  const [copied, setCopied] = useState(false);

  const MY_ADDRESS = '0xAA0bf607b14109A01e94a30674a01e2BA22e9694';

  if (mode === 'receive') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Receive Crypto</h1>
        <div className="card p-6 text-center">
          <div className="w-32 h-32 mx-auto bg-white rounded-xl mb-4 flex items-center justify-center">
            <div className="text-4xl">📱</div>
          </div>
          <div className="text-sm text-gray-400 mb-2">Your Address</div>
          <div className="bg-[#1f2937] rounded-lg p-3 mb-4">
            <code className="text-sm break-all">{MY_ADDRESS}</code>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(MY_ADDRESS); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="btn-primary"
          >
            {copied ? 'Copied!' : 'Copy Address'}
          </button>
          <div className="mt-4 text-xs text-gray-500">
            Only send 3DOT tokens on Dot Protocol Mainnet (Chain ID 1546) to this address
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Send Crypto</h1>
      <div className="card p-6">
        {/* Token Select */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Token</label>
          <div className="flex gap-2">
            {['3DOT', 'ETH', 'USDT', 'USDC'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedToken(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedToken === t
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Recipient Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Amount</label>
            <span className="text-sm text-gray-500">Balance: 1,000,000,000,000 {selectedToken}</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="input-field"
          />
        </div>

        {/* Network Fee */}
        <div className="bg-[#1f2937] rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Network Fee</span>
            <span>~0.001 DOT</span>
          </div>
        </div>

        {/* Send Button */}
        <button className="btn-primary text-lg">
          {!address || !amount ? 'Fill in details' : 'Send'}
        </button>
      </div>
    </div>
  );
}
