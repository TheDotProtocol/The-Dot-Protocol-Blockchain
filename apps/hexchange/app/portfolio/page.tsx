"use client";

import { useState, useEffect } from "react";

const MOCK_BALANCES = [
  { symbol: "3DOT", name: "Dot Protocol Coin", balance: "12,450.00", usd: "$124.50", change: "+5.2%", up: true },
  { symbol: "USDT", name: "Tether USD", balance: "2,300.00", usd: "$2,300.00", change: "+0.1%", up: true },
  { symbol: "BTC", name: "Bitcoin", balance: "0.045", usd: "$2,925.00", change: "+2.8%", up: true },
  { symbol: "BNB", name: "BNB Chain", balance: "8.5", usd: "$2,550.00", change: "-1.2%", up: false },
  { symbol: "USDC", name: "USD Coin", balance: "1,100.00", usd: "$1,100.00", change: "0.0%", up: true },
  { symbol: "XRP", name: "Ripple", balance: "5,200", usd: "$2,600.00", change: "+3.1%", up: true },
];

export default function PortfolioPage() {
  const [tab, setTab] = useState<"balances" | "history" | "deposit" | "withdraw">("balances");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Portfolio</h1>
          <p className="text-xs text-gray-500 mt-1">Your Hexchange custodial wallet balances</p>
        </div>
        <span className="mode-badge mode-cex">CEX Custodial</span>
      </div>

      {/* Total Balance Card */}
      <div className="card p-6 bg-gradient-to-br from-[#111827] to-[#0a0e17]">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Portfolio Value</div>
        <div className="text-3xl font-bold text-white mb-2">$9,599.50</div>
        <div className="text-sm text-green-400">+$312.40 (3.36%) today</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d1117] rounded-lg p-1 border border-white/5">
        {(["balances", "history", "deposit", "withdraw"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`trade-tab text-xs capitalize ${tab === t ? "active" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Balances Tab */}
      {tab === "balances" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Asset</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Balance</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Value (USD)</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">24h</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BALANCES.map((token) => (
                <tr key={token.symbol} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-sm font-bold text-orange-400">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{token.symbol}</div>
                        <div className="text-[10px] text-gray-500">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-4 py-3 text-sm font-mono">{token.balance}</td>
                  <td className="text-right px-4 py-3 text-sm font-mono">{token.usd}</td>
                  <td className={`text-right px-4 py-3 text-xs ${token.up ? "text-green-400" : "text-red-400"}`}>
                    {token.change}
                  </td>
                  <td className="text-right px-4 py-3">
                    <button className="text-xs text-orange-400 hover:text-orange-300 mr-2">Deposit</button>
                    <button className="text-xs text-gray-400 hover:text-white">Withdraw</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="card p-5">
          <div className="text-center py-12 text-gray-600 text-sm">
            <div className="text-3xl mb-3">📋</div>
            No transaction history yet
            <p className="text-xs text-gray-700 mt-2">Your deposits, withdrawals, and trades will appear here</p>
          </div>
        </div>
      )}

      {/* Deposit Tab */}
      {tab === "deposit" && (
        <div className="card p-6 max-w-md mx-auto">
          <h3 className="text-sm font-semibold mb-4">Deposit Tokens</h3>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Select Token</label>
            <select className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none">
              {MOCK_BALANCES.map((t) => (
                <option key={t.symbol} value={t.symbol}>{t.symbol} — {t.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Deposit Address</label>
            <div className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-400 break-all">
              0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
            </div>
          </div>
          <p className="text-[10px] text-gray-600">
            Send only 3DOT-compatible tokens to this address. Sending other tokens may result in permanent loss.
          </p>
        </div>
      )}

      {/* Withdraw Tab */}
      {tab === "withdraw" && (
        <div className="card p-6 max-w-md mx-auto">
          <h3 className="text-sm font-semibold mb-4">Withdraw Tokens</h3>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Token</label>
            <select className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none">
              {MOCK_BALANCES.map((t) => (
                <option key={t.symbol} value={t.symbol}>{t.symbol} — {t.balance}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
          <button className="btn-primary w-full">Withdraw</button>
        </div>
      )}
    </div>
  );
}
