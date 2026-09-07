const { ethers } = require("hardhat");

/**
 * Generate team wallets for GnosisSafeL2 multisig
 * Run: node scripts/generate-team-wallets.js
 *
 * This generates 5 HD wallets from a mnemonic.
 * Each wallet serves a specific role:
 *   1. Marketing   - for marketing spend
 *   2. Team        - for team operations
 *   3. Validators  - for validator operations
 *   4. Ecosystem   - for ecosystem grants
 *   5. Exchange    - for exchange listings
 */

const ROLES = [
  "Marketing",
  "Team",
  "Validators",
  "Ecosystem",
  "Exchange",
];

function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Team Wallet Generator for Multisig");
  console.log("═══════════════════════════════════════════════════════\n");

  // Generate 5 random wallets
  const wallets = ROLES.map(role => {
    const wallet = ethers.Wallet.createRandom();
    return {
      role,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase,
    };
  });

  console.log("⚠️  SAVE THESE WALLETS SECURELY — PRIVATE KEYS ARE SHOWN ONCE\n");

  wallets.forEach((w, i) => {
    console.log(`  ── Wallet ${i + 1}: ${w.role} ──`);
    console.log(`  Address:     ${w.address}`);
    console.log(`  Private Key: ${w.privateKey}`);
    console.log(`  Mnemonic:    ${w.mnemonic}`);
    console.log("");
  });

  console.log("═══════════════════════════════════════════════════════");
  console.log("  ENVIRONMENT VARIABLES (add to .env)");
  console.log("═══════════════════════════════════════════════════════\n");

  wallets.forEach(w => {
    console.log(`MULTISIG_WALLET_${w.role.toUpperCase()}=${w.address}`);
  });

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ⚠️  SECURITY WARNINGS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  1. NEVER commit private keys to git");
  console.log("  2. Store private keys in a hardware wallet or vault");
  console.log("  3. Each team member should control only their wallet");
  console.log("  4. For mainnet, use hardware wallets (Ledger/Trezor)");
  console.log("  5. The mnemonic above generates ALL 5 wallets");
  console.log("═══════════════════════════════════════════════════════\n");
}

main();
