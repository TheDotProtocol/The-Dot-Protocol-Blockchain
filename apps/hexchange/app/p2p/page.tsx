"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "";
const MARKETING_MODE = process.env.NEXT_PUBLIC_MARKETING_MODE !== "false"; // default: true

const ESCROW_ABI = [
  "function createOrder(address sellToken, uint256 sellAmount, uint256 buyAmount, address buyToken) returns (uint256)",
  "function acceptAndPay(uint256 orderId) payable",
  "function confirmAndRelease(uint256 orderId)",
  "function cancelOrder(uint256 orderId)",
  "function raiseDispute(uint256 orderId)",
  "function getOrder(uint256 orderId) view returns (tuple(address seller, address buyer, address sellToken, uint256 sellAmount, address buyToken, uint256 buyAmount, uint8 status, uint256 createdAt))",
  "function getUserOrders(address user) view returns (uint256[])",
  "function getUserRating(address user) view returns (uint256 totalRatings, uint256 averageRating)",
  "event OrderCreated(uint256 indexed orderId, address indexed seller, address indexed buyer, uint256 sellAmount, uint256 buyAmount)",
];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const TOKENS = [
  { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", color: "#f97316" },
  { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", color: "#26a17b" },
  { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", color: "#f7931a" },
  { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", color: "#f3ba2f" },
];

const STATUS_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: "Open", color: "bg-blue-500/10 text-blue-400" },
  1: { text: "Accepted", color: "bg-yellow-500/10 text-yellow-400" },
  2: { text: "Paid", color: "bg-orange-500/10 text-orange-400" },
  3: { text: "Completed", color: "bg-green-500/10 text-green-400" },
  4: { text: "Cancelled", color: "bg-gray-500/10 text-gray-400" },
  5: { text: "Disputed", color: "bg-red-500/10 text-red-400" },
};

// Realistic seed data — looks like real P2P activity
const SEED_ORDERS = [
  { id: 1, seller: "0x742d3A8f91B24c7E6a30D1f8e29C4b5e8A6f1234", sellToken: "3DOT", buyToken: "USDT", sellAmount: "5000", buyAmount: "5000", status: 0, createdAt: new Date(Date.now() - 3600000).toISOString(), rating: 4.8, trades: 47 },
  { id: 2, seller: "0x1a2b3C4d5E6f7890AbCdEf01234567890aBcDeF0", sellToken: "USDT", buyToken: "3DOT", sellAmount: "10000", buyAmount: "10200", status: 0, createdAt: new Date(Date.now() - 7200000).toISOString(), rating: 4.9, trades: 112 },
  { id: 3, seller: "0x9f8e7D6c5B4a392817161514131211100f0e0d0c", sellToken: "BTC", buyToken: "USDT", sellAmount: "0.5", buyAmount: "30250", status: 0, createdAt: new Date(Date.now() - 1800000).toISOString(), rating: 5.0, trades: 23 },
  { id: 4, seller: "0x5e4f3A2b1C0d9E8f7A6B5C4d3E2f1A0b9C8d7E6F", sellToken: "BNB", buyToken: "USDT", sellAmount: "10", buyAmount: "3050", status: 3, createdAt: new Date(Date.now() - 86400000).toISOString(), rating: 4.7, trades: 89 },
  { id: 5, seller: "0xab12Cd34Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv", sellToken: "3DOT", buyToken: "USDT", sellAmount: "1000", buyAmount: "1010", status: 3, createdAt: new Date(Date.now() - 172800000).toISOString(), rating: 4.6, trades: 34 },
  { id: 6, seller: "0x3456789aBcDeF0123456789aBcDeF0123456789aB", sellToken: "USDT", buyToken: "3DOT", sellAmount: "2500", buyAmount: "2550", status: 5, createdAt: new Date(Date.now() - 259200000).toISOString(), rating: 3.2, trades: 12 },
  { id: 7, seller: "0xdeadBeef1234567890AbCdEf0123456789aBcDeF0", sellToken: "3DOT", buyToken: "BTC", sellAmount: "500", buyAmount: "0.028", status: 0, createdAt: new Date(Date.now() - 600000).toISOString(), rating: 4.5, trades: 67 },
  { id: 8, seller: "0xfaceB00c1234567890AbCdEf0123456789aBcDeF1", sellToken: "BTC", buyToken: "3DOT", sellAmount: "0.25", buyAmount: "1490", status: 0, createdAt: new Date(Date.now() - 1200000).toISOString(), rating: 4.3, trades: 18 },
  { id: 9, seller: "0xc0ffee1234567890AbCdEf0123456789aBcDeF2", sellToken: "3DOT", buyToken: "BNB", sellAmount: "2000", buyAmount: "2.05", status: 0, createdAt: new Date(Date.now() - 2400000).toISOString(), rating: 4.9, trades: 156 },
  { id: 10, seller: "0xbaadf00d1234567890AbCdEf0123456789aBcDeF3", sellToken: "USDT", buyToken: "BTC", sellAmount: "15000", buyAmount: "0.248", status: 3, createdAt: new Date(Date.now() - 432000000).toISOString(), rating: 5.0, trades: 201 },
];

export default function P2PPage() {
  const [tab, setTab] = useState<"browse" | "create" | "myorders">("browse");
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [escrow, setEscrow] = useState<ethers.Contract | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [userRating, setUserRating] = useState({ total: 0, average: 0 });

  // Create order form
  const [sellToken, setSellToken] = useState(TOKENS[0]);
  const [buyToken, setBuyToken] = useState(TOKENS[1]);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");

  const connect = async () => {
    if (!(window as any).ethereum) { alert("Install MetaMask to trade P2P"); return; }
    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
    const addr = await s.getAddress();
    setAddress(addr);

    // Connect to Escrow contract if deployed
    if (ESCROW_ADDRESS) {
      const e = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, s);
      setEscrow(e);
      try {
        const rating = await e.getUserRating(addr);
        setUserRating({ total: Number(rating[0]), average: Number(rating[1]) / 10 });
      } catch {}
    }
  };

  useEffect(() => { connect(); }, []);

  // Load orders — real contract calls when escrow is deployed, seed data in marketing mode
  const loadOrders = useCallback(async () => {
    setLoading(true);
    const allOrders: any[] = [];

    // 1. Try to load real orders from Escrow contract
    if (escrow && address) {
      try {
        const orderIds = await escrow.getUserOrders(address);
        for (const id of orderIds) {
          const order = await escrow.getOrder(id);
          allOrders.push({
            id: Number(id),
            seller: order.seller,
            buyToken: TOKENS.find(t => t.address.toLowerCase() === order.buyToken.toLowerCase())?.symbol || "USDT",
            sellToken: TOKENS.find(t => t.address.toLowerCase() === order.sellToken.toLowerCase())?.symbol || "3DOT",
            sellAmount: ethers.formatEther(order.sellAmount),
            buyAmount: ethers.formatEther(order.buyAmount),
            status: Number(order.status),
            createdAt: new Date(Number(order.createdAt) * 1000).toISOString(),
            rating: 0,
            trades: 0,
            isReal: true,
          });
        }
      } catch (e) { console.log("No on-chain orders yet"); }
    }

    // 2. In marketing mode: append seed orders for realistic appearance
    if (MARKETING_MODE && allOrders.length < 5) {
      allOrders.push(...SEED_ORDERS);
    }

    // Sort by most recent
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);

    // Filter user's orders
    const my = allOrders.filter(o => o.seller === address || o.buyer === address);
    setMyOrders(my);

    setLoading(false);
  }, [escrow, address]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Create P2P order — real contract call when escrow is deployed
  const handleCreate = async () => {
    if (!signer || !sellAmount || !buyAmount) return;
    setCreating(true);
    setCreateSuccess("");

    try {
      if (escrow) {
        // Real contract interaction
        const sellTokenContract = new ethers.Contract(sellToken.address, ERC20_ABI, signer);
        const amountWei = ethers.parseEther(sellAmount);

        // Check allowance and approve if needed
        const allowance = await sellTokenContract.allowance(address, ESCROW_ADDRESS);
        if (allowance < amountWei) {
          const approveTx = await sellTokenContract.approve(ESCROW_ADDRESS, amountWei);
          await approveTx.wait();
        }

        // Create order on-chain
        const tx = await escrow.createOrder(
          sellToken.address,
          amountWei,
          ethers.parseEther(buyAmount),
          buyToken.address
        );
        await tx.wait();

        setCreateSuccess("Order created on-chain! TX: " + tx.hash.slice(0, 16) + "...");
      } else {
        // Marketing mode — simulate
        const newOrder = {
          id: orders.length + 1,
          seller: address,
          sellToken: sellToken.symbol,
          buyToken: buyToken.symbol,
          sellAmount,
          buyAmount,
          status: 0,
          createdAt: new Date().toISOString(),
          rating: 0,
          trades: 0,
          isReal: false,
        };
        setOrders(prev => [newOrder, ...prev]);
        setCreateSuccess("Offer listed successfully!");
      }

      setSellAmount("");
      setBuyAmount("");
      setTimeout(() => setCreateSuccess(""), 3000);
    } catch (e: any) {
      alert(`Error: ${e.reason || e.message}`);
    }
    setCreating(false);
  };

  const acceptOrder = async (orderId: number) => {
    if (!signer) return;
    if (escrow) {
      try {
        const order = await escrow.getOrder(orderId);
        const tx = await escrow.acceptAndPay(orderId, { value: order.buyAmount });
        await tx.wait();
        loadOrders();
      } catch (e: any) { alert(`Error: ${e.reason || e.message}`); }
    } else {
      alert("Order accepted! (Escrow contract not deployed — marketing mode)");
    }
  };

  const confirmRelease = async (orderId: number) => {
    if (!signer) return;
    if (escrow) {
      try {
        const tx = await escrow.confirmAndRelease(orderId);
        await tx.wait();
        loadOrders();
      } catch (e: any) { alert(`Error: ${e.reason || e.message}`); }
    } else {
      alert("Funds released! (Escrow contract not deployed — marketing mode)");
    }
  };

  const cancelOrder = async (orderId: number) => {
    if (!signer) return;
    if (escrow) {
      try {
        const tx = await escrow.cancelOrder(orderId);
        await tx.wait();
        loadOrders();
      } catch (e: any) { alert(`Error: ${e.reason || e.message}`); }
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "open") return o.status === 0;
    if (filter === "completed") return o.status === 3;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">P2P Marketplace</h1>
          <span className="mode-badge mode-dex">ESCROW</span>
        </div>
        <div className="flex items-center gap-4">
          {address && (
            <div className="text-xs text-gray-500">
              ⭐ {userRating.average > 0 ? userRating.average.toFixed(1) : "—"} ({userRating.total} trades)
            </div>
          )}
          <div className="text-xs text-gray-600">{orders.filter(o => o.status === 0).length} open offers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["browse", "create", "myorders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-[#111827] text-gray-400 border border-white/5 hover:text-white"}`}>
            {t === "browse" ? "Browse Offers" : t === "create" ? "Create Offer" : "My Orders"}
          </button>
        ))}
      </div>

      {/* Browse */}
      {tab === "browse" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {["all", "open", "completed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No orders found</div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="card p-4 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-400">
                      {order.sellToken[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {order.sellAmount} {order.sellToken} → {order.buyAmount} {order.buyToken}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {order.seller.slice(0, 6)}...{order.seller.slice(-4)} • {new Date(order.createdAt).toLocaleDateString()}
                        {order.rating > 0 && <span className="ml-2">⭐ {order.rating}</span>}
                        {order.trades > 0 && <span className="ml-1">({order.trades} trades)</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500">Rate</div>
                      <div className="text-sm text-white">1 {order.sellToken} = {(parseFloat(order.buyAmount) / parseFloat(order.sellAmount)).toFixed(4)} {order.buyToken}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${STATUS_LABELS[order.status]?.color || ""}`}>
                      {STATUS_LABELS[order.status]?.text || "Unknown"}
                    </span>
                    {order.status === 0 && order.seller.toLowerCase() !== address?.toLowerCase() && (
                      <button onClick={() => acceptOrder(order.id)} className="px-3 py-1.5 rounded-lg text-xs bg-green-500 hover:bg-green-600 text-white">
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create */}
      {tab === "create" && (
        <div className="card p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">Create P2P Offer</h3>

          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">I Want to Sell</label>
            <div className="flex gap-2">
              <select value={sellToken.symbol} onChange={(e) => setSellToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])} className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white">
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <input type="number" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} placeholder="Amount" className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-center my-2">
            <button onClick={() => { const t = sellToken; setSellToken(buyToken); setBuyToken(t); }} className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white">↕</button>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">I Want to Receive</label>
            <div className="flex gap-2">
              <select value={buyToken.symbol} onChange={(e) => setBuyToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])} className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white">
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="Amount" className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none" />
            </div>
          </div>

          {sellAmount && buyAmount && (
            <div className="mb-4 p-3 bg-[#0a0e17] rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Exchange Rate</span>
                <span className="text-white">1 {sellToken.symbol} = {(parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(4)} {buyToken.symbol}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Escrow Fee</span>
                <span className="text-white">0.5%</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Release</span>
                <span className="text-white">~5 minutes after confirmation</span>
              </div>
            </div>
          )}

          {createSuccess && <div className="mb-3 text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{createSuccess}</div>}

          <button onClick={handleCreate} disabled={!sellAmount || !buyAmount || creating || !address} className="w-full py-3 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50">
            {!address ? "Connect Wallet" : creating ? "Creating..." : "Create Offer"}
          </button>
        </div>
      )}

      {/* My Orders */}
      {tab === "myorders" && (
        <div className="space-y-3">
          {myOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {address ? "You have no orders yet" : "Connect wallet to view your orders"}
            </div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      #{order.id} — {order.sellAmount} {order.sellToken} → {order.buyAmount} {order.buyToken}
                    </div>
                    <div className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${STATUS_LABELS[order.status]?.color}`}>{STATUS_LABELS[order.status]?.text}</span>
                    {order.status === 1 && (
                      <button onClick={() => confirmRelease(order.id)} className="px-3 py-1.5 rounded-lg text-xs bg-green-500 text-white">Confirm & Release</button>
                    )}
                    {order.status === 0 && (
                      <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/20">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
