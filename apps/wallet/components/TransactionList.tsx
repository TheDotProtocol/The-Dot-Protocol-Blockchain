"use client";

const TRANSACTIONS = [
  { type: "receive", token: "3DOT", amount: "+500.00", from: "0x742d...2bD18", time: "2 min ago", status: "confirmed" },
  { type: "send", token: "USDT", amount: "-1,200.00", to: "0x1234...5678", time: "1 hour ago", status: "confirmed" },
  { type: "swap", token: "3DOT → USDC", amount: "+850.00", from: "Hexchange", time: "3 hours ago", status: "confirmed" },
  { type: "receive", token: "BTC", amount: "+0.012", from: "0x9876...5432", time: "1 day ago", status: "confirmed" },
  { type: "send", token: "BNB", amount: "-2.5", to: "0xdead...beef", time: "2 days ago", status: "confirmed" },
  { type: "pay", token: "3DOT", amount: "-50.00", to: "3Dot Pay: Coffee Shop", time: "3 days ago", status: "confirmed" },
  { type: "receive", token: "XRP", amount: "+1,000", from: "0xaaaa...bbbb", time: "4 days ago", status: "confirmed" },
];

export default function TransactionList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-gray-500 mt-1">All your deposits, withdrawals, and trades</p>
        </div>
        <div className="flex gap-2">
          {["All", "Sent", "Received", "Swaps"].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-[#111827] border border-white/5 hover:text-white transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {TRANSACTIONS.map((tx, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  tx.type === "receive"
                    ? "bg-green-500/10"
                    : tx.type === "send"
                    ? "bg-red-500/10"
                    : tx.type === "swap"
                    ? "bg-blue-500/10"
                    : "bg-purple-500/10"
                }`}
              >
                {tx.type === "receive" ? "📥" : tx.type === "send" ? "📤" : tx.type === "swap" ? "🔄" : "💳"}
              </div>
              <div>
                <div className="text-sm font-medium capitalize">{tx.type}</div>
                <div className="text-xs text-gray-500">
                  {tx.type === "receive" ? `From: ${tx.from}` : tx.type === "send" ? `To: ${tx.to}` : tx.type === "swap" ? tx.token : tx.to}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-mono font-medium ${
                  tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}
              >
                {tx.amount} {tx.token.split(" ")[0]}
              </div>
              <div className="text-xs text-gray-600">{tx.time}</div>
            </div>
            <div className="w-16 text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
