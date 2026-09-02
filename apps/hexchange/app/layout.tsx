"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
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
        // WalletConnect integration
        // In production, use @web3modal/ethers
        // For now, show instructions
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
      <body className="bg-[#0a0e17] text-white min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-500">Hex</span>
            <span className="text-xl font-semibold">change</span>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-2">Hybrid DEX</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Swap</a>
            <a href="/pool" className="hover:text-white transition-colors">Pool</a>
            <a href="/p2p" className="hover:text-white transition-colors">P2P</a>
            {address ? (
              <div className="flex items-center gap-3">
                {ci && (
                  <span className={`text-xs px-2 py-1 rounded-full ${chainId === 1546 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {ci.name}
                  </span>
                )}
                <span className="text-xs text-gray-500">{parseFloat(balance).toFixed(3)} {ci?.currency}</span>
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  disabled={connecting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Wallet Connect Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
            <div className="bg-[#1f2937] rounded-2xl p-6 w-96 border border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4 text-center">Connect Wallet</h3>

              <button
                onClick={() => connect("metamask")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2a2f3a] hover:bg-gray-700 transition-colors mb-3"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">🦊</div>
                <div className="text-left">
                  <div className="font-medium">MetaMask</div>
                  <div className="text-xs text-gray-400">Browser extension wallet</div>
                </div>
              </button>

              <button
                onClick={() => connect("walletconnect")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2a2f3a] hover:bg-gray-700 transition-colors mb-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">🔗</div>
                <div className="text-left">
                  <div className="font-medium">WalletConnect</div>
                  <div className="text-xs text-gray-400">Scan with mobile wallet</div>
                </div>
              </button>

              <button
                onClick={() => connect("walletconnect")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2a2f3a] hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">💎</div>
                <div className="text-left">
                  <div className="font-medium">3Dot Wallet</div>
                  <div className="text-xs text-gray-400">Dot Protocol native wallet</div>
                </div>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By connecting, you agree to the Terms of Service
              </p>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
