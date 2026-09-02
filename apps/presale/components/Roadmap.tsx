'use client';

const ROADMAP = [
  { quarter: 'Q1 2025', title: 'Launch MVP', items: ['Basic hybrid CEX/DEX', '3DOT Wallet integration', 'Initial liquidity pools'], status: 'active' },
  { quarter: 'Q2 2025', title: 'Feature Expansion', items: ['Advanced order types', 'P2P marketplace', 'Mobile app beta'], status: 'upcoming' },
  { quarter: 'Q3 2025', title: 'Scale & Partnerships', items: ['Global partnerships', 'Enhanced UI/UX', 'Cross-chain bridges'], status: 'upcoming' },
  { quarter: 'Q4 2025', title: 'Full Rollout', items: ['Complete escrow system', 'Mobile app launch', 'Global expansion'], status: 'upcoming' },
];

export default function Roadmap() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-8">Roadmap</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ROADMAP.map((phase) => (
          <div key={phase.quarter} className={`card p-5 ${phase.status === 'active' ? 'border-orange-500/30' : ''}`}>
            <div className={`text-sm font-medium mb-2 ${phase.status === 'active' ? 'text-orange-400' : 'text-gray-400'}`}>
              {phase.quarter}
            </div>
            <h3 className="font-semibold mb-3">{phase.title}</h3>
            <ul className="space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${phase.status === 'active' ? 'bg-orange-500' : 'bg-gray-600'}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
