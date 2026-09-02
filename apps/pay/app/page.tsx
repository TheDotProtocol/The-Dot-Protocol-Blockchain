"use client";

import { useState } from "react";

const TRANSACTIONS = [
  { id: "TX001", customer: "0x742d...2bD18", amount: "250.00 USDT", status: "completed", time: "2 min ago", product: "Premium Plan" },
  { id: "TX002", customer: "0x1234...5678", amount: "12.50 3DOT", status: "completed", time: "15 min ago", product: "Coffee x5" },
  { id: "TX003", customer: "0xabcd...ef01", amount: "100.00 USDC", status: "pending", time: "1 hour ago", product: "Annual Sub" },
  { id: "TX004", customer: "0x9876...5432", amount: "0.005 BTC", status: "completed", time: "3 hours ago", product: "Hardware Wallet" },
  { id: "TX005", customer: "0xdead...beef", amount: "50.00 3DOT", status: "completed", time: "1 day ago", product: "T-Shirt" },
];

const STATS = [
  { label: "Today's Revenue", value: "$1,250", change: "+18.2%", up: true },
  { label: "This Week", value: "$8,400", change: "+12.5%", up: true },
  { label: "This Month", value: "$32,100", change: "+8.3%", up: true },
  { label: "Total Transactions", value: "1,247", change: "+24 today", up: true },
];

export default function PayPage() {
  const [tab, setTab] = useState<"dashboard" | "create" | "transactions" | "settings">("dashboard");
  const [payAmount, setPayAmount] = useState("");
  const [payDescription, setPayDescription] = useState("");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-[#0a0e17]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">
            3P
          </div>
          <div>
            <div className="text-sm font-bold">3Dot Pay</div>
            <div className="text-[10px] text-gray-500">Crypto Payment Gateway</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#111827] rounded-lg p-0.5 border border-white/5">
          {(["dashboard", "create", "transactions", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                tab === t
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Merchant Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="card p-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className={`text-xs mt-1 ${stat.up ? "text-green-400" : "text-red-400"}`}>{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Quick Create Payment */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Quick Payment Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={payDescription}
                    onChange={(e) => setPayDescription(e.target.value)}
                    placeholder="e.g. Invoice #1234"
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
                    Generate Payment Link
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Recent Transactions</h3>
                <button onClick={() => setTab("transactions")} className="text-xs text-blue-400 hover:text-blue-300">View All →</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-2">ID</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-2">Customer</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-2">Product</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-2">Amount</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-2">Status</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{tx.id}</td>
                      <td className="px-4 py-3 text-xs font-mono">{tx.customer}</td>
                      <td className="px-4 py-3 text-xs">{tx.product}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{tx.amount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          tx.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-right">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Payment Tab */}
        {tab === "create" && (
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center">Create Payment</h1>

            <div className="card p-6">
              {/* QR Code */}
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">💳</div>
                  <div className="text-xs text-gray-400 font-mono">Payment QR</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Currency</label>
                  <div className="flex gap-2">
                    {["3DOT", "USDT", "USDC", "BTC"].map((c) => (
                      <button key={c} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#111827] text-gray-400 border border-white/5 hover:text-white transition-colors">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input
                    type="text"
                    placeholder="Invoice or product name"
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold text-sm mt-2">
                  Create Payment Request
                </button>
              </div>
            </div>

            {/* Payment Link */}
            <div className="card p-4">
              <div className="text-xs text-gray-500 mb-2">Payment Link</div>
              <div className="bg-[#0a0e17] rounded-lg p-3 text-xs font-mono text-gray-400 break-all">
                https://pay.3dot.io/merchant/0xAA0b...9694/tx/TX001
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === "transactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">All Transactions</h1>
              <button className="text-xs bg-[#111827] text-gray-400 px-3 py-1.5 rounded-lg border border-white/5 hover:text-white">
                Export CSV
              </button>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">ID</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Customer</th>
                    <th className="text-left text-[10px] text-gray-500 uppercase px-4 py-3">Product</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Amount</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-right text-[10px] text-gray-500 uppercase px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{tx.id}</td>
                      <td className="px-4 py-3 text-xs font-mono">{tx.customer}</td>
                      <td className="px-4 py-3 text-xs">{tx.product}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{tx.amount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          tx.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-right">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="max-w-lg mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Merchant Settings</h1>

            <div className="card p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Business Name</label>
                <input type="text" defaultValue="The Dot Protocol" className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Settlement Wallet</label>
                <input type="text" defaultValue="0xAA0bf607b14109A01e94a30674a01e2BA22e9694" className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Accepted Tokens</label>
                <div className="flex gap-2">
                  {["3DOT", "USDT", "USDC", "BTC", "BNB"].map((t) => (
                    <label key={t} className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-lg border border-white/5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-blue-500" />
                      <span className="text-xs">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Webhook URL</label>
                <input type="text" placeholder="https://your-server.com/webhook" className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none" />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold text-sm">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
