'use client';

import { motion } from 'framer-motion';
import { PRESALE_CONFIG } from '@/config/presale';

export default function Hero() {
  return (
    <section className="pt-12 pb-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-500/15 text-green-400 border border-green-500/30">
              Live Now
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
              Private Whitelist
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 text-zinc-400 border border-white/10">
              DPC20 Standard
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary-300 to-primary bg-clip-text text-transparent">
              Secure Your DPC20
            </span>
            <br />
            <span className="text-white">Allocation</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Join the private whitelist presale for Dot Protocol&apos;s native DPC20 token at{' '}
            <span className="text-primary font-semibold">${PRESALE_CONFIG.tokenPriceUsd.toFixed(2)}</span>{' '}
            — launch price ${PRESALE_CONFIG.launchPriceUsd.toFixed(2)}.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
