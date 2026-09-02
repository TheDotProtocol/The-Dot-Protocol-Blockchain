const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// DPC20 addresses
const NETWORK = {
  chennai: {
    dpc20: "0x542E95FD423962505EBfb279C1361351507A0185",
    factory: "0xeABAb7FB03f13B51716b8F620Ec9151d4C7Ee3e7",
    router: "0x4C0bb94B0b99cB14eBFbC8fE790533aba3b4373B",
  },
  mainnet: {
    dpc20: "0x84ed5E46280c6911551925329C3af6c58e4ced56",
    factory: "0x435d6A390c865De76c80c6262aD2D7a5b5D41931",
    router: "0x436A576D59f7C38BC804ED29251601Eb176f8667",
  },
};

async function main() {
  const network = hre.network.name;
  const config = NETWORK[network] || NETWORK.chennai;
  const [deployer] = await hre.ethers.getSigners();

  console.log(`=== Liquidity Seeding on ${network} ===\n`);

  // 1. Deploy Mock USDT (6 decimals)
  console.log("1/5 Deploying MockUSDT (6 decimals)...");
  const MockToken = await hre.ethers.getContractFactory("MockDPC20Oracle"); // reuse for simplicity — wrong ABI
  // Actually, let's deploy a proper mock ERC20
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
  await usdt.waitForDeployment();
  const usdtAddr = await usdt.getAddress();
  console.log(`   USDT: ${usdtAddr}`);

  // 2. Deploy Mock BTC (8 decimals)
  console.log("2/5 Deploying MockBTC (8 decimals)...");
  const btc = await MockERC20.deploy("Bitcoin", "BTC", 8);
  await btc.waitForDeployment();
  const btcAddr = await btc.getAddress();
  console.log(`   BTC: ${btcAddr}`);

  // 3. Deploy Mock BNB (18 decimals)
  console.log("3/5 Deploying MockBNB (18 decimals)...");
  const bnb = await MockERC20.deploy("Binance Coin", "BNB", 18);
  await bnb.waitForDeployment();
  const bnbAddr = await bnb.getAddress();
  console.log(`   BNB: ${bnbAddr}`);

  // 4. Create pairs and add liquidity
  const Factory = await hre.ethers.getContractFactory("HexchangeFactory");
  const factory = Factory.attach(config.factory);

  const Router = await hre.ethers.getContractFactory("HexchangeRouter");
  const router = Router.attach(config.router);

  const dpc20 = await hre.ethers.getContractAt("DPC20", config.dpc20);

  // Mint tokens to deployer for liquidity
  console.log("\n4/5 Minting tokens for liquidity...");
  const MINT_3DOT = hre.ethers.parseEther("10000000");   // 10M 3DOT
  const MINT_USDT = hre.ethers.parseUnits("10000000", 6); // 10M USDT
  const MINT_BTC = hre.ethers.parseUnits("500", 8);       // 500 BTC
  const MINT_BNB = hre.ethers.parseEther("100000");        // 100K BNB

  await (await dpc20.mint(deployer.address, MINT_3DOT, "Liquidity seed")).wait();
  console.log("   Minted 10M 3DOT");
  await (await usdt.mint(deployer.address, MINT_USDT)).wait();
  console.log("   Minted 10M USDT");
  await (await btc.mint(deployer.address, MINT_BTC)).wait();
  console.log("   Minted 500 BTC");
  await (await bnb.mint(deployer.address, MINT_BNB)).wait();
  console.log("   Minted 100K BNB");

  // 5. Create pairs and add liquidity
  console.log("\n5/5 Creating pairs and adding liquidity...");

  const deadline = Math.floor(Date.now() / 1000) + 600;

  // Helper: approve router for a token
  async function approveToken(tokenAddr, amount) {
    const token = await hre.ethers.getContractAt("MockERC20", tokenAddr);
    await (await token.approve(config.router, amount)).wait();
  }

  // Helper: approve DPC20 for router
  async function approveDPC20(amount) {
    await (await dpc20.approve(config.router, amount)).wait();
  }

  // --- 3DOT/USDT Pool ---
  // Price: 1 3DOT = 1 USDT
  // Ratio: 1,000,000 3DOT : 1,000,000 USDT
  console.log("\n   Creating 3DOT/USDT pool (1:1 ratio)...");
  const dot3ForPool = hre.ethers.parseEther("1000000");   // 1M 3DOT
  const usdtForPool = hre.ethers.parseUnits("1000000", 6); // 1M USDT

  await approveDPC20(dot3ForPool);
  await approveToken(usdtAddr, usdtForPool);

  // Ensure token order (lower address first)
  const [tokenA_3dot_usdt, tokenB_3dot_usdt] = config.dpc20.toLowerCase() < usdtAddr.toLowerCase()
    ? [config.dpc20, usdtAddr] : [usdtAddr, config.dpc20];
  const [amountA_3dot_usdt, amountB_3dot_usdt] = config.dpc20.toLowerCase() < usdtAddr.toLowerCase()
    ? [dot3ForPool, usdtForPool] : [usdtForPool, dot3ForPool];

  const tx1 = await router.addLiquidity(
    tokenA_3dot_usdt, tokenB_3dot_usdt,
    amountA_3dot_usdt, amountB_3dot_usdt,
    amountA_3dot_usdt, amountB_3dot_usdt,
    deployer.address, deadline
  );
  await tx1.wait();
  console.log("   3DOT/USDT pool created!");

  // --- 3DOT/BTC Pool ---
  // Price: 1 BTC = 60,000 3DOT (so 1 3DOT = $1, BTC = $60K)
  console.log("   Creating 3DOT/BTC pool...");
  const dot3ForBtc = hre.ethers.parseEther("30000000");  // 30M 3DOT
  const btcForPool = hre.ethers.parseUnits("500", 8);    // 500 BTC

  await approveDPC20(dot3ForBtc);
  await approveToken(btcAddr, btcForPool);

  const [tokenA_3dot_btc, tokenB_3dot_btc] = config.dpc20.toLowerCase() < btcAddr.toLowerCase()
    ? [config.dpc20, btcAddr] : [btcAddr, config.dpc20];
  const [amountA_3dot_btc, amountB_3dot_btc] = config.dpc20.toLowerCase() < btcAddr.toLowerCase()
    ? [dot3ForBtc, btcForPool] : [btcForPool, dot3ForBtc];

  const tx2 = await router.addLiquidity(
    tokenA_3dot_btc, tokenB_3dot_btc,
    amountA_3dot_btc, amountB_3dot_btc,
    amountA_3dot_btc, amountB_3dot_btc,
    deployer.address, deadline
  );
  await tx2.wait();
  console.log("   3DOT/BTC pool created!");

  // --- 3DOT/BNB Pool ---
  // Price: 1 BNB = 600 3DOT (BNB = $600)
  console.log("   Creating 3DOT/BNB pool...");
  const dot3ForBnb = hre.ethers.parseEther("60000000");  // 60M 3DOT
  const bnbForPool = hre.ethers.parseEther("100000");     // 100K BNB

  await approveDPC20(dot3ForBnb);
  await approveToken(bnbAddr, bnbForPool);

  const [tokenA_3dot_bnb, tokenB_3dot_bnb] = config.dpc20.toLowerCase() < bnbAddr.toLowerCase()
    ? [config.dpc20, bnbAddr] : [bnbAddr, config.dpc20];
  const [amountA_3dot_bnb, amountB_3dot_bnb] = config.dpc20.toLowerCase() < bnbAddr.toLowerCase()
    ? [dot3ForBnb, bnbForPool] : [bnbForPool, dot3ForBnb];

  const tx3 = await router.addLiquidity(
    tokenA_3dot_bnb, tokenB_3dot_bnb,
    amountA_3dot_bnb, amountB_3dot_bnb,
    amountA_3dot_bnb, amountB_3dot_bnb,
    deployer.address, deadline
  );
  await tx3.wait();
  console.log("   3DOT/BNB pool created!\n");

  // Verify prices
  console.log("Verifying prices...");
  const pricePath_usdt = config.dpc20.toLowerCase() < usdtAddr.toLowerCase()
    ? [config.dpc20, usdtAddr] : [usdtAddr, config.dpc20];
  const pricePath_btc = config.dpc20.toLowerCase() < btcAddr.toLowerCase()
    ? [config.dpc20, btcAddr] : [btcAddr, config.dpc20];
  const pricePath_bnb = config.dpc20.toLowerCase() < bnbAddr.toLowerCase()
    ? [config.dpc20, bnbAddr] : [bnbAddr, config.dpc20];

  const price1dot = hre.ethers.parseEther("1");
  const usdtOut = await router.getAmountsOut(price1dot, pricePath_usdt);
  const btcOut = await router.getAmountsOut(price1dot, pricePath_btc);
  const bnbOut = await router.getAmountsOut(price1dot, pricePath_bnb);

  console.log(`   1 3DOT = ${hre.ethers.formatUnits(usdtOut[1], 6)} USDT`);
  console.log(`   1 3DOT = ${hre.ethers.formatUnits(btcOut[1], 8)} BTC`);
  console.log(`   1 3DOT = ${hre.ethers.formatEther(bnbOut[1])} BNB`);

  // Save deployment
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const deployment = {
    network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    mockTokens: {
      USDT: { address: usdtAddr, decimals: 6 },
      BTC: { address: btcAddr, decimals: 8 },
      BNB: { address: bnbAddr, decimals: 18 },
    },
    pools: [
      { pair: "3DOT/USDT", price: "1.00" },
      { pair: "3DOT/BTC", price: "0.00001667" },
      { pair: "3DOT/BNB", price: "0.001667" },
    ],
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, `${network}-liquidity.json`), JSON.stringify(deployment, null, 2));

  console.log("\n=== Summary ===");
  console.log(`USDT: ${usdtAddr}`);
  console.log(`BTC:  ${btcAddr}`);
  console.log(`BNB:  ${bnbAddr}`);
  console.log("Pools seeded. 3DOT price set at $1 USD.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
