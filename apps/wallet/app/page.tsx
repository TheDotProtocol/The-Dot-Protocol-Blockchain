'use client';

import { useState } from 'react';
import Portfolio from '@/components/Portfolio';
import TransactionList from '@/components/TransactionList';
import SendReceive from '@/components/SendReceive';
import PayWithCrypto from '@/components/PayWithCrypto';

type Tab = 'portfolio' | 'send' | 'receive' | 'pay' | 'history';

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('portfolio');

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-orange-500">3Dot</span>
          <span className="text-lg">Wallet</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon="💰" label="Portfolio" active={tab === 'portfolio'} onClick={() => setTab('portfolio')} />
          <SidebarItem icon="📤" label="Send" active={tab === 'send'} onClick={() => setTab('send')} />
          <SidebarItem icon="📥" label="Receive" active={tab === 'receive'} onClick={() => setTab('receive')} />
          <SidebarItem icon="💳" label="3Dot Pay" active={tab === 'pay'} onClick={() => setTab('pay')} badge="NEW" />
          <SidebarItem icon="📋" label="History" active={tab === 'history'} onClick={() => setTab('history')} />
        </nav>

        <div className="border-t border-gray-800 pt-4">
          <div className="text-sm text-gray-400 mb-2">Connected</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm">🦊</div>
            <div>
              <div className="text-sm font-medium">0xAA0b...9694</div>
              <div className="text-xs text-gray-500">Dot Protocol Mainnet</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {tab === 'portfolio' && <Portfolio />}
        {tab === 'send' && <SendReceive mode="send" />}
        {tab === 'receive' && <SendReceive mode="receive" />}
        {tab === 'pay' && <PayWithCrypto />}
        {tab === 'history' && <TransactionList />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, badge }: {
  icon: string; label: string; active: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active ? 'bg-orange-500/10 text-orange-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge && <span className="ml-auto bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}
