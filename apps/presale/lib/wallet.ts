import { CHENNAI_CHAIN } from '@/config/presale';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function getEthereum() {
  if (typeof window === 'undefined') return undefined;
  return window.ethereum;
}

export async function connectWallet(): Promise<string> {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error('MetaMask not detected');

  const accounts = (await ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  if (!accounts[0]) throw new Error('No account returned');
  return accounts[0];
}

export async function getChainId(): Promise<string> {
  const ethereum = getEthereum();
  if (!ethereum) return '';
  return (await ethereum.request({ method: 'eth_chainId' })) as string;
}

export async function switchToChennai(): Promise<void> {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error('MetaMask not detected');

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHENNAI_CHAIN.chainId }],
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: CHENNAI_CHAIN.chainId,
            chainName: CHENNAI_CHAIN.chainName,
            nativeCurrency: CHENNAI_CHAIN.nativeCurrency,
            rpcUrls: [CHENNAI_CHAIN.rpcUrl],
            blockExplorerUrls: [CHENNAI_CHAIN.blockExplorerUrl],
          },
        ],
      });
      return;
    }
    throw error;
  }
}

export async function addDpc20Token(): Promise<void> {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error('MetaMask not detected');

  await ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: CHENNAI_CHAIN.dpc20.address,
        symbol: CHENNAI_CHAIN.dpc20.symbol,
        decimals: CHENNAI_CHAIN.dpc20.decimals,
      },
    } as unknown as unknown[],
  });
}

export async function fetchTokenBalance(address: string): Promise<string> {
  const padded = address.slice(2).toLowerCase().padStart(64, '0');
  const response = await fetch(CHENNAI_CHAIN.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: CHENNAI_CHAIN.dpc20.address,
          data: `0x70a08231${padded}`,
        },
        'latest',
      ],
      id: 1,
    }),
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  const raw = BigInt(json.result || '0x0');
  return (Number(raw) / 10 ** CHENNAI_CHAIN.dpc20.decimals).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
