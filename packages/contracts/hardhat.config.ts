import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 1545,
    },
    chennai: {
      url: process.env.CHENNAI_RPC || "http://127.0.0.1:8545",
      chainId: 1545,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC || "http://127.0.0.1:9545",
      chainId: 1546,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
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
