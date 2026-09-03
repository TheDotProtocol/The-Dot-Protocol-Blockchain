export const PRESALE_CONFIG = {
  tokenSymbol: 'DPC20',
  tokenName: 'Dot Protocol Token',
  tokenPriceUsd: 0.5,
  launchPriceUsd: 1,
  softCapUsd: 2_500_000,
  hardCapUsd: 10_000_000,
  raisedUsd: 875_000,
  minPurchaseUsd: 100,
  maxPurchaseUsd: 50_000,
  status: 'live' as const,
  whitelistRequired: true,
  paymentMethods: ['ETH', 'USDT', 'BNB'] as const,
  totalSupply: '1 Trillion',
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000',
} as const;

export const CHENNAI_CHAIN = {
  chainId: '0x609',
  chainIdDecimal: 1545,
  chainName: 'Dot Protocol Chennai Testnet',
  rpcUrl: 'http://127.0.0.1:8545',
  nativeCurrency: {
    name: 'Test DOT',
    symbol: 'TDOT',
    decimals: 18,
  },
  blockExplorerUrl: 'https://testnet-explorer.YOUR_DOMAIN.com',
  dpc20: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    symbol: 'TDOT',
    decimals: 18,
  },
} as const;
