"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

const TOKENS = [
  { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", decimals: 18, color: "#f97316", icon: "🟠" },
  { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", decimals: 18, color: "#26a17b", icon: "🟢" },
  { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", decimals: 18, color: "#f7931a", icon: "🟤" },
  { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", decimals: 18, color: "#f3ba2f", icon: "🟡" },
  { symbol: "USDC", address: "0x7b7cAa5D76e3877e91D4B80d4Bb8C27e0b30e713", decimals: 18, color: "#2775ca", icon: "🔵" },
  { symbol: "XRP", address: "0x3e1E51a4fC8e83A8e6e5eC4F2e4C9C4B0e5e8F7a", decimals: 18, color: "#00aae4", icon: "💎" },
];

const CHAIN_NAMES: Record<number, string> = {
  1545: "Chennai Testnet (TDOT)",
  1546: "Dot Protocol Mainnet (3DOT)",
  1: "Ethereum Mainnet",
  11155111: "Ethereum Sepolia",
  56: "BSC Mainnet",
  97: "BSC Testnet",
  137: "Polygon Mainnet",
  80002: "Polygon Amoy",
};

type Tab = "portfolio" | "send" | "receive" | "history" | "pay";

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(0);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [nativeBalance, setNativeBalance] = useState("0");
  const [tokenBalances, setTokenBalances] = useState<{ symbol: string; balance: string; usd: number; color: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsd, setTotalUsd] = useState(0);

  // Send form
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendToken, setSendToken] = useState(TOKENS[0]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Transaction history
  const [txHistory, setTxHistory] = useState<any[]>([]);

  // Fake prices (in production: use oracle/DEX price feed)
  const PRICES: Record<string, number> = { "3DOT": 1.0, "USDT": 1.0, "BTC": 60000, "BNB": 580, "USDC": 1.0, "XRP": 0.55 };

  const connect = async () => {
    if (!(window as any).ethereum) {
      alert("Please install MetaMask to use 3Dot Wallet");
      return;
    }
    setLoading(true);
    try {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      const net = await p.getNetwork();

      setProvider(p);
      setSigner(s);
      setAddress(addr);
      setChainId(Number(net.chainId));

      // Fetch native balance
      const bal = await p.getBalance(addr);
      setNativeBalance(ethers.formatEther(bal));
    } catch (e: any) {
      console.error("Connection error:", e);
    }
    setLoading(false);
  };

  // Fetch all token balances
  const fetchBalances = useCallback(async () => {
    if (!provider || !address) return;
    setLoading(true);
    const balances: typeof tokenBalances = [];
    let total = 0;

    for (const token of TOKENS) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const bal = await contract.balanceOf(address);
        const formatted = ethers.formatUnits(bal, token.decimals);
        const usd = parseFloat(formatted) * (PRICES[token.symbol] || 0);
        total += usd;
        balances.push({
          symbol: token.symbol,
          balance: formatted,
          usd,
          color: token.color,
          icon: token.icon,
        });
      } catch {
        balances.push({ symbol: token.symbol, balance: "0", usd: 0, color: token.color, icon: token.icon });
      }
    }
    setTokenBalances(balances);
    total += parseFloat(nativeBalance) * (chainId === 1546 ? 1 : 0);
    setTotalUsd(total);
    setLoading(false);
  }, [provider, address, chainId, nativeBalance]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  // Auto-refresh balances
  useEffect(() => {
    if (!provider || !address) return;
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [provider, address, fetchBalances]);

  // Send tokens
  const handleSend = async () => {
    if (!signer || !sendTo || !sendAmount) return;
    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      if (!ethers.isAddress(sendTo)) {
        setSendError("Invalid address");
        setSending(false);
        return;
      }

      const amountWei = ethers.parseUnits(sendAmount, 18);

      // Check balance
      const bal = tokenBalances.find(b => b.symbol === sendToken.symbol);
      if (bal && parseFloat(bal.balance) < parseFloat(sendAmount)) {
        setSendError("Insufficient balance");
        setSending(false);
        return;
      }

      const contract = new ethers.Contract(sendToken.address, ERC20_ABI, signer);
      const tx = await contract.transfer(sendTo, amountWei);

      setSendSuccess(`Transaction sent! Hash: ${tx.hash.slice(0, 20)}...`);
      setTxHistory(prev => [{
        hash: tx.hash,
        to: sendTo,
        amount: sendAmount,
        token: sendToken.symbol,
        status: "pending",
        timestamp: new Date().toISOString(),
      }, ...prev]);

      await tx.wait();
      setSendSuccess(`Confirmed! Tx: ${tx.hash.slice(0, 20)}...`);
      setTxHistory(prev => prev.map(tx => tx.hash === tx.hash ? { ...tx, status: "confirmed" } : tx));
      fetchBalances();
      setSendTo("");
      setSendAmount("");
    } catch (e: any) {
      setSendError(e.reason || e.message || "Transaction failed");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[#070b11]">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🦊</div>
            <div>
              <h1 className="text-lg font-bold text-white">3Dot Wallet</h1>
              <p className="text-[10px] text-gray-500">Your multi-chain crypto wallet</p>
            </div>
          </div>
          {address && (
            <div className="text-right">
              <div className="text-xs text-white">{address.slice(0, 6)}...{address.slice(-4)}</div>
              <div className="text-[10px] text-gray-500">{CHAIN_NAMES[chainId] || `Chain ${chainId}`}</div>
            </div>
          )}
        </div>

        {/* Connect / Balance Card */}
        {!address ? (
          <div className="card p-8 text-center mb-6">
            <div className="text-4xl mb-4">🦊</div>
            <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-gray-500 mb-4">Connect MetaMask to manage your 3DOT ecosystem tokens</p>
            <button
              onClick={connect}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
            >
              {loading ? "Connecting..." : "Connect MetaMask"}
            </button>
          </div>
        ) : (
          <>
            {/* Total Balance */}
            <div className="card p-6 mb-6 text-center">
              <div className="text-xs text-gray-500 mb-1">Total Portfolio Value</div>
              <div className="text-3xl font-bold text-white">${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-gray-500 mt-1">Native: {parseFloat(nativeBalance).toFixed(4)} {chainId === 1546 ? "3DOT" : chainId === 1545 ? "TDOT" : "ETH"}</div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[#111827] rounded-lg p-1">
              {(["portfolio", "send", "receive", "history", "pay"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSendError(""); setSendSuccess(""); }}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                    tab === t ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t === "portfolio" ? "💰 Portfolio" : t === "send" ? "📤 Send" : t === "receive" ? "📥 Receive" : t === "history" ? "📜 History" : "💳 Pay"}
                </button>
              ))}
            </div>

            {/* Portfolio */}
            {tab === "portfolio" && (
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading balances...</div>
                ) : tokenBalances.map((t) => (
                  <div key={t.symbol} className="card p-4 flex items-center justify-between hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: t.color + "20" }}>
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{t.symbol}</div>
                        <div className="text-[10px] text-gray-500">${PRICES[t.symbol]?.toFixed(2) || "0.00"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{parseFloat(t.balance).toFixed(t.symbol === "BTC" ? 8 : 4)}</div>
                      <div className="text-[10px] text-gray-500">${t.usd.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Send */}
            {tab === "send" && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4">Send Tokens</h3>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Token</label>
                  <select
                    value={sendToken.symbol}
                    onChange={(e) => setSendToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white"
                  >
                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol} — Balance: {tokenBalances.find(b => b.symbol === t.symbol)?.balance || "0"}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Recipient Address</label>
                  <input
                    type="text"
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none font-mono"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const bal = tokenBalances.find(b => b.symbol === sendToken.symbol);
                        if (bal) setSendAmount(bal.balance);
                      }}
                      className="px-3 py-2 rounded-lg text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {sendError && <div className="mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{sendError}</div>}
                {sendSuccess && <div className="mb-3 text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{sendSuccess}</div>}

                <button
                  onClick={handleSend}
                  disabled={!sendTo || !sendAmount || sending}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Tokens"}
                </button>
              </div>
            )}

            {/* Receive */}
            {tab === "receive" && (
              <div className="card p-5 text-center">
                <h3 className="text-sm font-semibold mb-4">Receive Tokens</h3>
                <div className="bg-white rounded-xl p-6 mb-4 inline-block">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    QR Code
                  </div>
                </div>
                <div className="mb-2 text-xs text-gray-500">Your Address ({CHAIN_NAMES[chainId] || "Connected Chain"})</div>
                <div className="bg-[#0a0e17] rounded-lg px-4 py-3 text-xs text-white font-mono break-all border border-white/5">
                  {address}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(address); }}
                  className="mt-3 px-4 py-2 rounded-lg text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
                >
                  📋 Copy Address
                </button>
              </div>
            )}

            {/* History */}
            {tab === "history" && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-3">Transaction History</h3>
                {txHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No transactions yet. Send some tokens to get started!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {txHistory.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-white/5">
                        <div>
                          <div className="text-xs text-white">Send {tx.amount} {tx.token}</div>
                          <div className="text-[10px] text-gray-500">To: {tx.to.slice(0, 10)}...</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          tx.status === "confirmed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                        }`}>{tx.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pay with Crypto */}
            {tab === "pay" && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4">💳 Pay with Crypto</h3>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Merchant Address</label>
                  <input type="text" placeholder="0x... or scan QR" className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none font-mono" />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                  <input type="number" placeholder="0.00" className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none" />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Token</label>
                  <select className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white">
                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                  </select>
                </div>
                <button className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all">
                  Send Payment
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
