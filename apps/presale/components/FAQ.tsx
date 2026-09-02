'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'What is 3DOT?', a: '3DOT is the native token of the Dot Protocol ecosystem, powering Hexchange, the 3Dot Wallet, and the entire DeFi ecosystem on our EVM-compatible blockchain.' },
  { q: 'How do I participate in the presale?', a: 'Connect your wallet (MetaMask or 3Dot Wallet), select your payment method (ETH, USDT, or USDC), enter the amount, and confirm the transaction.' },
  { q: 'When will tokens be distributed?', a: '20% of purchased tokens will be available at TGE (Token Generation Event). The remaining 80% will vest linearly over 6 months.' },
  { q: 'What is the minimum purchase?', a: 'The minimum purchase is 0.01 ETH equivalent. There is no maximum during the public sale phase.' },
  { q: 'Which networks are supported?', a: 'Currently we support purchases on Ethereum mainnet. 3DOT tokens will be distributed on Dot Protocol Mainnet (Chain ID 1546).' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
            >
              <span className="font-medium">{faq.q}</span>
              <span className="text-gray-400 text-xl">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
