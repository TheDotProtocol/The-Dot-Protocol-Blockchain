"use client";

import SwapCard from "@/components/SwapCard";
import OrderBook from "@/components/OrderBook";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          Trade on <span className="text-orange-500">Hexchange</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Decentralized token swaps on Dot Protocol. Low fees, instant settlement, full self-custody.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SwapCard />
        </div>
        <div className="lg:col-span-1">
          <OrderBook />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: "$2.4M", change: "+12.5%", up: true },
          { label: "Liquidity", value: "$5.2M", change: "+8.3%", up: true },
          { label: "24h Trades", value: "1,247", change: "-2.1%", up: false },
          { label: "Pairs", value: "4", change: "", up: true },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            {stat.change && (
              <div className={`text-xs mt-1 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
