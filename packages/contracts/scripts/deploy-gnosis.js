const { ethers } = require("hardhat");

/**
 * Deploy GnosisSafeL2 (3-of-5 Multisig) + CCIPBridge
 * Usage:
 *   npx hardhat run scripts/deploy-gnosis.js --network chennai
 *   npx hardhat run scripts/deploy-gnosis.js --network mainnet
 *
 * Team wallet addresses (5-of-5 signers):
 *   1. Marketing  - 0x... 
 *   2. Team       - 0x...
 *   3. Validators - 0x...
 *   4. Ecosystem  - 0x...
 *   5. Exchange   - 0x...
 *
 * IMPORTANT: After deployment, transfer ownership of ALL contracts
 * to the GnosisSafeL2 multisig address using transferOwnership().
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  GnosisSafeL2 Multisig Deployment");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Network:  ${network.name} (Chain ID: ${chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── Team Wallets (replace with real addresses) ─────────────────
  // These are placeholder addresses. Replace with actual team wallets before mainnet.
  const teamWallets = [
    process.env.MULTISIG_WALLET_MARKETING || "0x0000000000000000000000000000000000000001",
    process.env.MULTISIG_WALLET_TEAM || "0x0000000000000000000000000000000000000002",
    process.env.MULTISIG_WALLET_VALIDATORS || "0x0000000000000000000000000000000000000003",
    process.env.MULTISIG_WALLET_ECOSYSTEM || "0x0000000000000000000000000000000000000004",
    process.env.MULTISIG_WALLET_EXCHANGE || "0x0000000000000000000000000000000000000005",
  ];

  const THRESHOLD = 3; // 3-of-5 multisig
  const guardian = deployer.address; // Deployer is guardian initially

  console.log("📋 Team Wallets:");
  teamWallets.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
  console.log(`   Threshold: ${THRESHOLD}-of-${teamWallets.length}`);
  console.log(`   Guardian:  ${guardian} (deployer)\n`);

  // ─── Deploy GnosisSafeL2 ────────────────────────────────────────
  console.log("🚀 Deploying GnosisSafeL2...");
  const GnosisSafeL2 = await ethers.getContractFactory("GnosisSafeL2");
  const safe = await GnosisSafeL2.deploy(teamWallets, THRESHOLD, guardian);
  await safe.waitForDeployment();
  const safeAddress = await safe.getAddress();
  console.log(`✅ GnosisSafeL2 deployed at: ${safeAddress}`);

  // ─── Verify ownership ───────────────────────────────────────────
  const owners = await safe.getOwners();
  const threshold = await safe.threshold();
  console.log(`\n📊 Verification:`);
  console.log(`   Owners:     ${owners.length}`);
  console.log(`   Threshold:  ${threshold}`);
  console.log(`   Guardian:   ${await safe.guardian()}`);

  // ─── Summary ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  GnosisSafeL2:  ${safeAddress}`);
  console.log(`  Network:       ${network.name} (${chainId})`);
  console.log(`  Threshold:     ${THRESHOLD}-of-${teamWallets.length}`);
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("⚠️  NEXT STEPS:");
  console.log("   1. Save the GnosisSafeL2 address above");
  console.log("   2. Call transferOwnership() on ALL contracts to transfer to this multisig");
  console.log("   3. Replace placeholder wallet addresses with real team wallets before mainnet");
  console.log("   4. Each team member should import their wallet into MetaMask\n");

  return safeAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
