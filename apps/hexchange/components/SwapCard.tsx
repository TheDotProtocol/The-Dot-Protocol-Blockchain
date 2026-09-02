"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { HEX_ADDRESSES, ROUTER_ABI, ERC20_ABI } from "@/config/contracts";

const TOKENS = [
  { symbol: "3DOT", name: "Dot Protocol Coin", icon: "🔴", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", decimals: 18, color: "from-red-500 to-orange-500" },
  { symbol: "USDT", name: "Mock Tether USD", icon: "🟢", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", decimals: 6, color: "from-green-500 to-emerald-500" },
  { symbol: "BTC", name: "Mock Bitcoin", icon: "🔵", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", decimals: 8, color: "from-blue-500 to-cyan-500" },
  { symbol: "BNB", name: "Mock BNB", icon: "🟣", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", decimals: 18, color: "from-yellow-500 to-amber-500" },
  { symbol: "TDOT", name: "Test DOT", icon: "🟡", address: "0x542E95FD423962505EBfb279C1361351507A0185", decimals: 18, color: "from-yellow-400 to-orange-400" },
];

function TokenSelector({ selected, onSelect, label }: { selected: typeof TOKENS[0]; onSelect: (t: typeof TOKENS[0]) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#2a2f3a] hover:bg-[#374151] px-4 py-3 rounded-xl font-semibold transition-all shrink-0 border border-gray-700/50 hover:border-orange-500/30"
      >
        <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center text-sm`}>
          {selected.icon}
        </span>
        <span className="text-white">{selected.symbol}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1f2937] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 text-xs text-gray-500 uppercase tracking-wider px-3 pt-3">{label}</div>
          {TOKENS.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#374151] transition-colors ${selected.symbol === token.symbol ? "bg-orange-500/10" : ""}`}
            >
              <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-xs`}>
                {token.icon}
              </span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">{token.symbol}</div>
                <div className="text-xs text-gray-500">{token.name}</div>
              </div>
              {selected.symbol === token.symbol && <span className="ml-auto text-orange-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SwapCard() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapping, setSwapping] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getProvider = () => {
    if (!(window as any)?.ethereum) return null;
    return new ethers.BrowserProvider((window as any).ethereum);
  };

  const getSigner = async () => {
    const provider = getProvider();
    if (!provider) return null;
    return provider.getSigner();
  };

  const getChainId = async (): Promise<number> => {
    const provider = getProvider();
    if (!provider) return 0;
    const net = await provider.getNetwork();
    return Number(net.chainId);
  };

  const getQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) { setToAmount(""); return; }
    setQuoteLoading(true);
    try {
      const chainId = await getChainId();
      const addrs = HEX_ADDRESSES[chainId as keyof typeof HEX_ADDRESSES] || HEX_ADDRESSES[1546];
      const provider = getProvider();
      if (!provider) return;
      const router = new ethers.Contract(addrs.Router, ROUTER_ABI, provider);
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals);
      try {
        const amounts = await router.getAmountsOut(amountIn, [fromToken.address, toToken.address]);
        setToAmount(parseFloat(ethers.formatUnits(amounts[1], toToken.decimals)).toFixed(6));
      } catch { setToAmount((parseFloat(fromAmount) * 0.99).toFixed(6)); }
    } catch { setToAmount((parseFloat(fromAmount) * 0.99).toFixed(6)); }
    finally { setQuoteLoading(false); }
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => { const t = setTimeout(getQuote, 500); return () => clearTimeout(t); }, [getQuote]);

  const handleSwap = async () => {
    const signer = await getSigner();
    if (!signer || !fromAmount || !toAmount) return;
    setSwapping(true);
    try {
      const chainId = await getChainId();
      const addrs = HEX_ADDRESSES[chainId as keyof typeof HEX_ADDRESSES] || HEX_ADDRESSES[1546];
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals);
      const allowance = await tokenContract.allowance(await signer.getAddress(), addrs.Router);
      if (allowance < amountIn) {
        const approveTx = await tokenContract.approve(addrs.Router, amountIn);
        await approveTx.wait();
      }
      const router = new ethers.Contract(addrs.Router, ROUTER_ABI, signer);
      const amountOutMin = ethers.parseUnits((parseFloat(toAmount) * (1 - slippage / 100)).toFixed(toToken.decimals), toToken.decimals);
      const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, [fromToken.address, toToken.address], await signer.getAddress(), Math.floor(Date.now() / 1000) + 1200);
      await tx.wait();
      setFromAmount(""); setToAmount("");
    } catch (err: any) { console.error(err); }
    finally { setSwapping(false); }
  };

  const handleSwapTokens = () => { const t = fromToken; setFromToken(toToken); setToToken(t); setFromAmount(toAmount); setToAmount(fromAmount); };

  const priceImpact = fromAmount && toAmount && parseFloat(fromAmount) > 0 ? ((1 - parseFloat(toAmount) / parseFloat(fromAmount)) * 100).toFixed(2) : "0";
  const rate = fromAmount && toAmount && parseFloat(fromAmount) > 0 ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) : "—";

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Swap</h2>
          <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">AMM</span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-orange-500/20 text-orange-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>

      {/* Slippage Settings (collapsible) */}
      {showSettings && (
        <div className="px-6 py-3 bg-[#0d1117] border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Slippage Tolerance</span>
            <div className="flex gap-1.5">
              {[0.1, 0.5, 1.0].map((s) => (
                <button key={s} onClick={() => setSlippage(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${slippage === s ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {s}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-0">
        {/* From */}
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-gray-800/50 focus-within:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">You Pay</span>
          </div>
          <div className="flex items-end gap-3">
            <input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0" className="bg-transparent text-3xl font-bold outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white placeholder-gray-600" />
            <TokenSelector selected={fromToken} onSelect={setFromToken} label="Select token to pay" />
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <button onClick={handleSwapTokens}
            className="bg-[#2a2f3a] hover:bg-[#374151] p-2.5 rounded-xl transition-all border-4 border-[#0a0e17] hover:rotate-180 duration-300 group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">You Receive</span>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold w-full min-h-[40px] flex items-center">
              {quoteLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-gray-600">Loading...</span>
                </div>
              ) : (
                <span className={toAmount ? "text-white" : "text-gray-600"}>{toAmount || "0.0"}</span>
              )}
            </div>
            <TokenSelector selected={toToken} onSelect={setToToken} label="Select token to receive" />
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {fromAmount && toAmount && parseFloat(fromAmount) > 0 && (
        <div className="px-6 pb-4 space-y-2">
          <div className="bg-[#0d1117] rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rate</span>
              <span className="text-gray-300">1 {fromToken.symbol} = {rate} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price Impact</span>
              <span className={`${parseFloat(priceImpact) > 5 ? "text-red-400" : parseFloat(priceImpact) > 1 ? "text-yellow-400" : "text-green-400"}`}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Minimum Received</span>
              <span className="text-gray-300">{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Slippage Tolerance</span>
              <span className="text-gray-300">{slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network Fee</span>
              <span className="text-gray-300">~0.001 3DOT</span>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <div className="px-6 pb-6">
        <button onClick={handleSwap} disabled={swapping || !fromAmount}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            swapping ? "bg-orange-600 cursor-wait" : !fromAmount ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98]"
          }`}>
          {swapping ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Swapping...
            </span>
          ) : !fromAmount ? "Enter Amount" : "Swap"}
        </button>
      </div>
    </div>
  );
}
