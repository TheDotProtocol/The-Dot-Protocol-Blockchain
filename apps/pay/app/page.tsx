"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const TOKENS = [
  { symbol: "3DOT", color: "#f97316" },
  { symbol: "USDT", color: "#26a17b" },
  { symbol: "USDC", color: "#2775ca" },
  { symbol: "BTC", color: "#f7931a" },
  { symbol: "BNB", color: "#f3ba2f" },
  { symbol: "XRP", color: "#00aae4" },
];

interface PaymentLink {
  id: string;
  amount: string;
  token: string;
  description: string;
  status: "pending" | "paid" | "expired";
  address: string;
  createdAt: string;
}

interface MerchantSettings {
  businessName: string;
  walletAddress: string;
  webhookUrl: string;
  acceptedTokens: string[];
}

export default function PayPage() {
  const [tab, setTab] = useState<"dashboard" | "create" | "links" | "settings">("dashboard");
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Merchant settings
  const [settings, setSettings] = useState<MerchantSettings>({
    businessName: "",
    walletAddress: "",
    webhookUrl: "",
    acceptedTokens: ["3DOT", "USDT", "USDC"],
  });

  // Payment link creation
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("3DOT");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Payment links
  const [links, setLinks] = useState<PaymentLink[]>([]);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalReceived: 0,
    todayReceived: 0,
    totalPayments: 0,
    todayPayments: 0,
    avgPayment: 0,
  });

  // Recent transactions
  const [transactions, setTransactions] = useState<any[]>([]);

  const connect = async () => {
    if (!(window as any).ethereum) { alert("Install MetaMask"); return; }
    setConnecting(true);
    try {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      setAddress(addr);
      setSettings(prev => ({ ...prev, walletAddress: addr }));
    } catch (e) { console.error(e); }
    setConnecting(false);
  };

  useEffect(() => { connect(); }, []);

  // Load dashboard data (in production: fetch from API)
  useEffect(() => {
    if (!address) return;

    // Simulate real merchant data
    const mockLinks: PaymentLink[] = [
      { id: "PL001", amount: "250", token: "3DOT", description: "Invoice #INV-2026-001", status: "paid", address: "0x742d...5b8c", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "PL002", amount: "1000", token: "3DOT", description: "Product Order #ORD-4521", status: "paid", address: "0x742d...5b8c", createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "PL003", amount: "50", token: "USDT", description: "Service subscription - Monthly", status: "pending", address: "0x742d...5b8c", createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "PL004", amount: "500", token: "3DOT", description: "Consulting fee", status: "paid", address: "0x742d...5b8c", createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "PL005", amount: "200", token: "USDC", description: "License renewal", status: "expired", address: "0x742d...5b8c", createdAt: new Date(Date.now() - 604800000).toISOString() },
    ];
    setLinks(mockLinks);

    setStats({
      totalReceived: 12500,
      todayReceived: 1300,
      totalPayments: 156,
      todayPayments: 12,
      avgPayment: 80.13,
    });

    setTransactions([
      { hash: "0xabc1...def1", from: "0x1234...5678", amount: "250", token: "3DOT", status: "confirmed", time: "2 min ago" },
      { hash: "0xabc2...def2", from: "0x9876...5432", amount: "100", token: "USDT", status: "confirmed", time: "15 min ago" },
      { hash: "0xabc3...def3", from: "0xaaaa...bbbb", amount: "500", token: "3DOT", status: "pending", time: "1 hour ago" },
      { hash: "0xabc4...def4", from: "0xcccc...dddd", amount: "50", token: "USDC", status: "confirmed", time: "3 hours ago" },
      { hash: "0xabc5...def5", from: "0x1111...2222", amount: "200", token: "3DOT", status: "confirmed", time: "Yesterday" },
    ]);
  }, [address]);

  // Create payment link
  const handleCreateLink = async () => {
    if (!amount || !settings.walletAddress) return;
    setCreating(true);

    // In production: POST to API to create payment link
    const newLink: PaymentLink = {
      id: `PL${String(links.length + 1).padStart(3, "0")}`,
      amount,
      token,
      description: description || "Payment",
      status: "pending",
      address: settings.walletAddress,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setLinks(prev => [newLink, ...prev]);
      setAmount("");
      setDescription("");
      setCreating(false);
      setTab("links");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#070b11]">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg">💳</div>
            <div>
              <h1 className="text-lg font-bold text-white">3Dot Pay</h1>
              <p className="text-[10px] text-gray-500">Merchant payment gateway — Accept crypto payments</p>
            </div>
          </div>
          {address && (
            <div className="text-right">
              <div className="text-xs text-white">{address.slice(0, 6)}...{address.slice(-4)}</div>
              {settings.businessName && <div className="text-[10px] text-gray-500">{settings.businessName}</div>}
            </div>
          )}
        </div>

        {!address ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">💳</div>
            <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-gray-500 mb-4">Connect MetaMask to set up your merchant payment gateway</p>
            <button onClick={connect} disabled={connecting} className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all">
              {connecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#111827] rounded-lg p-1">
              {(["dashboard", "create", "links", "settings"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                    tab === t ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t === "dashboard" ? "📊 Dashboard" : t === "create" ? "➕ Create Link" : t === "links" ? "🔗 My Links" : "⚙️ Settings"}
                </button>
              ))}
            </div>

            {/* Dashboard */}
            {tab === "dashboard" && (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Received", value: `$${stats.totalReceived.toLocaleString()}`, icon: "💰" },
                    { label: "Today", value: `$${stats.todayReceived.toLocaleString()}`, icon: "📈" },
                    { label: "Total Payments", value: stats.totalPayments.toString(), icon: "📊" },
                    { label: "Avg Payment", value: `$${stats.avgPayment.toFixed(2)}`, icon: "📋" },
                  ].map((stat) => (
                    <div key={stat.label} className="card p-4">
                      <div className="text-lg mb-1">{stat.icon}</div>
                      <div className="text-[10px] text-gray-500">{stat.label}</div>
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Transactions */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
                  <div className="space-y-2">
                    {transactions.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${tx.status === "confirmed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                            {tx.status === "confirmed" ? "✓" : "⏳"}
                          </div>
                          <div>
                            <div className="text-xs text-white">{tx.amount} {tx.token}</div>
                            <div className="text-[10px] text-gray-500">From {tx.from}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{tx.time}</div>
                          <div className={`text-[10px] ${tx.status === "confirmed" ? "text-green-400" : "text-yellow-400"}`}>{tx.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Create Payment Link */}
            {tab === "create" && (
              <div className="card p-5 max-w-lg">
                <h3 className="text-sm font-semibold mb-4">Create Payment Link</h3>

                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                    />
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white"
                    >
                      {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Invoice #1234"
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Receiving Wallet</label>
                  <div className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-xs text-gray-400 font-mono">
                    {settings.walletAddress || "Connect wallet first"}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Accepted Tokens</label>
                  <div className="flex flex-wrap gap-2">
                    {TOKENS.map(t => (
                      <button
                        key={t.symbol}
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            acceptedTokens: prev.acceptedTokens.includes(t.symbol)
                              ? prev.acceptedTokens.filter(s => s !== t.symbol)
                              : [...prev.acceptedTokens, t.symbol],
                          }));
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${
                          settings.acceptedTokens.includes(t.symbol)
                            ? "border-blue-500/30 text-blue-400 bg-blue-500/10"
                            : "border-white/5 text-gray-500"
                        }`}
                      >
                        {t.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateLink}
                  disabled={!amount || creating}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Payment Link"}
                </button>
              </div>
            )}

            {/* My Links */}
            {tab === "links" && (
              <div className="space-y-3">
                {links.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">No payment links yet</div>
                ) : links.map((link) => (
                  <div key={link.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          link.status === "paid" ? "bg-green-500/10 text-green-400" :
                          link.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {link.status === "paid" ? "✓" : link.status === "pending" ? "⏳" : "✕"}
                        </div>
                        <div>
                          <div className="text-sm text-white">{link.amount} {link.token}</div>
                          <div className="text-[10px] text-gray-500">{link.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          link.status === "paid" ? "bg-green-500/10 text-green-400" :
                          link.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>{link.status}</span>
                        <div className="text-[10px] text-gray-500 mt-1">{new Date(link.createdAt).toLocaleDateString()}</div>
                      </div>
                      {link.status === "pending" && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(`https://3dotpay.thedotprotocol.com/pay/${link.id}`); }}
                          className="ml-3 px-2 py-1 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          📋 Copy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Settings */}
            {tab === "settings" && (
              <div className="card p-5 max-w-lg">
                <h3 className="text-sm font-semibold mb-4">Merchant Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Business Name</label>
                    <input
                      type="text"
                      value={settings.businessName}
                      onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your Business Name"
                      className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Receiving Wallet</label>
                    <input
                      type="text"
                      value={settings.walletAddress}
                      onChange={(e) => setSettings(prev => ({ ...prev, walletAddress: e.target.value }))}
                      placeholder="0x..."
                      className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Webhook URL (optional)</label>
                    <input
                      type="text"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://your-server.com/webhook"
                      className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>
                  <button className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
