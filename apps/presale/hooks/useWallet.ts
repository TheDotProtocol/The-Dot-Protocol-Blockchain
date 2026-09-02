'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHENNAI_CHAIN } from '@/config/presale';
import {
  addDpc20Token,
  connectWallet,
  fetchTokenBalance,
  getChainId,
  getEthereum,
  switchToChennai,
} from '@/lib/wallet';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const isCorrectNetwork = chainId === CHENNAI_CHAIN.chainId;

  const refresh = useCallback(async (addr?: string | null) => {
    const current = addr ?? address;
    const id = await getChainId();
    setChainId(id || null);

    if (current && id === CHENNAI_CHAIN.chainId) {
      try {
        const bal = await fetchTokenBalance(current);
        setTokenBalance(bal);
      } catch {
        setTokenBalance(null);
      }
    } else {
      setTokenBalance(null);
    }
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setStatus('');
    try {
      const account = await connectWallet();
      setAddress(account);
      await switchToChennai();
      await addDpc20Token();
      setStatus('Wallet connected on Chennai testnet.');
      await refresh(account);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setTokenBalance(null);
    setStatus('');
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) return;

    const onAccounts = (accounts: unknown) => {
      const list = accounts as string[];
      if (list[0]) {
        setAddress(list[0]);
        refresh(list[0]);
      } else {
        disconnect();
      }
    };

    const onChain = () => refresh();

    ethereum.on('accountsChanged', onAccounts);
    ethereum.on('chainChanged', onChain);

    return () => {
      ethereum.removeListener?.('accountsChanged', onAccounts);
      ethereum.removeListener?.('chainChanged', onChain);
    };
  }, [disconnect, refresh]);

  return {
    address,
    chainId,
    tokenBalance,
    status,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    refresh,
    setStatus,
  };
}
