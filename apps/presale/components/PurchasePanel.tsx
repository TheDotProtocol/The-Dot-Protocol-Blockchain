'use client';

import { useState } from 'react';

const PHASES = [
  { name: 'Early Bird', price: '$0.005', bonus: '50%', status: 'active', timeLeft: '2d 14h' },
  { name: 'Seed Round', price: '$0.008', bonus: '30%', status: 'upcoming', timeLeft: '--' },
  { name: 'Public Sale', price: '$0.01', bonus: '0%', status: 'upcoming', timeLeft: '--' },
];

export default function PurchasePanel() {
  const [amount, setAmount] = useState('');
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdt' | 'usdc'>('eth');

  const estimatedTokens = amount ? (parseFloat(amount) / 0.005 * 1.5).toFixed(0) : '0';

  return (
    <div className="card p-6">
      {/* Phase Tabs */}
      <div className="flex gap-2 mb-6">
        {PHASES.map((phase, i) => (
          <button
            key={phase.name}
            onClick={() => setSelectedPhase(i)}
            className={`flex-1 p-3 rounded-lg text-center transition-colors ${
              selectedPhase === i
                ? 'bg-orange-500/20 border border-orange-500/30'
                : 'bg-gray-800/50 hover:bg-gray-800'
            }`}
          >
            <div className="text-sm font-medium">{phase.name}</div>
            <div className="text-xs text-gray-400 mt-1">{phase.price}</div>
            <div className="text-xs text-green-400">+{phase.bonus}</div>
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="bg-[#1f2937] rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-gray-400 mb-2">Early Bird Ends In</div>
        <div className="flex justify-center gap-4 text-2xl font-mono font-bold">
          <div><span className="text-orange-500">2</span><span className="text-xs text-gray-500 ml-1">days</span></div>
          <div><span className="text-orange-500">14</span><span className="text-xs text-gray-500 ml-1">hrs</span></div>
          <div><span className="text-orange-500">32</span><span className="text-xs text-gray-500 ml-1">min</span></div>
          <div><span className="text-orange-500">08</span><span className="text-xs text-gray-500 ml-1">sec</span></div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Pay With</label>
        <div className="flex gap-2">
          {(['eth', 'usdt', 'usdc'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                paymentMethod === m
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-[#1f2937] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Amount</span>
          <span className="text-sm text-gray-500">Min: 0.01 ETH</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-2xl font-medium outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-400 font-medium">{paymentMethod.toUpperCase()}</span>
        </div>
      </div>

      {/* Estimated Tokens */}
      {amount && (
        <div className="bg-[#1f2937] rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>You Will Receive</span>
            <span className="text-white font-medium">{Number(estimatedTokens).toLocaleString()} 3DOT</span>
          </div>
          <div className="flex justify-between text-gray-400 mt-1">
            <span>Bonus</span>
            <span className="text-green-400">+50%</span>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <button className="btn-primary text-lg">
        {!amount ? 'Enter Amount' : `Buy 3DOT with ${paymentMethod.toUpperCase()}`}
      </button>
    </div>
  );
}
