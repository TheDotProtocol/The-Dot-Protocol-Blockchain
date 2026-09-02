const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const DPC20 = "0x84ed5E46280c6911551925329C3af6c58e4ced56";
const ROUTER = "0x436A576D59f7C38BC804ED29251601Eb176f8667";
const FACTORY = "0x435d6A390c865De76c80c6262aD2D7a5b5D41931";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== Mainnet Liquidity Seeding ===\n");

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");

  console.log("1/6 Deploying mock tokens...");
  const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
  await usdt.waitForDeployment();
  const usdtAddr = await usdt.getAddress();
  console.log("  USDT:", usdtAddr);

  const btc = await MockERC20.deploy("Bitcoin", "BTC", 8);
  await btc.waitForDeployment();
  const btcAddr = await btc.getAddress();
  console.log("  BTC:", btcAddr);

  const bnb = await MockERC20.deploy("Binance Coin", "BNB", 18);
  await bnb.waitForDeployment();
  const bnbAddr = await bnb.getAddress();
  console.log("  BNB:", bnbAddr);

  const dpc20 = await hre.ethers.getContractAt("DPC20", DPC20);
  const factory = await hre.ethers.getContractAt("HexchangeFactory", FACTORY);
  const router = await hre.ethers.getContractAt("HexchangeRouter", ROUTER);

  console.log("\n2/6 Minting tokens...");
  await (await dpc20.mint(deployer.address, hre.ethers.parseEther("100000000"), "Liquidity seed")).wait();
  console.log("  100M 3DOT");
  await (await usdt.mint(deployer.address, hre.ethers.parseUnits("10000000", 6))).wait();
  console.log("  10M USDT");
  await (await btc.mint(deployer.address, hre.ethers.parseUnits("500", 8))).wait();
  console.log("  500 BTC");
  await (await bnb.mint(deployer.address, hre.ethers.parseEther("100000"))).wait();
  console.log("  100K BNB");

  const deadline = Math.floor(Date.now() / 1000) + 600;

  async function createAndFund(name, tokenAddr, dot3Amt, tokenAmt, tokenDec) {
    console.log(`\n  Creating ${name}...`);
    await (await factory.createPair(DPC20, tokenAddr)).wait();
    await (await dpc20.approve(ROUTER, dot3Amt)).wait();
    await (await hre.ethers.getContractAt("MockERC20", tokenAddr).approve(ROUTER, tokenAmt)).wait();
    const [ta, tb] = DPC20.toLowerCase() < tokenAddr.toLowerCase() ? [DPC20, tokenAddr] : [tokenAddr, DPC20];
    const [aa, ab] = DPC20.toLowerCase() < tokenAddr.toLowerCase() ? [dot3Amt, tokenAmt] : [tokenAmt, dot3Amt];
    await (await router.addLiquidity(ta, tb, aa, ab, aa, ab, deployer.address, deadline)).wait();
    console.log(`  ${name} pool created!`);
  }

  console.log("\n3/6 Creating pools...");
  await createAndFund("3DOT/USDT", usdtAddr, hre.ethers.parseEther("10000000"), hre.ethers.parseUnits("10000000", 6), 6);
  await createAndFund("3DOT/BTC", btcAddr, hre.ethers.parseEther("30000000"), hre.ethers.parseUnits("500", 8), 8);
  await createAndFund("3DOT/BNB", bnbAddr, hre.ethers.parseEther("60000000"), hre.ethers.parseEther("100000"), 18);

  // Save
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const deployment = {
    network: "mainnet", chainId: "1546",
    mockTokens: { USDT: { address: usdtAddr, decimals: 6 }, BTC: { address: btcAddr, decimals: 8 }, BNB: { address: bnbAddr, decimals: 18 } },
    pools: [{ pair: "3DOT/USDT", price: "1.00" }, { pair: "3DOT/BTC", price: "0.0000166" }, { pair: "3DOT/BNB", price: "0.00166" }],
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, "mainnet-liquidity.json"), JSON.stringify(deployment, null, 2));

  console.log("\n=== Summary ===");
  console.log(`USDT: ${usdtAddr}`);
  console.log(`BTC:  ${btcAddr}`);
  console.log(`BNB:  ${bnbAddr}`);
  console.log("All 3 pools seeded. 3DOT price set at $1 USD.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
