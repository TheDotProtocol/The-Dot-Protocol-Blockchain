'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Connect & Switch Network',
    description: 'Connect MetaMask — we auto-add Chennai testnet and your DPC20 token.',
  },
  {
    step: '02',
    title: 'Verify Whitelist',
    description: 'Enter your private whitelist code to unlock purchase eligibility.',
  },
  {
    step: '03',
    title: 'Choose Payment',
    description: 'Pay with ETH, USDT, or BNB at the fixed presale price.',
  },
  {
    step: '04',
    title: 'Receive DPC20',
    description: 'Tokens settle to your wallet once on-chain presale contract is live.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">How It Works</h2>
        <p className="text-zinc-500 mb-10">Four steps to secure your allocation</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl p-5"
            >
              <span className="text-2xl font-bold text-primary">{item.step}</span>
              <h3 className="text-white font-semibold mt-3 mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
