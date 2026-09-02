"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { HEX_ADDRESSES, ROUTER_ABI, ERC20_ABI } from "@/config/contracts";

const TOKENS = [
  { symbol: "3DOT", name: "3DOT", icon: "🔴", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", decimals: 18 },
  { symbol: "USDT", name: "Tether USD", icon: "🟢", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "USDC", name: "USD Coin", icon: "🔵", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "TDOT", name: "Test DOT", icon: "🟡", address: "0x542E95FD423962505EBfb279C1361351507A0185", decimals: 18 },
];

export default function SwapCard() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapping, setSwapping] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

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

  // Get quote from router
  const getQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      return;
    }

    setQuoteLoading(true);
    try {
      const chainId = await getChainId();
      const addrs = HEX_ADDRESSES[chainId as keyof typeof HEX_ADDRESSES] || HEX_ADDRESSES[1546];
      const provider = getProvider();
      if (!provider) return;

      const router = new ethers.Contract(addrs.Router, ROUTER_ABI, provider);
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals);
      const path = [fromToken.address, toToken.address];

      try {
        const amounts = await router.getAmountsOut(amountIn, path);
        const out = ethers.formatUnits(amounts[1], toToken.decimals);
        setToAmount(parseFloat(out).toFixed(6));
      } catch {
        // Pair might not exist yet — show estimated
        setToAmount((parseFloat(fromAmount) * 0.99).toFixed(6));
      }
    } catch {
      setToAmount((parseFloat(fromAmount) * 0.99).toFixed(6));
    } finally {
      setQuoteLoading(false);
    }
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => {
    const timer = setTimeout(getQuote, 500);
    return () => clearTimeout(timer);
  }, [getQuote]);

  const handleSwap = async () => {
    const signer = await getSigner();
    if (!signer || !fromAmount || !toAmount) return;

    setSwapping(true);
    try {
      const chainId = await getChainId();
      const addrs = HEX_ADDRESSES[chainId as keyof typeof HEX_ADDRESSES] || HEX_ADDRESSES[1546];

      // Approve router to spend fromToken
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals);
      const allowance = await tokenContract.allowance(await signer.getAddress(), addrs.Router);

      if (allowance < amountIn) {
        const approveTx = await tokenContract.approve(addrs.Router, amountIn);
        await approveTx.wait();
      }

      // Swap
      const router = new ethers.Contract(addrs.Router, ROUTER_ABI, signer);
      const amountOutMin = ethers.parseUnits(
        (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(toToken.decimals),
        toToken.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [fromToken.address, toToken.address],
        await signer.getAddress(),
        deadline
      );
      await tx.wait();
      alert("Swap successful!");
      setFromAmount("");
      setToAmount("");
    } catch (err: any) {
      console.error(err);
      alert(`Swap failed: ${err.reason || err.message}`);
    } finally {
      setSwapping(false);
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Swap</h2>
        <button className="text-gray-400 hover:text-white">⚙️</button>
      </div>

      {/* From */}
      <div className="bg-[#1f2937] rounded-xl p-4 mb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">You Pay</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-2xl font-medium outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button className="flex items-center gap-2 bg-[#374151] hover:bg-[#4b5563] px-3 py-2 rounded-lg font-medium transition-colors shrink-0">
            <span>{fromToken.icon}</span>
            <span>{fromToken.symbol}</span>
            <span>▼</span>
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button onClick={handleSwapTokens} className="bg-[#374151] hover:bg-[#4b5563] p-2 rounded-lg transition-colors">⇅</button>
      </div>

      {/* To */}
      <div className="bg-[#1f2937] rounded-xl p-4 mt-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">You Receive</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={quoteLoading ? "Loading..." : toAmount}
            readOnly
            placeholder="0.0"
            className="bg-transparent text-2xl font-medium outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-300"
          />
          <button className="flex items-center gap-2 bg-[#374151] hover:bg-[#4b5563] px-3 py-2 rounded-lg font-medium transition-colors shrink-0">
            <span>{toToken.icon}</span>
            <span>{toToken.symbol}</span>
            <span>▼</span>
          </button>
        </div>
      </div>

      {/* Slippage */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-gray-400">Slippage:</span>
        {[0.1, 0.5, 1.0].map((s) => (
          <button
            key={s}
            onClick={() => setSlippage(s)}
            className={`px-3 py-1 rounded-md text-xs ${slippage === s ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-gray-800 text-gray-400"}`}
          >
            {s}%
          </button>
        ))}
      </div>

      {/* Rate Info */}
      {fromAmount && toAmount && (
        <div className="bg-[#1f2937] rounded-lg p-3 mb-4 text-sm space-y-1">
          <div className="flex justify-between text-gray-400">
            <span>Rate</span>
            <span>1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Min. Received</span>
            <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(4)} {toToken.symbol}</span>
          </div>
        </div>
      )}

      <button onClick={handleSwap} disabled={swapping || !fromAmount} className="btn-primary text-lg disabled:opacity-50">
        {swapping ? "Swapping..." : !fromAmount ? "Enter Amount" : "Swap"}
      </button>
    </div>
  );
}
