"use client";

import { useState } from "react";
import Image from "next/image";
import Portfolio from "@/components/Portfolio";
import TransactionList from "@/components/TransactionList";
import SendReceive from "@/components/SendReceive";
import PayWithCrypto from "@/components/PayWithCrypto";

type Tab = "portfolio" | "send" | "receive" | "pay" | "history";

const NAV_ITEMS: { icon: string; label: string; tab: Tab; badge?: string }[] = [
  { icon: "💰", label: "Portfolio", tab: "portfolio" },
  { icon: "📤", label: "Send", tab: "send" },
  { icon: "📥", label: "Receive", tab: "receive" },
  { icon: "💳", label: "3Dot Pay", tab: "pay", badge: "NEW" },
  { icon: "📋", label: "History", tab: "history" },
];

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("portfolio");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0e17] border-r border-white/5 p-4 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-orange-500/20">
            3D
          </div>
          <div>
            <div className="text-sm font-bold">3Dot Wallet</div>
            <div className="text-[10px] text-gray-500">Dot Protocol</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                tab === item.tab
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-gray-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Network */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Connected</span>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-sm border border-orange-500/20">
              🦊
            </div>
            <div>
              <div className="text-xs font-mono text-gray-300">0xAA0b...9694</div>
              <div className="text-[10px] text-gray-600">Dot Protocol Mainnet</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {tab === "portfolio" && <Portfolio />}
        {tab === "send" && <SendReceive mode="send" />}
        {tab === "receive" && <SendReceive mode="receive" />}
        {tab === "pay" && <PayWithCrypto />}
        {tab === "history" && <TransactionList />}
      </main>
    </div>
  );
}
