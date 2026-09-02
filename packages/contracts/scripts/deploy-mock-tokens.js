const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const MOCK_TOKENS = {
  chennai: [
    { name: "Tether USD", symbol: "USDT", decimals: 6, supply: "10000000000" },   // 10B USDT
    { name: "USD Coin", symbol: "USDC", decimals: 6, supply: "10000000000" },     // 10B USDC
    { name: "Bitcoin", symbol: "BTC", decimals: 8, supply: "2100000" },            // 2.1M BTC
    { name: "Binance Coin", symbol: "BNB", decimals: 18, supply: "200000000" },    // 200M BNB
    { name: "Ripple", symbol: "XRP", decimals: 6, supply: "100000000000" },        // 100B XRP
  ],
  mainnet: [
    { name: "Tether USD", symbol: "USDT", decimals: 6, supply: "10000000000" },
    { name: "USD Coin", symbol: "USDC", decimals: 6, supply: "10000000000" },
    { name: "Bitcoin", symbol: "BTC", decimals: 8, supply: "2100000" },
    { name: "Binance Coin", symbol: "BNB", decimals: 18, supply: "200000000" },
    { name: "Ripple", symbol: "XRP", decimals: 6, supply: "100000000000" },
  ],
};

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  const tokens = MOCK_TOKENS[network] || MOCK_TOKENS.chennai;

  console.log(`\n=== Deploying Mock Tokens on ${network} ===`);
  console.log(`Deployer: ${deployer.address}\n`);

  const deployed = {};

  for (const token of tokens) {
    console.log(`Deploying Mock${token.symbol} (${token.name}, ${token.decimals} decimals)...`);
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mock = await MockERC20.deploy(token.name, token.symbol, token.decimals);
    await mock.waitForDeployment();
    const addr = await mock.getAddress();

    // Mint supply to deployer
    const supplyWei = hre.ethers.parseUnits(token.supply, token.decimals);
    await (await mock.mint(deployer.address, supplyWei)).wait();
    console.log(`  ✅ ${token.symbol}: ${addr} (minted ${token.supply} ${token.symbol})`);

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
  const outPath = path.join(outDir, `${network}-mock-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify({ network, tokens: deployed }, null, 2));
  console.log(`\nDeployment saved to: ${outPath}`);

  console.log("\n=== Summary ===");
  for (const [sym, info] of Object.entries(deployed)) {
    console.log(`  ${sym}: ${info.address}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
