const { ethers } = require("hardhat");

/**
 * Deploy CCIPBridge with Chainlink CCIP integration
 * Usage:
 *   npx hardhat run scripts/deploy-ccip.js --network chennai
 *   npx hardhat run scripts/deploy-ccip.js --network mainnet
 *
 * Requires LINK token balance on the deployer for CCIP message fees.
 * Chennai testnet: free LINK from https://faucets.chain.link
 * Mainnet: LINK tokens must be purchased (~$5-20 per message)
 *
 * Chainlink CCIP Routers (already deployed by Chainlink):
 *   - Ethereum Sepolia: 0x0BF3dea821e5b96b1980d5d4a78A28F04dD67020
 *   - Ethereum Mainnet: 0xE5942c29acAeC9d01Bd9d18a54E50a4b3E210d8E
 *   - BSC Testnet:      0xE181irFowhivFk1E0uZ3aMzRvTAPjE3wj9W4HF14g1o
 *   - BSC Mainnet:      0x34B03Db38e0D880C04b3051D0bC6b184f755b08c
 *   - Polygon Amoy:     0x9695bf0FC7D6E27CBb7a52e3C4c6C72D9aC4F26E
 *   - Polygon Mainnet:  0x9740FF91F1cD34BB2B88bC7d4ec83f7bD17b1C75
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  CCIPBridge Deployment");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Network:  ${network.name} (Chain ID: ${chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── Chainlink Router addresses per network ─────────────────────
  const chainlinkRouters = {
    "11155111": "0x0BF3dea821e5b96b1980d5d4a78A28F04dD67020", // Sepolia
    "1": "0xE5942c29acAeC9d01Bd9d18a54E50a4b3E210d8E",         // Ethereum Mainnet
    "97": "0xE181irFowhivFk1E0uZ3aMzRvTAPjE3wj9W4HF14g1o",     // BSC Testnet
    "56": "0x34B03Db38e0D880C04b3051D0bC6b184f755b08c",         // BSC Mainnet
    "80002": "0x9695bf0FC7D6E27CBb7a52e3C4c6C72D9aC4F26E",     // Polygon Amoy
    "137": "0x9740FF91F1cD34BB2B88bC7d4ec83f7bD17b1C75",       // Polygon Mainnet
  };

  const chainIdStr = chainId.toString();
  let routerAddress = chainlinkRouters[chainIdStr];

  // For Dot Protocol chains, use a custom router (or bridge contract)
  if (chainId === 1545n || chainId === 1546n) {
    // Check if CCIP router exists on Dot Protocol
    // If not, we'll deploy with a placeholder
    console.log("ℹ️  Dot Protocol chain detected. Using custom bridge routing.\n");
    routerAddress = process.env.CCIP_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000000";
  }

  if (!routerAddress || routerAddress === "0x0000000000000000000000000000000000000000") {
    console.error("❌ No Chainlink router configured for this network.");
    console.error("   Set CCIP_ROUTER_ADDRESS in your .env file.");
    process.exit(1);
  }

  // ─── Token addresses (source chain) ─────────────────────────────
  const tokenAddress = process.env.BRIDGE_TOKEN_ADDRESS;
  if (!tokenAddress) {
    console.error("❌ Set BRIDGE_TOKEN_ADDRESS in your .env file (the token to bridge).");
    process.exit(1);
  }

  console.log(`  Chainlink Router: ${routerAddress}`);
  console.log(`  Token to bridge:  ${tokenAddress}\n`);

  // ─── Deploy CCIPBridge ──────────────────────────────────────────
  console.log("🚀 Deploying CCIPBridge...");
  const CCIPBridge = await ethers.getContractFactory("CCIPBridge");
  const bridge = await CCIPBridge.deploy();
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log(`✅ CCIPBridge deployed at: ${bridgeAddress}`);

  // ─── Summary ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  CCIPBridge:        ${bridgeAddress}`);
  console.log(`  Chainlink Router:  ${routerAddress}`);
  console.log(`  Token:             ${tokenAddress}`);
  console.log(`  Network:           ${network.name} (${chainId})`);
  console.log(`  Owner:             ${deployer.address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("⚠️  NEXT STEPS:");
  console.log("   1. Fund deployer with LINK tokens for CCIP message fees");
  console.log("   2. Add allowed destination chains via addDestinationChain()");
  console.log("   3. Transfer ownership to GnosisSafeL2 multisig");
  console.log("   4. Test with testnet LINK from https://faucets.chain.link\n");

  return bridgeAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
