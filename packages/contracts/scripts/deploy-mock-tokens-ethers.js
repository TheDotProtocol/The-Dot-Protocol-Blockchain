const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// ─── C-03 FIX: No hardcoded private key — require from env ───────────
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("ERROR: DEPLOYER_PRIVATE_KEY not set in .env file");
  console.error("Create packages/contracts/.env with: DEPLOYER_PRIVATE_KEY=0x...");
  process.exit(1);
}

const RPC_URL = process.env.RPC_URL || "http://localhost:8545";

// Known addresses on testnet
const ADDRESSES = {
  TDOT: "0x542E95FD423962505EBfb279C1361351507A0185",
  Factory: "0xA1b2C3d4E5f6789012345678901234567890AbCd", // will be read from deploy
  Router: "0xB2c3D4e5F67890123456789012345678901aBcDe",
};

const TOKENS_TO_DEPLOY = [
  { name: "Mock USDT", symbol: "USDT", supply: "100000000000000000000000000000000000000" },
  { name: "Mock USDC", symbol: "USDC", supply: "100000000000000000000000000000000000000" },
  { name: "Mock BTC", symbol: "BTC", supply: "21000000000000000000000000" },
  { name: "Mock BNB", symbol: "BNB", supply: "200000000000000000000000000" },
  { name: "Mock XRP", symbol: "XRP", supply: "100000000000000000000000000" },
];

const MOCK_ERC20_ABI = [
  "constructor(string name, string symbol, uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("=== Deploying Mock Tokens ===");
  console.log("Deployer:", wallet.address);
  console.log("Network:", RPC_URL);

  const balance = await provider.getBalance(wallet.address);
  console.log("ETH balance:", ethers.formatEther(balance));

  const addresses = {};

  for (const token of TOKENS_TO_DEPLOY) {
    console.log(`\nDeploying ${token.name} (${token.symbol})...`);
    
    const factory = new ethers.ContractFactory(MOCK_ERC20_ABI, 
      `constructor(string memory name, string memory symbol, uint256 initialSupply) {
        ERC20(name, symbol);
        _mint(msg.sender, initialSupply);
      }`, 
      wallet
    );
    
    const contract = await factory.deploy(token.name, token.symbol, token.supply);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    addresses[token.symbol] = addr;
    console.log(`  ${token.symbol} deployed at: ${addr}`);
  }

  // Save addresses
  const outputPath = path.join(__dirname, "..", "deployed-mock-tokens.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("\n=== Addresses saved to", outputPath, "===");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
