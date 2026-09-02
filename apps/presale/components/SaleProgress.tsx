'use client';

import { motion } from 'framer-motion';
import { PRESALE_CONFIG } from '@/config/presale';

const stats = [
  { label: 'Token Price', value: `$${PRESALE_CONFIG.tokenPriceUsd.toFixed(2)}` },
  { label: 'Soft Cap', value: `$${(PRESALE_CONFIG.softCapUsd / 1_000_000).toFixed(1)}M` },
  { label: 'Hard Cap', value: `$${(PRESALE_CONFIG.hardCapUsd / 1_000_000).toFixed(0)}M` },
  { label: 'Min / Max', value: `$${PRESALE_CONFIG.minPurchaseUsd} – $${PRESALE_CONFIG.maxPurchaseUsd.toLocaleString()}` },
  { label: 'Payment', value: PRESALE_CONFIG.paymentMethods.join(' · ') },
  { label: 'Supply', value: PRESALE_CONFIG.totalSupply },
];

export default function SaleProgress() {
  const progress = Math.min((PRESALE_CONFIG.raisedUsd / PRESALE_CONFIG.hardCapUsd) * 100, 100);
  const softCapLine = (PRESALE_CONFIG.softCapUsd / PRESALE_CONFIG.hardCapUsd) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-zinc-500 mb-1">Total Raised</p>
          <p className="text-3xl font-bold text-white">
            ${PRESALE_CONFIG.raisedUsd.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500 mb-1">Hard Cap</p>
          <p className="text-2xl font-bold text-primary">
            ${PRESALE_CONFIG.hardCapUsd.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-dark-300 rounded-full overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-primary rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-primary-300/60"
          style={{ left: `${softCapLine}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500 mb-8">
        <span>{progress.toFixed(1)}% of hard cap</span>
        <span>Soft cap marker</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-dark-300/40 border border-white/5 px-4 py-3"
          >
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
