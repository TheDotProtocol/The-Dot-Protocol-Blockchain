import { ethers } from "ethers";

// Chain configs
export const CHAINS = {
  1545: {
    chainId: "0x609",
    chainName: "Dot Protocol Chennai Testnet",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: { name: "Test DOT", symbol: "TDOT", decimals: 18 },
    blockExplorerUrls: ["https://testnet-explorer.YOUR_DOMAIN.com"],
  },
  1546: {
    chainId: "0x60A",
    chainName: "Dot Protocol Mainnet",
    rpcUrls: ["http://127.0.0.1:9545"],
    nativeCurrency: { name: "3DOT", symbol: "3DOT", decimals: 18 },
    blockExplorerUrls: ["https://explorer.YOUR_DOMAIN.com"],
  },
} as const;

export type ChainId = keyof typeof CHAINS;

// Wallet state
export interface WalletState {
  connected: boolean;
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

// Connect to MetaMask
export async function connectMetaMask(): Promise<WalletState> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }

  const ethereum = (window as any).ethereum;
  const provider = new ethers.BrowserProvider(ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return { connected: true, address, chainId, provider, signer };
}

// Switch chain
export async function switchChain(chainId: ChainId): Promise<void> {
  const ethereum = (window as any).ethereum;
  if (!ethereum) throw new Error("No wallet");

  const chainConfig = CHAINS[chainId];
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chainConfig],
      });
    } else {
      throw error;
    }
  }
}

// Get contract instance
export function getContract(
  address: string,
  abi: any[],
  signerOrProvider: ethers.JsonRpcSigner | ethers.BrowserProvider
): ethers.Contract {
  return new ethers.Contract(address, abi, signerOrProvider);
}

// Format address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format token amount
export function formatAmount(amount: bigint, decimals: number = 18, displayDecimals: number = 4): string {
  const formatted = ethers.formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(displayDecimals);
}

// Parse token amount
export function parseAmount(amount: string, decimals: number = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}

// Listen for account/chain changes
export function onWalletChange(callback: (state: WalletState | null) => void): () => void {
  const ethereum = (window as any).ethereum;
  if (!ethereum) return () => {};

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      callback(null);
    } else {
      const state = await connectMetaMask();
      callback(state);
    }
  };

  const handleChainChanged = async () => {
    const state = await connectMetaMask();
    callback(state);
  };

  ethereum.on("accountsChanged", handleAccountsChanged);
  ethereum.on("chainChanged", handleChainChanged);

  return () => {
    ethereum.removeListener("accountsChanged", handleAccountsChanged);
    ethereum.removeListener("chainChanged", handleChainChanged);
  };
}
