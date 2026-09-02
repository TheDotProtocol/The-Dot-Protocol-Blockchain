"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { HEX_ADDRESSES, PRESALE_ABI } from "@/config/contracts";

interface Purchase {
  id: number;
  amount: string;
  paid: string;
  phase: number;
  timestamp: number;
  claimed: string;
  claimable: string;
}

const PHASE_NAMES = ["Not Started", "Early Bird", "Seed", "Public", "Ended"];
const PHASE_PRICES = ["", "$0.005", "$0.008", "$0.01", ""];

export default function PresaleCard() {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalSold, setTotalSold] = useState("0");
  const [totalRaised, setTotalRaised] = useState("0");
  const [hardCap, setHardCap] = useState("0");
  const [timeLeft, setTimeLeft] = useState("0");
  const [buyAmount, setBuyAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const getProvider = () => {
    if (!(window as any)?.ethereum) return null;
    return new ethers.BrowserProvider((window as any).ethereum);
  };

  const getPresaleContract = async (withSigner = false) => {
    const provider = getProvider();
    if (!provider) return null;
    const chainId = (await provider.getNetwork()).chainId;
    const addrs =
      HEX_ADDRESSES[Number(chainId) as keyof typeof HEX_ADDRESSES] ||
      HEX_ADDRESSES[1546];
    const signerOrProvider = withSigner
      ? await provider.getSigner()
      : provider;
    return new ethers.Contract(addrs.Presale, PRESALE_ABI, signerOrProvider);
  };

  const loadPresaleData = useCallback(async () => {
    try {
      const contract = await getPresaleContract();
      if (!contract) return;

      const [phase, sold, raised, cap, left] = await Promise.all([
        contract.currentPhase(),
        contract.totalSold(),
        contract.totalRaised(),
        contract.hardCap(),
        contract.getPhaseTimeLeft(),
      ]);

      setCurrentPhase(Number(phase));
      setTotalSold(ethers.formatEther(sold));
      setTotalRaised(ethers.formatEther(raised));
      setHardCap(ethers.formatEther(cap));
      setTimeLeft(Number(left).toString());
    } catch {
      // Contract might not be deployed — show demo data
      setCurrentPhase(1);
      setTotalSold("50000000");
      setTotalRaised("250000");
      setHardCap("500000");
      setTimeLeft("432000");
    }
  }, []);

  const loadPurchases = useCallback(async () => {
    if (!address) return;
    try {
      const contract = await getPresaleContract();
      if (!contract) return;

      const purchaseIds = await contract.getUserPurchases(address);
      const items: Purchase[] = [];

      for (const id of purchaseIds) {
        const p = await contract.allPurchases(Number(id));
        const claimable = await contract.getClaimableAmount(Number(id));
        items.push({
          id: Number(id),
          amount: ethers.formatEther(p.amount),
          paid: ethers.formatEther(p.paid),
          phase: Number(p.phase),
          timestamp: Number(p.timestamp),
          claimed: ethers.formatEther(p.claimed),
          claimable: ethers.formatEther(claimable),
        });
      }
      setPurchases(items);
    } catch {
      setPurchases([]);
    }
  }, [address]);

  useEffect(() => {
    const init = async () => {
      const eth = (window as any)?.ethereum;
      if (eth) {
        try {
          const accounts = await eth.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const provider = new ethers.BrowserProvider(eth);
            const net = await provider.getNetwork();
            setChainId(Number(net.chainId));
          }
        } catch {}
      }
      await loadPresaleData();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (address) {
      loadPurchases();
      const interval = setInterval(loadPresaleData, 5000);
      return () => clearInterval(interval);
    }
  }, [address, loadPresaleData, loadPurchases]);

  const connectWallet = async () => {
    const eth = (window as any)?.ethereum;
    if (!eth) {
      alert("Please install MetaMask");
      return;
    }
    const provider = new ethers.BrowserProvider(eth);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    const net = await provider.getNetwork();
    setAddress(addr);
    setChainId(Number(net.chainId));

    // Switch to mainnet if needed
    if (Number(net.chainId) !== 1546) {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x60A" }],
        });
      } catch {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x60A",
              chainName: "Dot Protocol Mainnet",
              rpcUrls: ["http://127.0.0.1:9545"],
              nativeCurrency: {
                name: "3DOT",
                symbol: "3DOT",
                decimals: 18,
              },
            },
          ],
        });
      }
    }
  };

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return;
    setBuying(true);
    try {
      const contract = await getPresaleContract(true);
      if (!contract) return;

      const value = ethers.parseEther(buyAmount);
      const tx = await contract.buyWithETH({ value });
      await tx.wait();
      alert("Purchase successful! Tokens will be claimable after TGE.");
      setBuyAmount("");
      await loadPresaleData();
      await loadPurchases();
    } catch (err: any) {
      console.error(err);
      alert(`Purchase failed: ${err.reason || err.message}`);
    } finally {
      setBuying(false);
    }
  };

  const handleClaim = async (purchaseId: number) => {
    setClaiming(purchaseId);
    try {
      const contract = await getPresaleContract(true);
      if (!contract) return;

      const tx = await contract.claimTokens(purchaseId);
      await tx.wait();
      alert("Tokens claimed successfully!");
      await loadPurchases();
    } catch (err: any) {
      console.error(err);
      alert(`Claim failed: ${err.reason || err.message}`);
    } finally {
      setClaiming(null);
    }
  };

  const soldPct =
    parseFloat(hardCap) > 0
      ? (parseFloat(totalRaised) / parseFloat(hardCap)) * 100
      : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">3DOT Presale</h2>
          <p className="text-xs text-gray-500 mt-1">
            Buy with ETH · 20% TGE + 6-month vest
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            currentPhase > 0 && currentPhase < 4
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-800 text-gray-500"
          }`}
        >
          {currentPhase > 0 && currentPhase < 4 ? "● Live" : "Closed"}
        </span>
      </div>

      {/* Phase Info */}
      <div className="bg-[#1f2937] rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Current Phase</span>
          <span className="text-orange-400 font-semibold">
            {PHASE_NAMES[currentPhase] || "Unknown"}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Price</span>
          <span className="text-white">
            {PHASE_PRICES[currentPhase] || "—"} per 3DOT
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Time Left</span>
          <span className="text-white">
            {timeLeft !== "0"
              ? `${Math.floor(Number(timeLeft) / 86400)}d ${Math.floor(
                  (Number(timeLeft) % 86400) / 3600
                )}h`
              : "—"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Raised: {parseFloat(totalRaised).toLocaleString()} 3DOT</span>
          <span>Cap: {parseFloat(hardCap).toLocaleString()} 3DOT</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(soldPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Buy Form */}
      {address ? (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Amount (ETH)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="0.01"
              className="bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-white flex-1 outline-none focus:border-orange-500"
            />
            <button
              onClick={handleBuy}
              disabled={buying || !buyAmount}
              className="btn-primary px-6 disabled:opacity-50"
            >
              {buying ? "Buying..." : "Buy"}
            </button>
          </div>
          {buyAmount && parseFloat(buyAmount) > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              You receive{" "}
              <span className="text-orange-400">
                {(
                  (parseFloat(buyAmount) * 1e18) /
                  (currentPhase === 1
                    ? 5e15
                    : currentPhase === 2
                    ? 8e15
                    : 1e16)
                ).toLocaleString()}{" "}
                3DOT
              </span>
            </p>
          )}
        </div>
      ) : (
        <button onClick={connectWallet} className="btn-primary w-full mb-4">
          Connect Wallet to Buy
        </button>
      )}

      {/* Purchases */}
      {purchases.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Your Purchases
          </h3>
          <div className="space-y-2">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="bg-[#1f2937] rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm text-white">
                    {parseFloat(p.amount).toLocaleString()} 3DOT
                  </div>
                  <div className="text-xs text-gray-500">
                    Phase {p.phase} ·{" "}
                    {new Date(p.timestamp * 1000).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Claimable: {parseFloat(p.claimable).toLocaleString()}
                  </div>
                  {parseFloat(p.claimable) > 0 && (
                    <button
                      onClick={() => handleClaim(p.id)}
                      disabled={claiming === p.id}
                      className="text-xs text-orange-400 hover:text-orange-300 mt-1"
                    >
                      {claiming === p.id ? "Claiming..." : "Claim"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
