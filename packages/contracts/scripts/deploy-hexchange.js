const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const NETWORK_TOKENS = {
  chennai: { presaleToken: "0x542E95FD423962505EBfb279C1361351507A0185" },
  mainnet: { presaleToken: "0x84ed5E46280c6911551925329C3af6c58e4ced56" },
};

async function main() {
  const network = hre.network.name;
  const meta = NETWORK_TOKENS[network] || NETWORK_TOKENS.chennai;
  const [deployer] = await hre.ethers.getSigners();

  console.log("=== Hexchange Deployment ===");
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}\n`);

  // 1. Factory
  console.log("1/4 HexchangeFactory...");
  const Factory = await hre.ethers.getContractFactory("HexchangeFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log(`   ${factoryAddr}`);

  // 2. Router
  console.log("2/4 HexchangeRouter...");
  const Router = await hre.ethers.getContractFactory("HexchangeRouter");
  const router = await Router.deploy(factoryAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   ${routerAddr}`);

  // 3. Escrow
  console.log("3/4 HexchangeEscrow...");
  const Escrow = await hre.ethers.getContractFactory("HexchangeEscrow");
  const escrow = await Escrow.deploy(deployer.address, 50);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log(`   ${escrowAddr}`);

  // 4. Presale
  console.log("4/4 HexchangePresale...");
  const Presale = await hre.ethers.getContractFactory("HexchangePresale");
  const presale = await Presale.deploy(meta.presaleToken, meta.presaleToken, deployer.address);
  await presale.waitForDeployment();
  const presaleAddr = await presale.getAddress();
  console.log(`   ${presaleAddr}`);

  // Configure presale
  console.log("\nConfiguring presale...");
  const now = Math.floor(Date.now() / 1000);
  await (await presale.configurePhases(
    hre.ethers.parseEther("0.000005"),
    hre.ethers.parseEther("0.000008"),
    hre.ethers.parseEther("0.00001"),
    hre.ethers.parseEther("1000"),
    hre.ethers.parseEther("100"),
    hre.ethers.parseEther("10000000"),
    now, now + 7 * 24 * 3600,
    now + 7 * 24 * 3600, now + 14 * 24 * 3600,
    now + 14 * 24 * 3600, now + 21 * 24 * 3600,
    2000, 6
  )).wait();
  await (await presale.startPresale()).wait();
  console.log("   Presale started (Early Bird)\n");

  // Save
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const deployment = {
    network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      HexchangeFactory: { address: factoryAddr },
      HexchangeRouter: { address: routerAddr },
      HexchangeEscrow: { address: escrowAddr },
      HexchangePresale: { address: presaleAddr },
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, `${network}-hexchange.json`), JSON.stringify(deployment, null, 2));

  console.log("=== Summary ===");
  console.log(`Factory:  ${factoryAddr}`);
  console.log(`Router:   ${routerAddr}`);
  console.log(`Escrow:   ${escrowAddr}`);
  console.log(`Presale:  ${presaleAddr}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
