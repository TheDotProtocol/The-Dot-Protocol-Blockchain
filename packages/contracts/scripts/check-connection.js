const hre = require("hardhat");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  console.log("Connected to chain:", network.chainId.toString());

  const signers = await hre.ethers.getSigners();
  console.log("Signers:", signers.length);

  if (signers.length > 0) {
    const deployer = signers[0];
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "TDOT");

    if (balance === 0n) {
      console.error("ERROR: Deployer has no balance!");
      process.exit(1);
    }

    console.log("Connection OK - ready to deploy");
  } else {
    console.error("ERROR: No signers available");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
