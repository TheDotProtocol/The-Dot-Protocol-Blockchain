const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = process.env.CHENNAI_RPC || "http://127.0.0.1:8545";
const PRIVATE_KEY = "REDACTED_KEY";

const TOKENS = [
  { name: "Tether USD", symbol: "USDT", decimals: 6, supply: "10000000000" },
  { name: "USD Coin", symbol: "USDC", decimals: 6, supply: "10000000000" },
  { name: "Bitcoin", symbol: "BTC", decimals: 8, supply: "2100000" },
  { name: "Binance Coin", symbol: "BNB", decimals: 18, supply: "200000000" },
  { name: "Ripple", symbol: "XRP", decimals: 6, supply: "100000000000" },
];

const MOCKERC20_ABI = [
  "constructor(string name_, string symbol_, uint8 decimals_)",
  "function mint(address to, uint256 amount) external",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const artifact = require("../artifacts/contracts/MockERC20.sol/MockERC20.json");

  console.log("=== Deploying Mock Tokens ===");
  console.log("RPC:", RPC_URL);
  console.log("Deployer:", wallet.address);
  console.log("");

  const deployed = {};

  for (const token of TOKENS) {
    console.log(`Deploying Mock${token.symbol} (${token.decimals} decimals)...`);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy(token.name, token.symbol, token.decimals);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();

    // Mint supply
    const supply = ethers.parseUnits(token.supply, token.decimals);
    const tx = await contract.mint(wallet.address, supply);
    await tx.wait();

    // Verify
    const actualSupply = await contract.totalSupply();
    console.log(`  ✅ ${token.symbol}: ${addr} (supply: ${ethers.formatUnits(actualSupply, token.decimals)})`);

    deployed[token.symbol] = {
      address: addr,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      supply: token.supply,
    };
  }

  // Save deployment
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "chennai-mock-tokens.json");
  fs.writeFileSync(outPath, JSON.stringify({ network: "chennai", tokens: deployed }, null, 2));

  console.log("\n=== Summary ===");
  console.log(`Deployment saved to: ${outPath}`);
  for (const [sym, info] of Object.entries(deployed)) {
    console.log(`  ${sym}: ${info.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
