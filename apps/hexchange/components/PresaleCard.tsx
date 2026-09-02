"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { HEX_ADDRESSES, PRESALE_ABI } from "@/config/contracts";

interface Purchase { id: number; amount: string; paid: string; phase: number; timestamp: number; claimed: string; claimable: string; }

const PHASES = [
  { name: "Not Started", color: "gray", price: "—" },
  { name: "Early Bird", color: "green", price: "$0.005", allocation: "20B", bonus: "100% bonus" },
  { name: "Seed", color: "blue", price: "$0.008", allocation: "30B", bonus: "60% bonus" },
  { name: "Public", color: "purple", price: "$0.01", allocation: "50B", bonus: "Standard" },
  { name: "Ended", color: "gray", price: "—" },
];

export default function PresaleCard() {
  const [address, setAddress] = useState("");
  const [currentPhase, setCurrentPhase] = useState(1);
  const [totalSold, setTotalSold] = useState("50000000");
  const [totalRaised, setTotalRaised] = useState("250000");
  const [hardCap, setHardCap] = useState("500000");
  const [timeLeft, setTimeLeft] = useState(432000);
  const [buyAmount, setBuyAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<"buy" | "claim" | "history">("buy");

  const getProvider = () => (window as any)?.ethereum ? new ethers.BrowserProvider((window as any).ethereum) : null;

  const getPresaleContract = async (signer = false) => {
    const provider = getProvider(); if (!provider) return null;
    const cid = (await provider.getNetwork()).chainId;
    const addrs = HEX_ADDRESSES[Number(cid) as keyof typeof HEX_ADDRESSES] || HEX_ADDRESSES[1546];
    return new ethers.Contract(addrs.Presale, PRESALE_ABI, signer ? await provider.getSigner() : provider);
  };

  const loadData = useCallback(async () => {
    try {
      const c = await getPresaleContract(); if (!c) return;
      const [phase, sold, raised, cap, left] = await Promise.all([c.currentPhase(), c.totalSold(), c.totalRaised(), c.hardCap(), c.getPhaseTimeLeft()]);
      setCurrentPhase(Number(phase)); setTotalSold(ethers.formatEther(sold)); setTotalRaised(ethers.formatEther(raised));
      setHardCap(ethers.formatEther(cap)); setTimeLeft(Number(left));
    } catch {}
  }, []);

  const loadPurchases = useCallback(async () => {
    if (!address) return;
    try {
      const c = await getPresaleContract(); if (!c) return;
      const ids = await c.getUserPurchases(address);
      const items: Purchase[] = [];
      for (const id of ids) {
        const p = await c.allPurchases(Number(id));
        const cl = await c.getClaimableAmount(Number(id));
        items.push({ id: Number(id), amount: ethers.formatEther(p.amount), paid: ethers.formatEther(p.paid), phase: Number(p.phase), timestamp: Number(p.timestamp), claimed: ethers.formatEther(p.claimed), claimable: ethers.formatEther(cl) });
      }
      setPurchases(items);
    } catch { setPurchases([]); }
  }, [address]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (address) { loadPurchases(); const i = setInterval(loadData, 5000); return () => clearInterval(i); } }, [address]);

  const connect = async () => {
    const eth = (window as any)?.ethereum; if (!eth) return;
    const provider = new ethers.BrowserProvider(eth);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setAddress(await signer.getAddress());
  };

  const handleBuy = async () => {
    if (!buyAmount) return; setBuying(true);
    try {
      const c = await getPresaleContract(true); if (!c) return;
      const tx = await c.buyWithETH({ value: ethers.parseEther(buyAmount) });
      await tx.wait(); setBuyAmount(""); await loadData(); await loadPurchases();
    } catch (e: any) { console.error(e); } finally { setBuying(false); }
  };

  const handleClaim = async (id: number) => {
    setClaiming(id);
    try { const c = await getPresaleContract(true); if (!c) return; const tx = await c.claimTokens(id); await tx.wait(); await loadPurchases(); }
    catch (e: any) { console.error(e); } finally { setClaiming(null); }
  };

  const soldPct = parseFloat(hardCap) > 0 ? (parseFloat(totalRaised) / parseFloat(hardCap)) * 100 : 0;
  const days = Math.floor(timeLeft / 86400); const hours = Math.floor((timeLeft % 86400) / 3600); const mins = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Raised</div>
          <div className="text-2xl font-bold text-orange-400">{parseFloat(totalRaised).toLocaleString()} <span className="text-sm text-gray-500">3DOT</span></div>
          <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(soldPct, 100)}%` }} />
          </div>
          <div className="text-xs text-gray-600 mt-1">{soldPct.toFixed(1)}% of {parseFloat(hardCap).toLocaleString()} cap</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Remaining</div>
          <div className="flex gap-3 mt-2">
            {[
              { val: days, label: "Days" },
              { val: hours, label: "Hours" },
              { val: mins, label: "Mins" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="bg-[#1a1f2e] rounded-lg px-3 py-2 border border-gray-800/50">
                  <span className="text-xl font-bold text-white">{val.toString().padStart(2, "0")}</span>
                </div>
                <span className="text-[10px] text-gray-600 mt-1 block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="grid grid-cols-3 gap-3">
        {PHASES.slice(1, 4).map((phase, i) => (
          <div key={i} className={`card p-4 transition-all ${currentPhase === i + 1 ? "border-orange-500/30 bg-orange-500/5" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{phase.name}</span>
              {currentPhase === i + 1 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">● Live</span>}
            </div>
            <div className="text-lg font-bold text-orange-400 mb-1">{phase.price}</div>
            <div className="text-xs text-gray-500">{phase.allocation} tokens</div>
            <div className="text-xs text-gray-600 mt-1">{phase.bonus}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d1117] p-1 rounded-xl">
        {(["buy", "claim", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-[#1f2937] text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
            {tab === "buy" ? "Buy Tokens" : tab === "claim" ? "Claim" : "History"}
          </button>
        ))}
      </div>

      {/* Buy Tab */}
      {activeTab === "buy" && (
        <div className="card p-6">
          {address ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Amount (ETH)</label>
                <div className="relative">
                  <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="0.01"
                    className="w-full bg-[#1a1f2e] border border-gray-700/50 rounded-xl px-4 py-3.5 text-lg font-bold text-white outline-none focus:border-orange-500/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button onClick={() => setBuyAmount("0.1")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 px-2 py-1 rounded-md">MAX</button>
                </div>
              </div>
              {buyAmount && parseFloat(buyAmount) > 0 && (
                <div className="bg-[#0d1117] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">You will receive</span><span className="text-orange-400 font-bold">{((parseFloat(buyAmount) * 1e18) / (currentPhase === 1 ? 5e15 : currentPhase === 2 ? 8e15 : 1e16)).toLocaleString()} 3DOT</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">TGE Unlock (20%)</span><span className="text-gray-300">{((parseFloat(buyAmount) * 1e18) / (currentPhase === 1 ? 5e15 : currentPhase === 2 ? 8e15 : 1e16) * 0.2).toLocaleString()} 3DOT</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Vested (6 months)</span><span className="text-gray-300">{((parseFloat(buyAmount) * 1e18) / (currentPhase === 1 ? 5e15 : currentPhase === 2 ? 8e15 : 1e16) * 0.8).toLocaleString()} 3DOT</span></div>
                </div>
              )}
              <button onClick={handleBuy} disabled={buying || !buyAmount}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                {buying ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : "Buy 3DOT with ETH"}
              </button>
            </div>
          ) : (
            <button onClick={connect} className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all">
              Connect Wallet
            </button>
          )}
        </div>
      )}

      {/* Claim Tab */}
      {activeTab === "claim" && (
        <div className="card p-6">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-3">📭</div>
              <p>No purchases yet. Buy tokens in the Buy tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{parseFloat(p.amount).toLocaleString()} 3DOT</div>
                      <div className="text-xs text-gray-500 mt-0.5">Phase {p.phase} · {new Date(p.timestamp * 1000).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Claimable: <span className="text-orange-400 font-medium">{parseFloat(p.claimable).toLocaleString()}</span></div>
                      {parseFloat(p.claimable) > 0 && (
                        <button onClick={() => handleClaim(p.id)} disabled={claiming === p.id}
                          className="mt-2 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-4 py-1.5 rounded-lg font-medium transition-colors">
                          {claiming === p.id ? "Claiming..." : "Claim Tokens"}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Vesting bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${(parseFloat(p.claimed) / parseFloat(p.amount)) * 100}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">{((parseFloat(p.claimed) / parseFloat(p.amount)) * 100).toFixed(1)}% claimed</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="card p-6">
          <div className="text-center py-8 text-gray-600">
            <div className="text-4xl mb-3">📊</div>
            <p>Purchase history will appear here after transactions are confirmed.</p>
          </div>
        </div>
      )}
    </div>
  );
}
