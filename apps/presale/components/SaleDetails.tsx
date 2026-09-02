'use client';

export default function SaleDetails() {
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Sale Progress</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Total Raised</span>
            <span className="font-medium">$2,450,000 / $5,000,000</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full" style={{ width: '49%' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Sold" value="245,000,000" sub="3DOT" />
          <StatCard label="Total Buyers" value="1,247" sub="participants" />
          <StatCard label="Token Price" value="$0.01" sub="at launch" />
          <StatCard label="Market Cap" value="$10M" sub="at launch" />
        </div>
      </div>

      {/* Tokenomics */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Tokenomics</h2>
        <div className="space-y-3">
          <TokenomicsRow name="Presale" percent={40} color="bg-orange-500" />
          <TokenomicsRow name="Liquidity" percent={25} color="bg-blue-500" />
          <TokenomicsRow name="Team & Advisors" percent={15} color="bg-purple-500" />
          <TokenomicsRow name="Marketing" percent={10} color="bg-green-500" />
          <TokenomicsRow name="Ecosystem Fund" percent={10} color="bg-yellow-500" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Key Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Network</span><span>Dot Protocol Mainnet</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Token Standard</span><span>DPC20 v1</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Total Supply</span><span>1,000,000,000,000</span></div>
          <div className="flex justify-between"><span className="text-gray-400">TGE Unlock</span><span>20%</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Vesting</span><span>6 months linear</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Chain ID</span><span>1546</span></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#1f2937] rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}

function TokenomicsRow({ name, percent, color }: { name: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{name}</span>
        <span className="text-gray-400">{percent}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
