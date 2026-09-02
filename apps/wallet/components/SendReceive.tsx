"use client";

import { useState } from "react";

const TOKENS = [
  { symbol: "3DOT", balance: "12,450.00", color: "from-orange-500 to-orange-600" },
  { symbol: "USDT", balance: "2,300.00", color: "from-green-500 to-green-600" },
  { symbol: "BTC", balance: "0.045", color: "from-yellow-500 to-yellow-600" },
  { symbol: "BNB", balance: "8.5", color: "from-yellow-400 to-yellow-500" },
  { symbol: "USDC", balance: "1,100.00", color: "from-blue-500 to-blue-600" },
];

export default function SendReceive({ mode }: { mode: "send" | "receive" }) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("3DOT");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const MY_ADDRESS = "0xAA0bf607b14109A01e94a30674a01e2BA22e9694";
  const token = TOKENS.find((t) => t.symbol === selectedToken) || TOKENS[0];

  if (mode === "receive") {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Receive Crypto</h1>
        <p className="text-sm text-gray-500 mb-6">Share your address or QR code to receive tokens</p>

        <div className="card p-6 text-center">
          {/* QR Code placeholder */}
          <div className="w-48 h-48 mx-auto bg-white rounded-2xl mb-6 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-1 p-4">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`}
                />
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="text-xs text-gray-500 mb-2">Your Wallet Address</div>
          <div className="bg-[#111827] rounded-xl p-3 mb-4 border border-white/5">
            <code className="text-xs font-mono break-all text-gray-300">{MY_ADDRESS}</code>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(MY_ADDRESS);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="btn-primary mb-3"
          >
            {copied ? "✅ Copied!" : "📋 Copy Address"}
          </button>

          <div className="text-[10px] text-gray-600 mt-4">
            Only send 3DOT-compatible tokens on Dot Protocol (Chain ID 1546) to this address.
            <br />
            Sending other tokens may result in permanent loss.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Send Crypto</h1>
      <p className="text-sm text-gray-500 mb-6">Transfer tokens to another wallet</p>

      <div className="card p-6">
        {/* Token Select */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-2 block">Select Token</label>
          <div className="grid grid-cols-5 gap-2">
            {TOKENS.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedToken(t.symbol)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedToken === t.symbol
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "bg-[#111827] text-gray-400 border border-white/5 hover:text-white"
                }`}
              >
                {t.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-2 block">Recipient Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">Amount</label>
            <span className="text-xs text-gray-600">
              Balance: {token.balance} {selectedToken}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field"
          />
          <div className="flex gap-1 mt-2">
            {["25%", "50%", "75%", "MAX"].map((pct) => (
              <button
                key={pct}
                className="flex-1 py-1.5 rounded-lg text-[10px] text-gray-500 bg-[#111827] border border-white/5 hover:text-white transition-colors"
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Network Fee */}
        <div className="bg-[#111827] rounded-xl p-3 mb-4 border border-white/5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Network Fee</span>
            <span className="text-gray-300">~0.001 DOT</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Estimated Time</span>
            <span className="text-gray-300">~2 seconds</span>
          </div>
        </div>

        {/* Send Button */}
        <button
          disabled={!address || !amount}
          className="btn-primary disabled:opacity-30"
          onClick={() => {
            setSending(true);
            setTimeout(() => setSending(false), 2000);
          }}
        >
          {sending ? "Sending..." : !address || !amount ? "Fill in details" : `Send ${selectedToken}`}
        </button>
      </div>
    </div>
  );
}
