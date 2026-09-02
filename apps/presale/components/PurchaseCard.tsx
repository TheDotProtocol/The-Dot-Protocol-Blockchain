'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRESALE_CONFIG } from '@/config/presale';

type PaymentMethod = (typeof PRESALE_CONFIG.paymentMethods)[number];

type PurchaseCardProps = {
  address: string | null;
  tokenBalance: string | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  status: string;
  onConnect: () => void;
  onSetStatus: (msg: string) => void;
};

export default function PurchaseCard({
  address,
  tokenBalance,
  isCorrectNetwork,
  isConnecting,
  status,
  onConnect,
  onSetStatus,
}: PurchaseCardProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ETH');
  const [amountUsd, setAmountUsd] = useState('');
  const [whitelistCode, setWhitelistCode] = useState('');

  const amount = parseFloat(amountUsd) || 0;
  const tokensReceived = amount / PRESALE_CONFIG.tokenPriceUsd;
  const isValidAmount =
    amount >= PRESALE_CONFIG.minPurchaseUsd && amount <= PRESALE_CONFIG.maxPurchaseUsd;

  const handlePurchase = () => {
    if (!address) {
      onSetStatus('Connect your wallet first.');
      return;
    }
    if (!isCorrectNetwork) {
      onSetStatus('Switch to Dot Protocol Chennai Testnet.');
      return;
    }
    if (!whitelistCode.trim()) {
      onSetStatus('Enter your whitelist code.');
      return;
    }
    if (!isValidAmount) {
      onSetStatus(
        `Amount must be $${PRESALE_CONFIG.minPurchaseUsd} – $${PRESALE_CONFIG.maxPurchaseUsd.toLocaleString()}.`
      );
      return;
    }

    onSetStatus(
      `Preview: ${tokensReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} DPC20 via ${paymentMethod}. On-chain settlement coming in next phase.`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      id="purchase"
      className="glass-card rounded-2xl p-6 md:p-8 lg:sticky lg:top-24"
    >
      <h2 className="text-2xl font-bold text-white mb-1">Purchase DPC20</h2>
      <p className="text-sm text-zinc-500 mb-6">Whitelist required · MetaMask on Chennai testnet</p>

      {!address ? (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-600 disabled:opacity-60 text-white font-medium px-6 py-4 rounded-xl transition-colors mb-6"
        >
          <MetaMaskIcon />
          {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
        </button>
      ) : (
        <div className="rounded-xl bg-dark-300/50 border border-white/5 p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Network</span>
            <span className={isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}>
              {isCorrectNetwork ? 'Chennai Testnet ✓' : 'Wrong network'}
            </span>
          </div>
          {tokenBalance !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Your TDOT (DPC20)</span>
              <span className="text-primary font-semibold">{tokenBalance}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <Field label="Whitelist Code" required>
          <input
            type="text"
            value={whitelistCode}
            onChange={(e) => setWhitelistCode(e.target.value)}
            placeholder="Enter private whitelist code"
            className="input-field"
          />
        </Field>

        <Field label="Payment Method">
          <div className="grid grid-cols-3 gap-2">
            {PRESALE_CONFIG.paymentMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  paymentMethod === method
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-dark-300/40 border-white/5 text-zinc-400 hover:border-primary/40'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Amount (USD)">
          <input
            type="number"
            min={PRESALE_CONFIG.minPurchaseUsd}
            max={PRESALE_CONFIG.maxPurchaseUsd}
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            placeholder={`$${PRESALE_CONFIG.minPurchaseUsd} – $${PRESALE_CONFIG.maxPurchaseUsd.toLocaleString()}`}
            className="input-field"
          />
          {amount > 0 && (
            <p className="text-xs text-zinc-500 mt-2">
              You receive{' '}
              <span className="text-primary font-semibold">
                {tokensReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} DPC20
              </span>
            </p>
          )}
        </Field>

        <button
          onClick={handlePurchase}
          className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 rounded-xl transition-colors"
        >
          Confirm Purchase
        </button>

        {status && (
          <p className="text-sm text-center text-zinc-400 bg-dark-300/30 border border-white/5 rounded-xl px-4 py-3">
            {status}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-500 mb-2">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function MetaMaskIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none" aria-hidden>
      <path d="M32.958 1.5L19.5 11.25v4.5l13.458 9.75V1.5z" fill="#E17726" />
      <path d="M2.042 1.5L15.315 11.4l4.185-2.85L2.042 1.5z" fill="#E27625" />
      <path d="M19.5 15.75v16.5l13.458-9.75V11.25L19.5 15.75z" fill="#E27625" />
      <path d="M2.042 22.5V1.5l17.458 14.25-4.185 2.85L2.042 22.5z" fill="#E27625" />
    </svg>
  );
}
