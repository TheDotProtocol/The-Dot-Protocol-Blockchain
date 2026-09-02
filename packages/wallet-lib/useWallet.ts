"use client";

import { useState, useEffect, useCallback } from "react";
import {
  connectMetaMask,
  switchChain,
  onWalletChange,
  formatAddress,
  type WalletState,
  type ChainId,
} from "./index";

const DEFAULT_CHAIN: ChainId = 1546; // mainnet

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    chainId: 0,
    provider: null,
    signer: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (chain: ChainId = DEFAULT_CHAIN) => {
    setLoading(true);
    setError(null);
    try {
      const state = await connectMetaMask();
      if (state.chainId !== chain) {
        await switchChain(chain);
        const updated = await connectMetaMask();
        setWallet(updated);
      } else {
        setWallet(state);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: "",
      chainId: 0,
      provider: null,
      signer: null,
    });
  }, []);

  const switchTo = useCallback(async (chain: ChainId) => {
    try {
      await switchChain(chain);
      const state = await connectMetaMask();
      setWallet(state);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Listen for changes
  useEffect(() => {
    const unsub = onWalletChange((state) => {
      if (state) {
        setWallet(state);
      } else {
        disconnect();
      }
    });
    return unsub;
  }, [disconnect]);

  return {
    ...wallet,
    loading,
    error,
    connect,
    disconnect,
    switchTo,
    formattedAddress: wallet.address ? formatAddress(wallet.address) : "",
  };
}
