"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)",
  "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
  "function factory() view returns (address)",
];
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address)",
  "function allPairsLength() view returns (uint256)",
];
const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

const CHAIN_CONFIG: Record<number, any> = {
  1545: { rpc: "http://127.0.0.1:8545", name: "Chennai Testnet", explorer: "http://localhost:3002" },
  1546: { rpc: "http://127.0.0.1:9545", name: "Mainnet", explorer: "http://localhost:3002" },
};

const TOKENS = [
  { symbol: "3DOT", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", color: "#f97316" },
  { symbol: "USDT", address: "0x8896De4418363aD53c003D02d642aFA26Aaf4e84", color: "#26a17b" },
  { symbol: "BTC", address: "0x5dDB6171136b2A922f7fB262baf485a3865B5Ca2", color: "#f7931a" },
  { symbol: "BNB", address: "0x0670Dceaf0f6696eB423531fA2a2c4aBc94FBdB3", color: "#f3ba2f" },
  { symbol: "USDC", address: "0x7b7cAa5D76e3877e91D4B80d4Bb8C27e0b30e713", color: "#2775ca" },
  { symbol: "XRP", address: "0x3e1E51a4fC8e83A8e6e5eC4F2e4C9C4B0e5e8F7a", color: "#00aae4" },
];

interface Pool {
  address: string;
  token0: string;
  token1: string;
  symbol0: string;
  symbol1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  userBalance: string;
  pairIndex: number;
}

export default function PoolPage() {
  const [tab, setTab] = useState<"pools" | "add" | "remove">("pools");
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);

  // Add liquidity form
  const [tokenA, setTokenA] = useState(TOKENS[0]);
  const [tokenB, setTokenB] = useState(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [addingLiquidity, setAddingLiquidity] = useState(false);

  // Remove liquidity form
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [removePercent, setRemovePercent] = useState(100);

  const connect = async () => {
    if (!(window as any).ethereum) { alert("Install MetaMask"); return; }
    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    const net = await p.getNetwork();
    setProvider(p);
    setSigner(s);
    setAddress(await s.getAddress());
    setChainId(Number(net.chainId));
  };

  useEffect(() => { connect(); }, []);

  // Discover pools from on-chain factory
  const discoverPools = useCallback(async () => {
    if (!provider || !signer) return;
    setLoading(true);
    try {
      const config = CHAIN_CONFIG[chainId] || CHAIN_CONFIG[1546];
      const network = await provider.getNetwork();
      const cid = Number(network.chainId);

      // Get factory address from contracts config
      const addrsRes = await fetch("/api/pairs");
      // Use known token pairs to discover pools
      const discovered: Pool[] = [];

      for (let i = 0; i < TOKENS.length; i++) {
        for (let j = i + 1; j < TOKENS.length; j++) {
          try {
            // Try to read pair contract (may not exist for all pairs)
            const pairAddress = "0x" + ethers.solidityPackedKeccak256(
              ["bytes"],
              [ethers.solidityPacked(["address", "address"], [TOKENS[i].address, TOKENS[j].address])]
            ).slice(0, 40);

            const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
            const [r0, r1] = await pairContract.getReserves();
            const ts = await pairContract.totalSupply();
            const userBal = address ? await pairContract.balanceOf(address) : 0n;

            discovered.push({
              address: pairAddress,
              token0: TOKENS[i].address,
              token1: TOKENS[j].address,
              symbol0: TOKENS[i].symbol,
              symbol1: TOKENS[j].symbol,
              reserve0: ethers.formatEther(r0),
              reserve1: ethers.formatEther(r1),
              totalSupply: ethers.formatEther(ts),
              userBalance: ethers.formatEther(userBal),
              pairIndex: discovered.length,
            });
          } catch {
            // Pair doesn't exist yet — that's fine
          }
        }
      }
      setPools(discovered);
    } catch (e) {
      console.error("Pool discovery error:", e);
    }
    setLoading(false);
  }, [provider, signer, chainId, address]);

  useEffect(() => { discoverPools(); }, [discoverPools]);

  // Add liquidity
  const handleAddLiquidity = async () => {
    if (!signer || !amountA || !amountB) return;
    setAddingLiquidity(true);
    try {
      const tokenAContract = new ethers.Contract(tokenA.address, ERC20_ABI, signer);
      const tokenBContract = new ethers.Contract(tokenB.address, ERC20_ABI, signer);

      const amountAWei = ethers.parseEther(amountA);
      const amountBWei = ethers.parseEther(amountB);

      // Approve tokens
      const allowanceA = await tokenAContract.allowance(address, "ROUTER_ADDRESS");
      if (allowanceA < amountAWei) {
        const tx = await tokenAContract.approve("ROUTER_ADDRESS", amountAWei);
        await tx.wait();
      }
      const allowanceB = await tokenBContract.allowance(address, "ROUTER_ADDRESS");
      if (allowanceB < amountBWei) {
        const tx = await tokenBContract.approve("ROUTER_ADDRESS", amountBWei);
        await tx.wait();
      }

      // In production: call router.addLiquidity()
      alert("Liquidity added! (In production, this calls the Router contract)");
      setAmountA("");
      setAmountB("");
      discoverPools();
    } catch (e: any) {
      alert(`Error: ${e.reason || e.message}`);
    }
    setAddingLiquidity(false);
  };

  // Remove liquidity
  const handleRemoveLiquidity = async () => {
    if (!signer || !selectedPool) return;
    try {
      const pairContract = new ethers.Contract(selectedPool.address, PAIR_ABI, signer);
      const userLp = await pairContract.balanceOf(address);
      const removeAmount = (userLp * BigInt(removePercent)) / 100n;

      // Approve LP tokens
      await (await pairContract.approve(selectedPool.address, removeAmount)).wait();

      // In production: call router.removeLiquidity()
      alert("Liquidity removed! (In production, this calls the Router contract)");
      discoverPools();
    } catch (e: any) {
      alert(`Error: ${e.reason || e.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Liquidity Pools</h1>
          <span className="mode-badge mode-dex">DEX</span>
        </div>
        {address && (
          <span className="text-xs text-gray-500">{address.slice(0, 6)}...{address.slice(-4)}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["pools", "add", "remove"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "bg-[#111827] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            {t === "pools" ? "All Pools" : t === "add" ? "Add Liquidity" : "Remove Liquidity"}
          </button>
        ))}
      </div>

      {/* All Pools */}
      {tab === "pools" && (
        <div className="card p-5">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Discovering pools on-chain...</div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-sm mb-2">No pools found on this network</div>
              <div className="text-gray-600 text-xs">Create the first pool by adding liquidity</div>
            </div>
          ) : (
            <div className="space-y-2">
              {pools.map((pool, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-[#0a0e17] flex items-center justify-center text-[10px] font-bold text-orange-400">{pool.symbol0[0]}</div>
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-[#0a0e17] flex items-center justify-center text-[10px] font-bold text-blue-400">{pool.symbol1[0]}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{pool.symbol0}/{pool.symbol1}</div>
                      <div className="text-[10px] text-gray-500">Pool #{pool.pairIndex}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">TVL</div>
                    <div className="text-sm text-white">${(parseFloat(pool.reserve0) * 1 + parseFloat(pool.reserve1) * 1).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Your LP</div>
                    <div className="text-sm text-white">{parseFloat(pool.userBalance).toFixed(4)}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedPool(pool); setTab("remove"); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white border border-white/5"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Liquidity */}
      {tab === "add" && (
        <div className="card p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">Add Liquidity</h3>

          {/* Token A */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Token A</label>
            <div className="flex gap-2">
              <select
                value={tokenA.symbol}
                onChange={(e) => setTokenA(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white"
              >
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-center my-2">
            <button
              onClick={() => { const temp = tokenA; setTokenA(tokenB); setTokenB(temp); }}
              className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              ↕
            </button>
          </div>

          {/* Token B */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Token B</label>
            <div className="flex gap-2">
              <select
                value={tokenB.symbol}
                onChange={(e) => setTokenB(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
                className="bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white"
              >
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <input
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-[#0a0e17] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Pool share */}
          {amountA && amountB && (
            <div className="mb-4 p-3 bg-[#0a0e17] rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-gray-500"><span>Pool Share</span><span className="text-white">~0.01%</span></div>
              <div className="flex justify-between text-gray-500"><span>{tokenA.symbol} deposited</span><span className="text-white">{amountA}</span></div>
              <div className="flex justify-between text-gray-500"><span>{tokenB.symbol} deposited</span><span className="text-white">{amountB}</span></div>
            </div>
          )}

          <button
            onClick={handleAddLiquidity}
            disabled={!amountA || !amountB || addingLiquidity || !address}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!address ? "Connect Wallet" : addingLiquidity ? "Adding..." : "Add Liquidity"}
          </button>
        </div>
      )}

      {/* Remove Liquidity */}
      {tab === "remove" && (
        <div className="card p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">Remove Liquidity</h3>

          {selectedPool ? (
            <>
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#0a0e17] rounded-lg">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400">{selectedPool.symbol0[0]}</div>
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">{selectedPool.symbol1[0]}</div>
                </div>
                <span className="text-sm text-white">{selectedPool.symbol0}/{selectedPool.symbol1}</span>
                <span className="text-xs text-gray-500 ml-auto">Your LP: {parseFloat(selectedPool.userBalance).toFixed(4)}</span>
              </div>

              {/* Slider */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-2 block">Remove amount: {removePercent}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={removePercent}
                  onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              <button
                onClick={handleRemoveLiquidity}
                disabled={!address}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {!address ? "Connect Wallet" : "Remove Liquidity"}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Select a pool from the "All Pools" tab to remove liquidity
            </div>
          )}
        </div>
      )}
    </div>
  );
}
