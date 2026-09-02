/**
 * Create Team Wallets for The Dot Protocol
 * 
 * Generates 5 separate HD wallets from a single mnemonic for different purposes:
 * - Marketing
 * - Team & Advisors
 * - Validators
 * - Ecosystem Fund
 * - Exchange Liquidity
 *
 * Usage: node create-team-wallets.js
 * 
 * ⚠️  SECURITY: 
 * - The mnemonic printed here is for TESTNET ONLY
 * - For mainnet, generate a new mnemonic offline and store in a hardware wallet
 * - Never commit mainnet mnemonics to git
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Generate a fresh mnemonic using crypto
function generateMnemonic() {
  // BIP-39 wordlist (2048 words) — simplified for demo
  const entropy = crypto.randomBytes(16); // 128 bits = 12 words
  // For production, use a proper BIP-39 library
  return ethers.Mnemonic.fromEntropy(entropy).phrase;
}

const WALLET_CONFIG = [
  { name: "Marketing",           path: "m/44'/60'/0'/0/0", allocation: "10%" },
  { name: "Team & Advisors",     path: "m/44'/60'/0'/0/1", allocation: "25%" },
  { name: "Validators",          path: "m/44'/60'/0'/0/2", allocation: "15%" },
  { name: "Ecosystem Fund",      path: "m/44'/60'/0'/0/3", allocation: "40%" },
  { name: "Exchange Liquidity",  path: "m/44'/60'/0'/0/4", allocation: "10%" },
];

function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  THE DOT PROTOCOL — Team Wallet Generation");
  console.log("═══════════════════════════════════════════════\n");

  // Generate master mnemonic (TESTNET ONLY)
  const mnemonic = generateMnemonic();
  
  console.log("⚠️  MASTER MNEMONIC (TESTNET ONLY — DO NOT USE ON MAINNET):");
  console.log(`   ${mnemonic}\n`);
  console.log("   For mainnet: generate offline using a hardware wallet\n");

  const wallets = [];

  for (const config of WALLET_CONFIG) {
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, config.path);
    
    wallets.push({
      name: config.name,
      path: config.path,
      address: wallet.address,
      privateKey: wallet.privateKey,
      allocation: config.allocation,
    });

    console.log(`📌 ${config.name}`);
    console.log(`   Address:     ${wallet.address}`);
    console.log(`   Path:        ${config.path}`);
    console.log(`   Allocation:  ${config.allocation}`);
    console.log(`   Private Key: ${wallet.privateKey.slice(0, 10)}...`);
    console.log("");
  }

  // Save to file (gitignored)
  const output = {
    generatedAt: new Date().toISOString(),
    network: "testnet-chennai",
    chainId: 1545,
    mnemonic: mnemonic,
    wallets: wallets.map(w => ({
      name: w.name,
      address: w.address,
      path: w.path,
      allocation: w.allocation,
      // Private keys saved separately for security
    })),
  };

  const outputPath = path.join(__dirname, "../team-wallets-testnet.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  // Save private keys separately (more secure)
  const keysOutput = wallets.map(w => ({
    name: w.name,
    address: w.address,
    privateKey: w.privateKey,
  }));
  const keysPath = path.join(__dirname, "../team-wallets-keys-testnet.json");
  fs.writeFileSync(keysPath, JSON.stringify(keysOutput, null, 2));

  // Add to gitignore
  const gitignorePath = path.join(__dirname, "../../.gitignore");
  const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
  if (!gitignore.includes("team-wallets")) {
    fs.appendFileSync(gitignorePath, "\n# Team wallets (SENSITIVE)\nteam-wallets-*.json\n");
  }

  console.log("═══════════════════════════════════════════════");
  console.log("  WALLET SUMMARY");
  console.log("═══════════════════════════════════════════════\n");
  
  console.log("| Wallet | Address | Allocation |");
  console.log("|--------|---------|------------|");
  for (const w of wallets) {
    console.log(`| ${w.name} | ${w.address} | ${w.allocation} |`);
  }
  
  console.log(`\n📁 Saved to: ${outputPath}`);
  console.log(`🔑 Keys saved to: ${keysPath}`);
  console.log("\n⚠️  NEXT STEPS:");
  console.log("   1. Fund the 'Ecosystem Fund' wallet with TDOT for testnet");
  console.log("   2. Fund the 'Exchange Liquidity' wallet for LP seeding");
  console.log("   3. Fund the 'Validators' wallet for gas on validator operations");
  console.log("   4. For mainnet: use hardware wallets (Ledger/Trezor)");
}

main();
