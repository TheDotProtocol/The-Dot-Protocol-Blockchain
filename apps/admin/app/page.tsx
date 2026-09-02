"use client";

import { useState } from "react";

// Mock data
const CHAIN_STATS = {
  testnet: { blocks: 5095, chainId: 1545, status: "healthy", gas: "0 gwei", validators: 7 },
  mainnet: { blocks: 4218, chainId: 1546, status: "healthy", gas: "0 gwei", validators: 7 },
};

const CONTRACTS = [
  { name: "DPC20 (TDOT)", address: "0x542E...0185", chain: "Testnet", status: "deployed", admin: "Multisig" },
  { name: "DPC20 (3DOT)", address: "0x84ed...ed56", chain: "Mainnet", status: "deployed", admin: "Multisig" },
  { name: "HexchangeFactory", address: "0xA1b2...AbCd", chain: "Testnet", status: "deployed", admin: "Multisig" },
  { name: "HexchangeRouter", address: "0xB2c3...BcDe", chain: "Testnet", status: "deployed", admin: "Multisig" },
  { name: "DecentralizedOracle", address: "0x435d...4931", chain: "Testnet", status: "deployed", admin: "Multisig" },
  { name: "GnosisSafeL2", address: "Deploying...", chain: "Testnet", status: "pending", admin: "—" },
  { name: "CCIPBridge", address: "0xd28f...37a4", chain: "Testnet", status: "deployed", admin: "Multisig" },
];

const USERS = [
  { id: "USR001", email: "demo@hexchange.com", kyc: "verified", orders: 42, joined: "Sep 1, 2026" },
  { id: "USR002", email: "trader@example.com", kyc: "pending", orders: 18, joined: "Sep 2, 2026" },
  { id: "USR003", email: "investor@dot.com", kyc: "verified", orders: 7, joined: "Sep 2, 2026" },
  { id: "USR004", email: "dev@protocol.io", kyc: "none", orders: 0, joined: "Sep 3, 2026" },
];

const SECURITY_EVENTS = [
  { severity: "info", message: "All 30 contract tests passing", time: "2 min ago" },
  { severity: "success", message: "GnosisSafeL2 multisig deployed on testnet", time: "1 hour ago" },
  { severity: "warning", message: "CORS restricted on all Besu nodes", time: "3 hours ago" },
  { severity: "success", message: "JWT secret rotated, no fallback", time: "3 hours ago" },
  { severity: "info", message: "Forta monitoring bot configured", time: "5 hours ago" },
  { severity: "info", message: "Tenderly alerts configured", time: "5 hours ago" },
];

const LIQUIDITY_POOLS = [
  { pair: "TDOT/USDT", tvl: "$12,450", volume24h: "$3,200", apr: "24.5%", reserves: "1.25M / 12,450" },
  { pair: "TDOT/BTC", tvl: "$8,200", volume24h: "$1,800", apr: "18.2%", reserves: "820K / 0.123" },
  { pair: "TDOT/BNB", tvl: "$6,100", volume24h: "$950", apr: "21.7%", reserves: "610K / 20.3" },
  { pair: "TDOT/USDC", tvl: "$9,800", volume24h: "$2,100", apr: "19.8%", reserves: "980K / 9,800" },
  { pair: "TDOT/XRP", tvl: "$5,400", volume24h: "$680", apr: "15.4%", reserves: "540K / 10,800" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "contracts" | "users" | "liquidity" | "security">("overview");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-[#0a0e17]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-red-500/20">
            🔧
          </div>
          <div>
            <div className="text-sm font-bold">Admin Dashboard</div>
            <div className="text-[10px] text-gray-500">The Dot Protocol</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#111827] rounded-lg p-0.5 border border-white/5">
          {(["overview", "contracts", "users", "liquidity", "security"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                tab === t
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">System Overview</h1>

            {/* Chain Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CHAIN_STATS).map(([name, chain]) => (
                <div key={name} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize">{name}</h3>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400">{chain.status}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Chain ID</div>
                      <div className="font-mono">{chain.chainId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Blocks</div>
                      <div className="font-mono">{chain.blocks.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Gas Price</div>
                      <div className="font-mono">{chain.gas}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Validators</div>
                      <div className="font-mono">{chain.validators}/7</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: "4", icon: "👥" },
                { label: "Total Orders", value: "67", icon: "📊" },
                { label: "Contracts", value: "7", icon: "📝" },
                { label: "Pools", value: "5", icon: "💧" },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Security Events */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4">Recent Security Events</h3>
              <div className="space-y-2">
                {SECURITY_EVENTS.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02]">
                    <span className={`w-2 h-2 rounded-full ${
                      event.severity === "success" ? "bg-green-400" :
                      event.severity === "warning" ? "bg-yellow-400" :
                      event.severity === "error" ? "bg-red-400" : "bg-blue-400"
                    }`} />
                    <span className="text-sm flex-1">{event.message}</span>
                    <span className="text-xs text-gray-600">{event.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contracts Tab */}
        {tab === "contracts" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Smart Contracts</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Contract</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Address</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Chain</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Admin</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRACTS.map((c, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{c.address}</td>
                      <td className="px-4 py-3 text-xs">{c.chain}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.admin}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          c.status === "deployed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">ID</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Email</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">KYC</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Orders</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{u.id}</td>
                      <td className="px-4 py-3 text-sm">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          u.kyc === "verified" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          u.kyc === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}>
                          {u.kyc}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{u.orders}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-right">{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liquidity Tab */}
        {tab === "liquidity" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Liquidity Pools</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Pair</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">TVL</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">24h Volume</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">APR</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Reserves</th>
                  </tr>
                </thead>
                <tbody>
                  {LIQUIDITY_POOLS.map((pool) => (
                    <tr key={pool.pair} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-medium">{pool.pair}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{pool.tvl}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{pool.volume24h}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono text-green-400">{pool.apr}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono text-gray-400">{pool.reserves}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Security Status</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Critical", count: 0, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "High", count: 0, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Medium", count: 0, color: "text-green-400", bg: "bg-green-500/10" },
              ].map((item) => (
                <div key={item.label} className="card p-4 text-center">
                  <div className={`text-3xl font-bold ${item.color}`}>{item.count}</div>
                  <div className="text-xs text-gray-500 uppercase mt-1">{item.label} Findings</div>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4">Security Checklist</h3>
              <div className="space-y-2">
                {[
                  { item: "TimelockController deployed", done: true },
                  { item: "Rebase capped at ±5% per 30 days", done: true },
                  { item: "GnosisSafeL2 3-of-5 multisig", done: true },
                  { item: "CORS restricted on Besu nodes", done: true },
                  { item: "JWT with no fallback secret", done: true },
                  { item: "CSP headers on API", done: true },
                  { item: "Forta monitoring configured", done: true },
                  { item: "Tenderly alerts configured", done: true },
                  { item: "Bug bounty program published", done: true },
                  { item: "Professional audit scheduled", done: false },
                ].map((check) => (
                  <div key={check.item} className="flex items-center gap-3 p-2 rounded-lg">
                    <span className={`text-sm ${check.done ? "text-green-400" : "text-gray-600"}`}>
                      {check.done ? "✅" : "🔲"}
                    </span>
                    <span className={`text-sm ${check.done ? "text-gray-300" : "text-gray-500"}`}>
                      {check.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
