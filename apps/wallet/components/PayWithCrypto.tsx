"use client";

import { useState } from "react";

const RECENT_MERCHANTS = [
  { name: "Coffee Shop", address: "0x1234...5678", icon: "☕" },
  { name: "Online Store", address: "0xabcd...ef01", icon: "🛍️" },
  { name: "Gas Station", address: "0x9876...5432", icon: "⛽" },
];

export default function PayWithCrypto() {
  const [merchantAddress, setMerchantAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("3DOT");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">3Dot Pay</h1>
      <p className="text-sm text-gray-500 mb-6">Pay merchants with your crypto instantly</p>

      {/* QR Scanner */}
      <div className="card p-6 mb-4">
        <div className="text-center mb-4">
          <div className="w-48 h-48 mx-auto bg-[#111827] rounded-2xl border border-white/5 flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-xs text-gray-500">Scan QR Code</div>
              <div className="text-[10px] text-gray-600 mt-1">Point camera at merchant QR</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">— or enter manually —</div>
        </div>

        {/* Merchant Address */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Merchant Address</label>
          <input
            type="text"
            value={merchantAddress}
            onChange={(e) => setMerchantAddress(e.target.value)}
            placeholder="0x... or scan QR"
            className="input-field"
          />
        </div>

        {/* Token Select */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Pay With</label>
          <div className="flex gap-2">
            {["3DOT", "USDT", "USDC", "BTC"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedToken(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedToken === t
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "bg-[#111827] text-gray-400 border border-white/5 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field text-lg"
          />
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2 mb-4">
          {["$5", "$10", "$25", "$50", "$100"].map((amt) => (
            <button
              key={amt}
              className="flex-1 py-2 rounded-lg text-xs text-gray-400 bg-[#111827] border border-white/5 hover:text-white transition-colors"
            >
              {amt}
            </button>
          ))}
        </div>

        {/* Pay Button */}
        <button
          disabled={!merchantAddress || !amount}
          className="btn-primary disabled:opacity-30"
        >
          {!merchantAddress || !amount ? "Enter details" : `Pay ${amount} ${selectedToken}`}
        </button>
      </div>

      {/* Recent Merchants */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Merchants</h3>
        {RECENT_MERCHANTS.map((m) => (
          <button
            key={m.name}
            onClick={() => setMerchantAddress(m.address)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-lg border border-white/5">
              {m.icon}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-gray-500 font-mono">{m.address}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
