'use client';

import Link from 'next/link';
import { PRESALE_CONFIG } from '@/config/presale';

export default function TokenOverview() {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-300 to-primary bg-clip-text text-transparent mb-4">
            About DPC20
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            DPC20 is Dot Protocol&apos;s native token standard — QBFT Proof of Authority with{' '}
            {PRESALE_CONFIG.totalSupply} total supply. Powers DeFi, NFTs, cross-chain bridges,
            and ecosystem growth on Chennai testnet and mainnet.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Standard', value: 'DPC20' },
              { label: 'Consensus', value: 'PoA + QBFT' },
              { label: 'Total Supply', value: PRESALE_CONFIG.totalSupply },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-dark-300/40 border border-white/5 py-4">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          <Link
            href={`${PRESALE_CONFIG.websiteUrl}/dpc20`}
            className="inline-flex items-center gap-2 border border-primary/50 text-primary hover:bg-primary/10 px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            View Full Tokenomics →
          </Link>
        </div>
      </div>
    </section>
  );
}
