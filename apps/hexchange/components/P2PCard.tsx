"use client";

import { useState } from "react";

const MOCK_ORDERS = [
  { id: 1, seller: "0xe7fc...3e6b", token: "3DOT", amount: "50,000", price: "$0.01", total: "$500", status: "active", rating: 4.8, trades: 23, type: "sell" },
  { id: 2, seller: "0xae9b...7127", token: "3DOT", amount: "100,000", price: "$0.011", total: "$1,100", status: "active", rating: 4.5, trades: 15, type: "sell" },
  { id: 3, seller: "0x4e32...7503", token: "3DOT", amount: "25,000", price: "$0.0095", total: "$237.50", status: "active", rating: 5.0, trades: 41, type: "sell" },
  { id: 4, seller: "0x559f...529d", token: "3DOT", amount: "200,000", price: "$0.012", total: "$2,400", status: "active", rating: 4.2, trades: 8, type: "sell" },
  { id: 5, seller: "0xa4a3...5e15", token: "3DOT", amount: "75,000", price: "$0.01", total: "$750", status: "escrow", rating: 4.9, trades: 56, type: "sell" },
];

export default function P2PCard() {
  const [tab, setTab] = useState<"browse" | "create" | "myorders">("browse");
  const [filter, setFilter] = useState("all");
  const [createForm, setCreateForm] = useState({ token: "3DOT", amount: "", price: "", type: "sell" });
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const filteredOrders = filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[#0d1117] p-1 rounded-xl">
          {(["browse", "create", "myorders"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#1f2937] text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
              {t === "browse" ? "Browse Orders" : t === "create" ? "Create Order" : "My Orders"}
            </button>
          ))}
        </div>
      </div>

      {/* Browse Tab */}
      {tab === "browse" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            {["all", "active", "escrow", "completed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-gray-500 hover:text-gray-300"}`}>
                {f}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-500">{filteredOrders.length} orders</div>
          </div>

          {/* Orders Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 bg-[#0d1117] border-b border-gray-800/50 grid grid-cols-7 gap-4 text-[10px] text-gray-600 uppercase tracking-wider">
              <span>Seller</span><span>Token</span><span>Amount</span><span>Price</span><span>Total</span><span>Rating</span><span>Action</span>
            </div>
            {filteredOrders.map((order) => (
              <div key={order.id}
                className={`px-5 py-4 grid grid-cols-7 gap-4 items-center border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors ${selectedOrder === order.id ? "bg-orange-500/5" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">{order.seller[2]}</span>
                  <div>
                    <div className="text-sm font-mono text-white">{order.seller}</div>
                    <div className="text-[10px] text-gray-600">{order.trades} trades</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-white">{order.token}</span>
                <span className="text-sm text-gray-300">{order.amount}</span>
                <span className="text-sm text-gray-300">{order.price}</span>
                <span className="text-sm font-medium text-white">{order.total}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-sm text-gray-300">{order.rating}</span>
                </div>
                <div className="flex gap-2">
                  {order.status === "active" ? (
                    <button onClick={() => setSelectedOrder(order.id)}
                      className="text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Buy
                    </button>
                  ) : order.status === "escrow" ? (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg">In Escrow</span>
                  ) : (
                    <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="card p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Order #{selectedOrder}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="bg-[#0d1117] rounded-xl p-4 space-y-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Escrow Contract</span><span className="text-gray-300 font-mono text-xs">0xeA86...04C</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Seller Deposits Tokens</span><span className="text-gray-300">→ Locked in escrow</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">You Send Payment</span><span className="text-gray-300">→ Off-chain (bank/crypto)</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Seller Confirms</span><span className="text-gray-300">→ Tokens released to you</span></div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4 text-sm text-yellow-200">
                ⚠️ Always verify the escrow contract address matches the official address before sending payment.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 rounded-xl font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all">Accept & Pay</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Order Tab */}
      {tab === "create" && (
        <div className="card p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-bold mb-1">Create P2P Order</h3>
          <p className="text-sm text-gray-500 mb-5">Deposit tokens into escrow and wait for a buyer</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Order Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["sell", "buy"] as const).map((t) => (
                  <button key={t} onClick={() => setCreateForm({ ...createForm, type: t })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all capitalize ${createForm.type === t ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-[#1a1f2e] text-gray-400 border border-gray-800/50"}`}>
                    {t === "sell" ? " Sell 3DOT" : " Buy 3DOT"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Token</label>
              <select value={createForm.token} onChange={(e) => setCreateForm({ ...createForm, token: e.target.value })}
                className="w-full bg-[#1a1f2e] border border-gray-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50">
                <option value="3DOT">3DOT</option>
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="BNB">BNB</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Amount</label>
                <input type="number" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  placeholder="50000" className="w-full bg-[#1a1f2e] border border-gray-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Price (USD)</label>
                <input type="number" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  placeholder="0.01" className="w-full bg-[#1a1f2e] border border-gray-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </div>

            {createForm.amount && createForm.price && (
              <div className="bg-[#0d1117] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Value</span><span className="text-white font-bold">${(parseFloat(createForm.amount) * parseFloat(createForm.price)).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Escrow Fee (0.5%)</span><span className="text-gray-300">${(parseFloat(createForm.amount) * parseFloat(createForm.price) * 0.005).toFixed(2)}</span></div>
              </div>
            )}

            <button disabled={!createForm.amount || !createForm.price}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
              Create Escrow Order
            </button>
          </div>
        </div>
      )}

      {/* My Orders Tab */}
      {tab === "myorders" && (
        <div className="card p-6 max-w-lg mx-auto">
          <div className="text-center py-12 text-gray-600">
            <div className="text-5xl mb-4">🔄</div>
            <p className="text-lg font-medium text-gray-400 mb-2">No Active Orders</p>
            <p className="text-sm">Create a P2P order to start trading directly with other users.</p>
            <button onClick={() => setTab("create")} className="mt-4 px-6 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 font-medium transition-colors">
              Create Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
