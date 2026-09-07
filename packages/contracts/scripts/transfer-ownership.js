const { ethers } = require("hardhat");

/**
 * Transfer ownership of all contracts to GnosisSafeL2 multisig
 * Usage:
 *   npx hardhat run scripts/transfer-ownership.js --network chennai
 *   npx hardhat run scripts/transfer-ownership.js --network mainnet
 */

// Contract addresses per network
const ADDRESSES = {
  chennai: {
    gnosisSafe: "0x749C753249a83a3499b3Cd10a95619b4C5a5A62B",
    contracts: [
      { name: "TDOT Token", address: "0x542E95FD423962505EBfb279C1361351507A0185", hasOwnership: true },
      { name: "Oracle", address: "0x435d6A390c865De76c80c6262aD2D7a5b5D41931", hasOwnership: true },
      { name: "Stabilization", address: "0x436A576D59f7C38BC804ED29251601Eb176f8667", hasOwnership: true },
      { name: "Governance", address: "0xde455081D202269e8fD7B4b37bb85f1Fd81fF126", hasOwnership: true },
      { name: "Bridge", address: "0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4", hasOwnership: true },
    ],
  },
  mainnet: {
    gnosisSafe: "0x011E16D98Dba6dcDED38d4487839E4a3A6044779",
    contracts: [
      { name: "3DOT Token", address: "0x84ed5E46280c6911551925329C3af6c58e4ced56", hasOwnership: true },
      { name: "Oracle", address: "0xAE7D6822975e9050bF3AafB823351F95eD518eeb", hasOwnership: true },
      { name: "Stabilization", address: "0x2000fd82FEC13e6F7af9B2CA5762374E13bfa552", hasOwnership: true },
      { name: "Governance", address: "0x002fB3bAB0544880a8e23122dE6133Ff090eAc81", hasOwnership: true },
      { name: "Bridge", address: "0xe90813974118D9A582A011ab8fDFda57acD2AE13", hasOwnership: true },
    ],
  },
};

const OWNERSHIP_ABI = [
  "function transferOwnership(address newOwner) external",
  "function owner() view returns (address)",
  "function proposeOwnership(address newOwner) external",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  
  const config = chainId === "1545" ? ADDRESSES.chennai : ADDRESSES.mainnet;
  
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Transfer Ownership to GnosisSafeL2 Multisig");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Network:       ${network.name} (${chainId})`);
  console.log(`  GnosisSafeL2:  ${config.gnosisSafe}`);
  console.log(`  Deployer:      ${deployer.address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  for (const contract of config.contracts) {
    console.log(`📋 ${contract.name} (${contract.address})`);
    try {
      const c = new ethers.Contract(contract.address, OWNERSHIP_ABI, deployer);
      const currentOwner = await c.owner();
      console.log(`   Current owner: ${currentOwner}`);
      
      if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
        console.log(`   Transferring ownership to ${config.gnosisSafe}...`);
        const tx = await c.transferOwnership(config.gnosisSafe);
        await tx.wait();
        console.log(`   ✅ Ownership transferred! TX: ${tx.hash}`);
      } else if (currentOwner.toLowerCase() === config.gnosisSafe.toLowerCase()) {
        console.log(`   ✅ Already owned by multisig`);
      } else {
        console.log(`   ⚠️  Owner is ${currentOwner} — not deployer. Skipping.`);
      }
    } catch (e) {
      console.log(`   ⚠️  No transferOwnership() — contract may use different pattern`);
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("  ✅ Ownership transfer complete");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
