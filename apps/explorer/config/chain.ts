export const CHENNAI = {
  name: 'Dot Protocol Chennai Testnet',
  shortName: 'chennai',
  chainId: 1545,
  chainIdHex: '0x609',
  rpcUrl: process.env.CHENNAI_RPC ?? 'http://127.0.0.1:8545',
  currency: { name: 'Test DOT', symbol: 'TDOT', decimals: 18 },
  dpc20: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    symbol: 'TDOT',
    decimals: 18,
    standard: 'DPC20',
  },
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000',
  validators: 7,
} as const;
