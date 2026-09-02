'use client';

import { useState } from 'react';

const MERCHANTS = [
  { name: 'CryptoShop', icon: '🛒', category: 'E-commerce' },
  { name: 'GameVault', icon: '🎮', category: 'Gaming' },
  { name: 'StreamPlus', icon: '📺', category: 'Entertainment' },
  { name: 'CloudHost', icon: '☁️', category: 'Technology' },
];

const RECENT_PAYMENTS = [
  { merchant: 'CryptoShop', amount: '$24.99', token: '3DOT', date: '2 hours ago', status: 'completed' },
  { merchant: 'GameVault', amount: '$9.99', token: 'USDT', date: '1 day ago', status: 'completed' },
  { merchant: 'StreamPlus', amount: '$14.99', token: 'ETH', date: '3 days ago', status: 'completed' },
];

export default function PayWithCrypto() {
  const [merchantAddress, setMerchantAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('3DOT');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">3Dot Pay</h1>
        <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-medium">NEW</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Payment Form */}
        <div className="w-full lg:w-1/2">
          {step === 'form' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Send Payment</h2>

              {/* Token */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Pay With</label>
                <div className="flex gap-2">
                  {['3DOT', 'ETH', 'USDT', 'USDC'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedToken(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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

              {/* Merchant Address */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Merchant Address</label>
                <input
                  type="text"
                  value={merchantAddress}
                  onChange={(e) => setMerchantAddress(e.target.value)}
                  placeholder="0x..."
                  className="input-field"
                />
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              {/* Fee */}
              <div className="bg-[#1f2937] rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Network Fee</span>
                  <span>~$0.01</span>
                </div>
                <div className="flex justify-between text-gray-400 mt-1">
                  <span>Processing Fee</span>
                  <span>0.5%</span>
                </div>
              </div>

              <button
                onClick={() => merchantAddress && amount && setStep('confirm')}
                className="btn-primary text-lg"
              >
                {!merchantAddress || !amount ? 'Fill in details' : 'Review Payment'}
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
              <div className="bg-[#1f2937] rounded-xl p-4 mb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">To</span>
                  <span className="font-mono text-xs">{merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-medium">{amount} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Token</span>
                  <span>{selectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network</span>
                  <span>Dot Protocol Mainnet</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep('success')} className="btn-primary flex-1">Confirm & Pay</button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="card p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold mb-2">Payment Sent!</h2>
              <p className="text-gray-400 mb-4">Your payment has been submitted to the network.</p>
              <div className="bg-[#1f2937] rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Transaction</span>
                  <span className="text-orange-400 font-mono">0x8f3a...2b1c</span>
                </div>
              </div>
              <button onClick={() => { setStep('form'); setMerchantAddress(''); setAmount(''); }} className="btn-primary">
                Make Another Payment
              </button>
            </div>
          )}
        </div>

        {/* Recent Payments & Merchants */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Quick Pay Merchants */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Pay</h2>
            <div className="grid grid-cols-2 gap-3">
              {MERCHANTS.map((m) => (
                <button key={m.name} className="bg-[#1f2937] hover:bg-gray-700 p-3 rounded-xl text-left transition-colors">
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {RECENT_PAYMENTS.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1f2937] rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{p.merchant}</div>
                    <div className="text-xs text-gray-500">{p.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{p.amount}</div>
                    <div className="text-xs text-gray-500">{p.token}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
