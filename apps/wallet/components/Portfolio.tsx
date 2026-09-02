"use client";

const ASSETS = [
  { symbol: "3DOT", name: "Dot Protocol Coin", balance: "12,450.00", value: "$124.50", change: "+5.2%", color: "from-orange-500 to-orange-600", positive: true },
  { symbol: "USDT", name: "Tether USD", balance: "2,300.00", value: "$2,300.00", change: "+0.1%", color: "from-green-500 to-green-600", positive: true },
  { symbol: "BTC", name: "Bitcoin", balance: "0.045", value: "$2,925.00", change: "+2.8%", color: "from-yellow-500 to-yellow-600", positive: true },
  { symbol: "BNB", name: "BNB Chain", balance: "8.5", value: "$2,550.00", change: "-1.2%", color: "from-yellow-400 to-yellow-500", positive: false },
  { symbol: "USDC", name: "USD Coin", balance: "1,100.00", value: "$1,100.00", change: "0.0%", color: "from-blue-500 to-blue-600", positive: true },
  { symbol: "XRP", name: "Ripple", balance: "5,200", value: "$2,600.00", change: "+3.1%", color: "from-gray-400 to-gray-500", positive: true },
];

export default function Portfolio() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {/* Total Balance */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-[#111827] to-[#0d1117]">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Balance</div>
        <div className="text-4xl font-bold mb-2">$11,599.50</div>
        <div className="text-sm text-green-400">+$312.40 (+2.76%) today</div>
        <div className="flex gap-3 mt-4">
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">24h High:</span> $11,890.00
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">24h Low:</span> $11,200.00
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: "📤", label: "Send", desc: "Transfer crypto" },
          { icon: "📥", label: "Receive", desc: "Get address" },
          { icon: "🔄", label: "Swap", desc: "Exchange tokens", href: "http://localhost:3005" },
          { icon: "💳", label: "3Dot Pay", desc: "Pay merchants" },
        ].map((action) => (
          <button
            key={action.label}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-white/[0.03] transition-all hover:border-white/10"
            onClick={() => action.href && window.open(action.href, "_blank")}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
            <span className="text-[10px] text-gray-600">{action.desc}</span>
          </button>
        ))}
      </div>

      {/* Assets */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Assets</h2>
          <span className="text-[10px] text-gray-500">{ASSETS.length} tokens</span>
        </div>
        <div>
          {ASSETS.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] cursor-pointer transition-colors border-b border-white/[0.03] last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${asset.color} flex items-center justify-center text-sm font-bold shadow-lg`}>
                  {asset.symbol[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{asset.symbol}</div>
                  <div className="text-xs text-gray-500">{asset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{asset.balance}</div>
                <div className="text-xs text-gray-500">{asset.value}</div>
              </div>
              <div className={`text-xs font-medium w-16 text-right ${asset.positive ? "text-green-400" : "text-red-400"}`}>
                {asset.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
