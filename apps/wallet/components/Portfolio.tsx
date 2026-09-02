'use client';

const ASSETS = [
  { symbol: '3DOT', name: '3DOT', balance: '1,000,000,000,000', value: '$10,000,000,000', change: '+2.4%', icon: '🔴', positive: true },
  { symbol: 'TDOT', name: 'Test DOT', balance: '100,000,000', value: '$500,000', change: '-1.2%', icon: '🟡', positive: false },
  { symbol: 'ETH', name: 'Ethereum', balance: '2.5', value: '$6,250', change: '+5.1%', icon: '🔷', positive: true },
  { symbol: 'USDT', name: 'Tether USD', balance: '5,000', value: '$5,000', change: '0.0%', icon: '🟢', positive: true },
  { symbol: 'USDC', name: 'USD Coin', balance: '3,000', value: '$3,000', change: '+0.1%', icon: '🔵', positive: true },
];

export default function Portfolio() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {/* Total Balance */}
      <div className="card p-6 mb-6">
        <div className="text-sm text-gray-400 mb-1">Total Balance</div>
        <div className="text-4xl font-bold mb-2">$10,004,756,250</div>
        <div className="text-green-400 text-sm">+$234,500 (+2.4%) today</div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <QuickAction icon="📤" label="Send" />
        <QuickAction icon="📥" label="Receive" />
        <QuickAction icon="🔄" label="Swap" />
        <QuickAction icon="💳" label="3Dot Pay" />
      </div>

      {/* Assets */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-semibold">Assets</h2>
        </div>
        <div>
          {ASSETS.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between p-4 hover:bg-gray-800/30 cursor-pointer transition-colors border-b border-gray-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">{asset.icon}</div>
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-sm text-gray-500">{asset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{asset.balance}</div>
                <div className="text-sm text-gray-500">{asset.value}</div>
              </div>
              <div className={`text-sm font-medium w-16 text-right ${asset.positive ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="card p-4 flex flex-col items-center gap-2 hover:bg-gray-800/30 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </button>
  );
}
