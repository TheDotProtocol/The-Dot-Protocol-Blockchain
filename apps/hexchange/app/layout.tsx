"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import "./globals.css";

const CHAINS: Record<number, { name: string; hex: string; rpc: string; currency: string }> = {
  1545: { name: "Chennai Testnet", hex: "0x609", rpc: "http://127.0.0.1:8545", currency: "TDOT" },
  1546: { name: "Mainnet", hex: "0x60A", rpc: "http://127.0.0.1:9545", currency: "3DOT" },
};

type WalletType = "metamask" | "walletconnect" | null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(0);
  const [balance, setBalance] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"dex" | "cex">("dex");

  const connect = async (type: WalletType = "metamask") => {
    setConnecting(true);
    setShowModal(false);
    try {
      if (type === "metamask") {
        if (!(window as any)?.ethereum) { alert("Please install MetaMask"); return; }
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        const net = await provider.getNetwork();
        const bal = await provider.getBalance(addr);
        setAddress(addr);
        setChainId(Number(net.chainId));
        setBalance(ethers.formatEther(bal));

        if (Number(net.chainId) !== 1546) {
          try {
            await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x60A" }] });
          } catch {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{ chainId: "0x60A", chainName: "Dot Protocol Mainnet", rpcUrls: ["http://127.0.0.1:9545"], nativeCurrency: { name: "3DOT", symbol: "3DOT", decimals: 18 } }],
            });
          }
          const p2 = new ethers.BrowserProvider((window as any).ethereum);
          const s2 = await p2.getSigner();
          const a2 = await s2.getAddress();
          const b2 = await p2.getBalance(a2);
          setAddress(a2); setChainId(1546); setBalance(ethers.formatEther(b2));
        }
      } else if (type === "walletconnect") {
        alert("WalletConnect: In production, this opens the WalletConnect modal.\nFor demo, please use MetaMask with the Dot Protocol network.");
        setConnecting(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;
    const h = (accounts: string[]) => { if (accounts.length > 0) connect(); else { setAddress(""); setChainId(0); setBalance(""); } };
    const c = () => connect();
    eth.on("accountsChanged", h);
    eth.on("chainChanged", c);
    return () => { eth.removeListener("accountsChanged", h); eth.removeListener("chainChanged", c); };
  }, []);

  const ci = CHAINS[chainId];

  return (
    <html lang="en">
      <body className="bg-[#05080f] text-white min-h-screen">
        {/* Top Bar */}
        <nav className="border-b border-white/5 px-6 py-3 flex items-center justify-between bg-[#0a0e17]/80 backdrop-blur-xl sticky top-0 z-50">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/logos/hexchange-logo-dark.png"
                alt="Hexchange"
                width={140}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </a>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 font-medium">
              HYBRID EXCHANGE
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/" className="nav-link">Swap</a>
            <a href="/trade" className="nav-link">Trade</a>
            <a href="/pool" className="nav-link">Pool</a>
            <a href="/p2p" className="nav-link">P2P</a>
            <a href="/portfolio" className="nav-link">Portfolio</a>
            <a href="/presale" className="nav-link">Presale</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* CEX/DEX Mode Toggle */}
            <div className="flex items-center bg-[#111827] rounded-lg p-0.5 border border-white/5">
              <button
                onClick={() => setMode("dex")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "dex"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                DEX
              </button>
              <button
                onClick={() => setMode("cex")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "cex"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                CEX
              </button>
            </div>

            {/* Network indicator */}
            {address && ci && (
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                chainId === 1546 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}>
                {ci.name}
              </span>
            )}

            {/* Connect / Wallet */}
            {address ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{parseFloat(balance).toFixed(3)} {ci?.currency}</span>
                <button className="bg-[#1f2937] hover:bg-[#2a3441] px-3 py-2 rounded-lg text-xs font-mono transition-colors border border-white/5">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={connecting}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </nav>

        {/* Wallet Connect Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
            <div className="bg-[#111827] rounded-2xl p-6 w-96 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center mb-4">
                <Image src="/logos/hexchange-logo-dark.png" alt="Hexchange" width={120} height={28} className="h-7 w-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-4 text-center">Connect Wallet</h3>

              <button
                onClick={() => connect("metamask")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1a1f2e] hover:bg-[#222838] transition-colors mb-3 border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-xl">🦊</div>
                <div className="text-left">
                  <div className="font-medium text-sm">MetaMask</div>
                  <div className="text-xs text-gray-500">Browser extension wallet</div>
                </div>
              </button>

              <button
                onClick={() => connect("walletconnect")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1a1f2e] hover:bg-[#222838] transition-colors mb-3 border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-xl">🔗</div>
                <div className="text-left">
                  <div className="font-medium text-sm">WalletConnect</div>
                  <div className="text-xs text-gray-500">Scan with mobile wallet</div>
                </div>
              </button>

              <button
                onClick={() => connect("walletconnect")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1a1f2e] hover:bg-[#222838] transition-colors border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-xl">💎</div>
                <div className="text-left">
                  <div className="font-medium text-sm">3Dot Wallet</div>
                  <div className="text-xs text-gray-500">Dot Protocol native wallet</div>
                </div>
              </button>

              <p className="text-[10px] text-gray-600 text-center mt-4">
                By connecting, you agree to the Terms of Service
              </p>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logos/hexchange-logo-dark.png" alt="Hexchange" width={100} height={24} className="h-5 w-auto opacity-40" />
              <span className="text-xs text-gray-600">The World&apos;s First True Hybrid Crypto Exchange</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400">Terms</a>
              <a href="#" className="hover:text-gray-400">Privacy</a>
              <a href="#" className="hover:text-gray-400">Docs</a>
              <a href="#" className="hover:text-gray-400">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
