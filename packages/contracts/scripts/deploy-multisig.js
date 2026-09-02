/**
 * Deploy Gnosis Safe multisig and transfer all contract admin roles to it.
 *
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy-multisig.js --network chennai
 *
 * This script:
 * 1. Deploys GnosisSafeL2 with 5 signers (3-of-5 threshold)
 * 2. Transfers DEFAULT_ADMIN_ROLE on all contracts to the multisig
 * 3. Transfers critical roles (MINTER, REBASE, PAUSER) to multisig
 * 4. Logs all addresses for verification
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// ─── CONFIGURATION ────────────────────────────────────────────────
// 5 designated signers for the multisig (replace with real addresses)
const SIGNERS = [
  "0x0000000000000000000000000000000000000001", // Signer 1 (CEO)
  "0x0000000000000000000000000000000000000002", // Signer 2 (CTO)
  "0x0000000000000000000000000000000000000003", // Signer 3 (CFO)
  "0x0000000000000000000000000000000000000004", // Signer 4 (Legal)
  "0x0000000000000000000000000000000000000005", // Signer 5 (Backup)
];
const THRESHOLD = 3; // 3-of-5

// Deployed contract addresses (from previous deployments)
const CONTRACTS = {
  chennai: {
    TDOT: "0x542E95FD423962505EBfb279C1361351507A0185",
    Oracle: "0x435d6A390c865De76c80c6262aD2D7a5b5D41931",
    Stabilization: "0x436A576D59f7C38BC804ED29251601Eb176f8667",
    Governance: "0xde455081D202269e8fD7B4b37bb85f1Fd81fF126",
    Bridge: "0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4",
  },
  mainnet: {
    TDOT: "0x84ed5E46280c6911551925329C3af6c58e4ced56",
    Oracle: "0xAE7D6822975e9050bF3AafB823351F95eD518eeb",
    Stabilization: "0x2000fd82FEC13e6F7af9B2CA5762374E13bfa552",
    Governance: "0x002fB3bAB0544880a8e23122dE6133Ff090eAc81",
    Bridge: "0xe90813974118D9A582A011ab8fDFda57acD2AE13",
  }
};

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
const REBASE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REBASE_ROLE"));
const REPORTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REPORTER_ROLE"));

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("=== Gnosis Safe Multisig Deployment ===");
  console.log("Network:", chainId === 1545 ? "Chennai Testnet" : chainId === 1546 ? "Mainnet" : `Chain ${chainId}`);
  console.log("Deployer:", deployer.address);
  console.log("Signers:", SIGNERS);
  console.log("Threshold:", THRESHOLD);

  // 1. Deploy Gnosis Safe
  console.log("\n--- Step 1: Deploy Gnosis Safe ---");
  const GnosisSafe = await ethers.getContractFactory("GnosisSafeL2");
  const guardian = SIGNERS[0]; // First signer is also guardian
  const safe = await GnosisSafe.deploy(SIGNERS, THRESHOLD, guardian);
  await safe.waitForDeployment();
  const safeAddress = await safe.getAddress();
  console.log("Gnosis Safe deployed at:", safeAddress);

  // 2. Get contract addresses for this network
  const contracts = chainId === 1545 ? CONTRACTS.chennai : CONTRACTS.mainnet;

  // 3. Transfer admin roles to multisig
  console.log("\n--- Step 2: Transfer Admin Roles to Multisig ---");

  // Transfer DPC20 roles
  const DPC20ABI = [
    "function grantRole(bytes32 role, address account) external",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function renounceRole(bytes32 role, address account) external",
  ];

  const dpc20 = new ethers.Contract(contracts.TDOT, DPC20ABI, deployer);

  // Grant roles to multisig
  const roles = [
    { name: "DEFAULT_ADMIN_ROLE", hash: DEFAULT_ADMIN_ROLE },
    { name: "MINTER_ROLE", hash: MINTER_ROLE },
    { name: "PAUSER_ROLE", hash: PAUSER_ROLE },
    { name: "REBASE_ROLE", hash: REBASE_ROLE },
  ];

  for (const role of roles) {
    try {
      const tx = await dpc20.grantRole(role.hash, safeAddress);
      await tx.wait();
      console.log(`  ✅ ${role.name} granted to multisig`);
    } catch (e) {
      console.log(`  ⚠️  ${role.name} grant failed:`, e.message?.slice(0, 80));
    }
  }

  // Transfer Oracle admin
  const OracleABI = [
    "function grantRole(bytes32 role, address account) external",
    "function hasRole(bytes32 role, address account) view returns (bool)",
  ];
  const oracle = new ethers.Contract(contracts.Oracle, OracleABI, deployer);
  try {
    await (await oracle.grantRole(DEFAULT_ADMIN_ROLE, safeAddress)).wait();
    console.log("  ✅ Oracle admin transferred to multisig");
  } catch (e) {
    console.log("  ⚠️  Oracle admin transfer failed:", e.message?.slice(0, 80));
  }

  // Transfer Governance admin
  const gov = new ethers.Contract(contracts.Governance, OracleABI, deployer);
  try {
    await (await gov.grantRole(DEFAULT_ADMIN_ROLE, safeAddress)).wait();
    console.log("  ✅ Governance admin transferred to multisig");
  } catch (e) {
    console.log("  ⚠️  Governance admin transfer failed:", e.message?.slice(0, 80));
  }

  // Transfer Bridge admin
  const bridge = new ethers.Contract(contracts.Bridge, OracleABI, deployer);
  try {
    await (await bridge.grantRole(DEFAULT_ADMIN_ROLE, safeAddress)).wait();
    console.log("  ✅ Bridge admin transferred to multisig");
  } catch (e) {
    console.log("  ⚠️  Bridge admin transfer failed:", e.message?.slice(0, 80));
  }

  // 4. Save deployment info
  const deploymentInfo = {
    network: chainId,
    timestamp: new Date().toISOString(),
    gnosisSafe: safeAddress,
    threshold: `${THRESHOLD}-of-${SIGNERS.length}`,
    signers: SIGNERS,
    contracts: contracts,
    rolesTransferred: roles.map(r => r.name),
  };

  const outputPath = path.join(__dirname, `../deployments/multisig-${chainId}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Complete ===");
  console.log("Gnosis Safe:", safeAddress);
  console.log("Deployment info saved to:", outputPath);
  console.log("\n⚠️  IMPORTANT: Replace placeholder signer addresses with real ones before mainnet!");
  console.log("⚠️  After deployment, renounce deployer's admin roles to complete the transfer.");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
