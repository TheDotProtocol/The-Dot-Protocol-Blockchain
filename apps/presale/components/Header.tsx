'use client';

import Link from 'next/link';
import { PRESALE_CONFIG } from '@/config/presale';
import { truncateAddress } from '@/lib/wallet';

type HeaderProps = {
  address: string | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

export default function Header({
  address,
  isConnecting,
  isCorrectNetwork,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0e0f12]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-white">
              DP
            </span>
            <span className="font-semibold text-white hidden sm:inline">DPC20 Presale</span>
          </Link>
          <Link
            href={PRESALE_CONFIG.websiteUrl}
            className="text-sm text-zinc-400 hover:text-primary transition-colors hidden md:inline"
          >
            ← Back to Dot Protocol
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {address && (
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                isCorrectNetwork
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-amber-400'}`} />
              {isCorrectNetwork ? 'Chennai Testnet' : 'Wrong Network'}
            </span>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-zinc-300 bg-dark-200 px-3 py-1.5 rounded-lg border border-white/5">
                {truncateAddress(address)}
              </span>
              <button
                onClick={onDisconnect}
                className="text-xs text-zinc-500 hover:text-primary transition-colors px-2"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
