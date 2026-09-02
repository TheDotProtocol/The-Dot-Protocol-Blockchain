"use client";

import { useState } from "react";
import Image from "next/image";
import SwapCard from "@/components/SwapCard";
import OrderBook from "@/components/OrderBook";

export default function Home() {
  const [mode, setMode] = useState<"dex" | "cex">("dex");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="/logos/hexchange-logo-dark.png"
            alt="Hexchange"
            width={200}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </div>
        <p className="text-gray-400 max-w-lg mx-auto text-sm">
          The World&apos;s First True Hybrid Crypto Exchange — seamlessly switch between
          centralized and decentralized trading on Dot Protocol.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setMode("dex")}
          className={`trade-tab ${mode === "dex" ? "active" : ""}`}
        >
          <span className="mr-1">🔗</span> DEX Mode
        </button>
        <div className="w-px h-5 bg-white/10" />
        <button
          onClick={() => setMode("cex")}
          className={`trade-tab ${mode === "cex" ? "active" : ""}`}
        >
          <span className="mr-1">🏦</span> CEX Mode
        </button>
      </div>

      {/* Mode Description */}
      <div className="text-center">
        {mode === "dex" ? (
          <p className="text-xs text-green-400/80">
            Non-custodial — You control your keys, you control your funds
          </p>
        ) : (
          <p className="text-xs text-blue-400/80">
            Custodial — Fast trades, instant liquidity, managed by Hexchange
          </p>
        )}
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            {/* Trading header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {mode === "dex" ? "Swap" : "Trade"}
                </h2>
                <span className={`mode-badge ${mode === "dex" ? "mode-dex" : "mode-cex"}`}>
                  {mode === "dex" ? "DEX" : "CEX"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
            <SwapCard />
          </div>
        </div>
        <div className="lg:col-span-1">
          <OrderBook />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="card p-5">
          <div className="text-2xl mb-2">🔄</div>
          <h3 className="font-semibold text-sm mb-1">Hybrid Trading</h3>
          <p className="text-xs text-gray-500">
            Switch seamlessly between CEX speed and DEX control. Same platform, your choice.
          </p>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">🤝</div>
          <h3 className="font-semibold text-sm mb-1">P2P Marketplace</h3>
          <p className="text-xs text-gray-500">
            Trade directly with peers using escrow smart contracts. Crypto-to-crypto and fiat-to-crypto.
          </p>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">💎</div>
          <h3 className="font-semibold text-sm mb-1">3DOT Rewards</h3>
          <p className="text-xs text-gray-500">
            Earn 3DOT for liquidity provision, trading, and governance participation.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Volume", value: "$2.4M", change: "+12.5%", up: true },
          { label: "Liquidity", value: "$5.2M", change: "+8.3%", up: true },
          { label: "24h Trades", value: "1,247", change: "-2.1%", up: false },
          { label: "Pairs", value: "6", change: "", up: true },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
            {stat.change && (
              <div className={`text-[10px] mt-1 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
