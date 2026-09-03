// Auto-generated contract addresses — do not edit manually
// Run: npx hardhat run scripts/deploy-hexchange.js --network <network>

export const CHAIN_CONFIG = {
  chennai: {
    chainId: 1545,
    chainIdHex: "0x609",
    name: "Dot Protocol Chennai Testnet",
    rpcUrl: "http://127.0.0.1:8545",
    currency: { name: "Test DOT", symbol: "TDOT", decimals: 18 },
    explorer: "https://testnet-explorer.YOUR_DOMAIN.com",
  },
  mainnet: {
    chainId: 1546,
    chainIdHex: "0x60A",
    name: "Dot Protocol Mainnet",
    rpcUrl: "http://127.0.0.1:9545",
    currency: { name: "3DOT", symbol: "3DOT", decimals: 18 },
    explorer: "https://explorer.YOUR_DOMAIN.com",
  },
} as const;

export const CONTRACTS = {
  chennai: {
    DPC20: "0x542E95FD423962505EBfb279C1361351507A0185",
    Oracle: "0x435d6A390c865De76c80c6262aD2D7a5b5D41931",
    Stabilization: "0x436A576D59f7C38BC804ED29251601Eb176f8667",
    Governance: "0xde455081D202269e8fD7B4b37bb85f1Fd81fF126",
    Bridge: "0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4",
    HexchangeFactory: "0xeABAb7FB03f13B51716b8F620Ec9151d4C7Ee3e7",
    HexchangeRouter: "0x4C0bb94B0b99cB14eBFbC8fE790533aba3b4373B",
    HexchangeEscrow: "0xeA86701A2D46316D6BE3b031Ad719Ee0d9bbc04C",
    HexchangePresale: "0x44Ca97cC50ae80Dcc513faDbFfda6e4C637692eA",
  },
  mainnet: {
    DPC20: "0x84ed5E46280c6911551925329C3af6c58e4ced56",
    Oracle: "0xAE7D6822975e9050bF3AafB823351F95eD518eeb",
    Stabilization: "0x2000fd82FEC13e6F7af9B2CA5762374E13bfa552",
    Governance: "0x002fB3bAB0544880a8e23122dE6133Ff090eAc81",
    Bridge: "0xe90813974118D9A582A011ab8fDFda57acD2AE13",
    HexchangeFactory: "0x435d6A390c865De76c80c6262aD2D7a5b5D41931",
    HexchangeRouter: "0x436A576D59f7C38BC804ED29251601Eb176f8667",
    HexchangeEscrow: "0xde455081D202269e8fD7B4b37bb85f1Fd81fF126",
    HexchangePresale: "0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4",
  },
} as const;

// Minimal ABIs for contract interaction
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "event Transfer(address indexed,address indexed,uint256)",
  "event Approval(address indexed,address indexed,uint256)",
];

export const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256) returns (uint256,uint256,uint256)",
  "function removeLiquidity(address,address,uint256,uint256,uint256,address,uint256) returns (uint256,uint256)",
  "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns (uint256[])",
  "function swapTokensForExactTokens(uint256,uint256,address[],address,uint256) returns (uint256[])",
  "function getAmountsOut(uint256,address[]) view returns (uint256[])",
  "function getAmountsIn(uint256,address[]) view returns (uint256[])",
];

export const FACTORY_ABI = [
  "function createPair(address,address) returns (address)",
  "function getPair(address,address) view returns (address)",
  "function allPairsLength() view returns (uint256)",
  "event PairCreated(address indexed,address indexed,address,uint256)",
];

export const ESCROW_ABI = [
  "function createOrder(address,uint256,uint256,address) returns (uint256)",
  "function acceptAndPay(uint256) payable",
  "function confirmAndRelease(uint256)",
  "function cancelOrder(uint256)",
  "function raiseDispute(uint256)",
  "function rateUser(address,uint256)",
  "function getOrder(uint256) view returns (tuple)",
  "function getUserOrders(address) view returns (uint256[])",
  "function getUserRating(address) view returns (uint256,uint256)",
  "event OrderCreated(uint256,address,address,uint256,uint256)",
  "event OrderFunded(uint256)",
  "event PaymentSent(uint256,address)",
  "event OrderCompleted(uint256,address,address,uint256)",
];

export const PRESALE_ABI = [
  "function buyWithETH() payable",
  "function buyWithStablecoin(uint256)",
  "function claimTokens(uint256)",
  "function currentPhase() view returns (uint8)",
  "function totalSold() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function getPhaseTimeLeft() view returns (uint256)",
  "function getUserPurchases(address) view returns (uint256[])",
  "function getClaimableAmount(uint256) view returns (uint256)",
  "event TokensPurchased(uint256,address,uint256,uint256,uint8)",
  "event TokensClaimed(address,uint256)",
];

export const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112,uint112,uint32)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function mint(address) returns (uint256)",
  "function burn(address) returns (uint256,uint256)",
  "function swap(uint256,uint256,address)",
];
