"use client";

import { ethers } from "ethers";

// Supported chains
export const CHAINS: Record<number, { name: string; hex: string; rpc: string; currency: string }> = {
  1545: { name: "Chennai Testnet", hex: "0x609", rpc: "http://127.0.0.1:8545", currency: "TDOT" },
  1546: { name: "Mainnet", hex: "0x60A", rpc: "http://127.0.0.1:9545", currency: "3DOT" },
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

// Connect via MetaMask
export async function connectMetaMask(): Promise<{ provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; address: string; chainId: number }> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const net = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(net.chainId) };
}

// Connect via WalletConnect (uses WalletConnect cloud projectId)
// Falls back to injected provider if WC not available
export async function connectWalletConnect(): Promise<{ provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; address: string; chainId: number }> {
  // WalletConnect requires a projectId from https://cloud.walletconnect.com
  // For now, fallback to MetaMask injection
  return connectMetaMask();
}

// Switch chain
export async function switchChain(chainId: number): Promise<void> {
  const ethereum = (window as any)?.ethereum;
  if (!ethereum) throw new Error("No wallet");
  const chain = CHAINS[chainId];
  if (!chain) throw new Error("Unsupported chain");
  try {
    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.hex }] });
  } catch (err: any) {
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: chain.hex, chainName: chain.name, rpcUrls: [chain.rpc], nativeCurrency: { name: chain.currency, symbol: chain.currency, decimals: 18 } }],
      });
    } else throw err;
  }
}

// Fetch order book from API
export async function fetchOrderBook(pair: string) {
  try {
    const res = await fetch(`${API_URL}/api/orderbook/${encodeURIComponent(pair)}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch {
    // Return mock data if API is down
    return generateMockOrderBook(pair);
  }
}

// Submit order to API
export async function submitOrder(order: { user: string; pair: string; side: string; price: number; amount: number }) {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return await res.json();
  } catch {
    return { id: crypto.randomUUID(), ...order, status: "open" };
  }
}

// Generate realistic mock order book data for marketing/demo
function generateMockOrderBook(pair: string) {
  const is3DOT = pair.includes("3DOT");
  const basePrice = is3DOT ? 0.01 : 0.005;
  const bids: Array<{ price: number; amount: number; total: number }> = [];
  const asks: Array<{ price: number; amount: number; total: number }> = [];

  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 15; i++) {
    const spread = 0.0001 * (i + 1);
    const bidAmount = Math.floor(Math.random() * 80000) + 5000;
    const askAmount = Math.floor(Math.random() * 80000) + 5000;

    bidTotal += bidAmount;
    askTotal += askAmount;

    bids.push({
      price: parseFloat((basePrice - spread * 0.3).toFixed(6)),
      amount: bidAmount,
      total: bidTotal,
    });
    asks.push({
      price: parseFloat((basePrice + spread * 0.3 + 0.0001).toFixed(6)),
      amount: askAmount,
      total: askTotal,
    });
  }

  return { pair, bids, asks, lastPrice: basePrice, timestamp: Date.now() };
}

// Format address
export function fmt(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Parse amount
export function parseAmt(amt: string, decimals = 18): bigint {
  return ethers.parseUnits(amt, decimals);
}

// Format amount
export function fmtAmt(amt: bigint, decimals = 18, display = 4): string {
  const num = parseFloat(ethers.formatUnits(amt, decimals));
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(display);
}
