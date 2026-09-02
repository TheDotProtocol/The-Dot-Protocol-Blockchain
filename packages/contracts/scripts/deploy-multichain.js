/**
 * Multi-Chain Deployment Script for The Dot Protocol
 *
 * Deploys DPC20 + Hexchange to:
 * - Ethereum Sepolia (testnet)
 * - BSC Testnet
 * - Polygon Amoy (testnet)
 *
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy-multichain.js --network sepolia
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy-multichain.js --network bscTestnet
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy-multichain.js --network polygonAmoy
 *
 * Prerequisites:
 *   - Fund deployer wallet with testnet ETH/BNB/MATIC from faucets
 *   - Sepolia faucet: https://sepoliafaucet.com
 *   - BSC faucet: https://testnet.bnbchain.org/faucet-smart
 *   - Polygon faucet: https://faucet.polygon.technology
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  console.log("═══════════════════════════════════════════════");
  console.log("  DOT PROTOCOL — Multi-Chain Deployment");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Network: ${networkName} (Chain ID: ${chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`  Balance: ${ethers.formatEther(balance)} native token`);
  console.log("═══════════════════════════════════════════════\n");

  if (balance === 0n) {
    console.error("❌ Deployer has no balance! Fund it from a faucet first.");
    process.exit(1);
  }

  const deployed = {};

  // 1. Deploy DPC20
  console.log("--- 1/5 Deploying DPC20 ---");
  const DPC20 = await ethers.getContractFactory("DPC20");
  const dpc20 = await DPC20.deploy();
  await dpc20.waitForDeployment();
  deployed.DPC20 = await dpc20.getAddress();
  console.log(`  ✅ DPC20: ${deployed.DPC20}`);

  // 2. Deploy Factory
  console.log("--- 2/5 Deploying HexchangeFactory ---");
  const Factory = await ethers.getContractFactory("HexchangeFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  deployed.Factory = await factory.getAddress();
  console.log(`  ✅ Factory: ${deployed.Factory}`);

  // 3. Deploy Router
  console.log("--- 3/5 Deploying HexchangeRouter ---");
  const Router = await ethers.getContractFactory("HexchangeRouter");
  const router = await Router.deploy(deployed.Factory);
  await router.waitForDeployment();
  deployed.Router = await router.getAddress();
  console.log(`  ✅ Router: ${deployed.Router}`);

  // 4. Deploy Oracle
  console.log("--- 4/5 Deploying DecentralizedOracle ---");
  const Oracle = await ethers.getContractFactory("DecentralizedOracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();
  deployed.Oracle = await oracle.getAddress();
  console.log(`  ✅ Oracle: ${deployed.Oracle}`);

  // 5. Deploy Escrow
  console.log("--- 5/5 Deploying HexchangeEscrow ---");
  const Escrow = await ethers.getContractFactory("HexchangeEscrow");
  const escrow = await Escrow.deploy(deployer.address, 50); // 0.5% fee
  await escrow.waitForDeployment();
  deployed.Escrow = await escrow.getAddress();
  console.log(`  ✅ Escrow: ${deployed.Escrow}`);

  // 6. Deploy GnosisSafe
  console.log("--- Bonus: Deploying GnosisSafeL2 ---");
  const signers = [
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000004",
    "0x0000000000000000000000000000000000000005",
  ];
  const Safe = await ethers.getContractFactory("GnosisSafeL2");
  const safe = await Safe.deploy(signers, 3, signers[0]);
  await safe.waitForDeployment();
  deployed.Multisig = await safe.getAddress();
  console.log(`  ✅ Multisig: ${deployed.Multisig}`);

  // Save deployment
  const output = {
    network: networkName,
    chainId: chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: deployed,
  };

  const dir = path.join(__dirname, `../deployments`);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${networkName}-${chainId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));

  console.log("\n═══════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(JSON.stringify(deployed, null, 2));
  console.log(`\n📁 Saved to: ${filePath}`);
  console.log("\n⚠️  NEXT STEPS:");
  console.log("   1. Verify contracts on block explorer");
  console.log("   2. Transfer admin roles to multisig");
  console.log("   3. Mint initial supply");
  console.log("   4. Create liquidity pools");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
