import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// ─── Multi-chain Network Configuration ────────────────────────────
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    // ─── Dot Protocol Chains ─────────────────────────────────────
    chennai: {
      url: "http://localhost:8545",
      chainId: 1545,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 0,
    },
    mainnet: {
      url: "http://localhost:9545",
      chainId: 1546,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 0,
    },

    // ─── Ethereum ────────────────────────────────────────────────
    // Sepolia Testnet (free faucets available)
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    // Ethereum Mainnet
    ethereum: {
      url: process.env.ETHEREUM_RPC || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },

    // ─── Binance Smart Chain ─────────────────────────────────────
    // BSC Testnet (free faucets available)
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    // BSC Mainnet
    bsc: {
      url: process.env.BSC_RPC || "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },

    // ─── Polygon ─────────────────────────────────────────────────
    // Amoy Testnet (new Polygon testnet)
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
    },
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      chainId: 137,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
    },

    // ─── Arbitrum (L2 Ethereum) ──────────────────────────────────
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 100000000, // 0.1 gwei
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
