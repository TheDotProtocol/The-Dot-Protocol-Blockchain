"use client";

import { useState } from "react";

const POOLS = [
  { pair: "3DOT/USDT", token0: "3DOT", token1: "USDT", tvl: "2,450,000", apr: "24.5%", volume24h: "185,000", fee: "0.3%", icon0: "🔴", icon1: "🟢" },
  { pair: "3DOT/BTC", token0: "3DOT", token1: "BTC", tvl: "1,820,000", apr: "18.2%", volume24h: "92,000", fee: "0.3%", icon0: "🔴", icon1: "🔵" },
  { pair: "3DOT/BNB", token0: "3DOT", token1: "BNB", tvl: "980,000", apr: "31.0%", volume24h: "67,000", fee: "0.3%", icon0: "🔴", icon1: "🟣" },
  { pair: "TDOT/USDT", token0: "TDOT", token1: "USDT", tvl: "125,000", apr: "42.0%", volume24h: "8,500", fee: "0.3%", icon0: "🟡", icon1: "🟢" },
];

export default function PoolCard() {
  const [tab, setTab] = useState<"pools" | "add" | "remove">("pools");
  const [selectedPool, setSelectedPool] = useState(0);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");

  const pool = POOLS[selectedPool];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d1117] p-1 rounded-xl max-w-md">
        {(["pools", "add", "remove"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#1f2937] text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
            {t === "pools" ? "All Pools" : t === "add" ? "Add Liquidity" : "Remove"}
          </button>
        ))}
      </div>

      {/* Pools List */}
      {tab === "pools" && (
        <div className="space-y-3">
          {POOLS.map((p, i) => (
            <button key={i} onClick={() => { setSelectedPool(i); setTab("add"); }}
              className="card w-full p-5 hover:border-gray-700 transition-all text-left group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <span className="w-10 h-10 rounded-full bg-[#1a1f2e] flex items-center justify-center text-lg border-2 border-[#111827]">{p.icon0}</span>
                    <span className="w-10 h-10 rounded-full bg-[#1a1f2e] flex items-center justify-center text-lg border-2 border-[#111827]">{p.icon1}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-orange-400 transition-colors">{p.pair}</div>
                    <div className="text-xs text-gray-500">Fee: {p.fee}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8 text-right">
                  <div>
                    <div className="text-xs text-gray-500">TVL</div>
                    <div className="text-sm font-medium text-white">${p.tvl}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">24h Vol</div>
                    <div className="text-sm font-medium text-white">${p.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">APR</div>
                    <div className="text-sm font-bold text-green-400">{p.apr}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Liquidity */}
      {tab === "add" && (
        <div className="card p-6 max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-1">Add Liquidity</h3>
          <p className="text-sm text-gray-500 mb-5">Provide {pool.pair} liquidity and earn {pool.fee} trading fees</p>

          <div className="space-y-3">
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{pool.token0}</span>
                <span className="text-xs text-gray-600">Balance: 1,000,000</span>
              </div>
              <input type="number" value={amount0} onChange={(e) => { setAmount0(e.target.value); if (e.target.value) setAmount1((parseFloat(e.target.value) * 1.0).toFixed(2)); }}
                placeholder="0.0" className="bg-transparent text-xl font-bold w-full outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>

            <div className="flex justify-center">
              <div className="bg-[#2a2f3a] p-2 rounded-lg border-4 border-[#0a0e17]">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
              </div>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{pool.token1}</span>
                <span className="text-xs text-gray-600">Balance: 50,000</span>
              </div>
              <input type="number" value={amount1} onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.0" className="bg-transparent text-xl font-bold w-full outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          {amount0 && amount1 && (
            <div className="mt-4 bg-[#0d1117] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Share of Pool</span><span className="text-gray-300">~0.04%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{pool.token0} Deposited</span><span className="text-gray-300">{amount0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{pool.token1} Deposited</span><span className="text-gray-300">{amount1}</span></div>
            </div>
          )}

          <button disabled={!amount0 || !amount1}
            className="w-full mt-5 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
            Approve & Add Liquidity
          </button>
        </div>
      )}

      {/* Remove Liquidity */}
      {tab === "remove" && (
        <div className="card p-6 max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-1">Remove Liquidity</h3>
          <p className="text-sm text-gray-500 mb-5">Remove {pool.pair} liquidity tokens</p>

          <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800/50 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">LP Tokens</span>
              <span className="text-xs text-gray-600">Balance: 125.5</span>
            </div>
            <input type="number" value={removeAmount} onChange={(e) => setRemoveAmount(e.target.value)}
              placeholder="0.0" className="bg-transparent text-xl font-bold w-full outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>

          {/* Percentage buttons */}
          <div className="flex gap-2 mb-4">
            {[25, 50, 75, 100].map((pct) => (
              <button key={pct} onClick={() => setRemoveAmount((125.5 * pct / 100).toFixed(2))}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#1a1f2e] border border-gray-800/50 text-gray-400 hover:text-white hover:border-orange-500/30 transition-all">
                {pct}%
              </button>
            ))}
          </div>

          {removeAmount && parseFloat(removeAmount) > 0 && (
            <div className="bg-[#0d1117] rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">{pool.token0} Received</span><span className="text-gray-300">{(parseFloat(removeAmount) * 9800).toFixed(4)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{pool.token1} Received</span><span className="text-gray-300">{(parseFloat(removeAmount) * 98).toFixed(4)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Pool Share</span><span className="text-gray-300">~0.04%</span></div>
            </div>
          )}

          <button disabled={!removeAmount || parseFloat(removeAmount) <= 0}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
            Remove Liquidity
          </button>
        </div>
      )}
    </div>
  );
}
