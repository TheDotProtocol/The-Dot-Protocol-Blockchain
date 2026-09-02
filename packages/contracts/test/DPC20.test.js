const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DPC20", function () {
  let dpc20, admin, minter, pauser, user1, user2;

  beforeEach(async function () {
    [admin, minter, pauser, user1, user2] = await ethers.getSigners();
    const DPC20 = await ethers.getContractFactory("DPC20");
    dpc20 = await DPC20.deploy();
    await dpc20.waitForDeployment();

    // Grant roles
    const MINTER_ROLE = await dpc20.MINTER_ROLE();
    const PAUSER_ROLE = await dpc20.PAUSER_ROLE();
    await dpc20.grantRole(MINTER_ROLE, minter.address);
    await dpc20.grantRole(PAUSER_ROLE, pauser.address);
  });

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      expect(await dpc20.name()).to.equal("Dot Protocol Coin");
      expect(await dpc20.symbol()).to.equal("3DOT");
    });

    it("should have 18 decimals", async function () {
      expect(await dpc20.decimals()).to.equal(18);
    });

    it("should have max supply of 1 trillion", async function () {
      const maxSupply = await dpc20.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("1000000000000"));
    });

    it("should start with zero total supply", async function () {
      expect(await dpc20.totalSupply()).to.equal(0);
    });

    it("should grant admin roles to deployer", async function () {
      const DEFAULT_ADMIN = await dpc20.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await dpc20.MINTER_ROLE();
      const PAUSER_ROLE = await dpc20.PAUSER_ROLE();
      const REBASE_ROLE = await dpc20.REBASE_ROLE();

      expect(await dpc20.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await dpc20.hasRole(MINTER_ROLE, admin.address)).to.be.true;
      expect(await dpc20.hasRole(PAUSER_ROLE, admin.address)).to.be.true;
      expect(await dpc20.hasRole(REBASE_ROLE, admin.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should allow minter to mint tokens", async function () {
      const amount = ethers.parseEther("1000000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](user1.address, amount, "Test mint");
      expect(await dpc20.balanceOf(user1.address)).to.equal(amount);
    });

    it("should reject minting from non-minter", async function () {
      await expect(
        dpc20.connect(user1)["mint(address,uint256,string)"](user1.address, 1000n, "Unauthorized")
      ).to.be.reverted;
    });

    it("should reject minting beyond max supply", async function () {
      const maxSupply = await dpc20.MAX_SUPPLY();
      await expect(
        dpc20.connect(minter)["mint(address,uint256,string)"](user1.address, maxSupply + 1n, "Over max")
      ).to.be.reverted;
    });

    it("should emit Minted event with reason", async function () {
      const amount = ethers.parseEther("500");
      await expect(dpc20.connect(minter)["mint(address,uint256,string)"](user1.address, amount, "Liquidity"))
        .to.emit(dpc20, "Minted")
        .withArgs(user1.address, amount, "Liquidity");
    });

    it("should allow simple mint (no reason)", async function () {
      const amount = ethers.parseEther("100");
      await dpc20.connect(minter)["mint(address,uint256)"](user1.address, amount);
      expect(await dpc20.balanceOf(user1.address)).to.equal(amount);
    });
  });

  describe("Pausing", function () {
    it("should allow pauser to pause", async function () {
      await dpc20.connect(pauser).pause();
      expect(await dpc20.paused()).to.be.true;
    });

    it("should reject transfers when paused", async function () {
      const amount = ethers.parseEther("1000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](admin.address, amount, "Seed");
      await dpc20.connect(pauser).pause();
      await expect(
        dpc20.connect(admin).transfer(user1.address, 100n)
      ).to.be.reverted;
    });

    it("should allow transfers after unpause", async function () {
      const amount = ethers.parseEther("1000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](admin.address, amount, "Seed");
      await dpc20.connect(pauser).pause();
      await dpc20.connect(pauser).unpause();
      await expect(
        dpc20.connect(admin).transfer(user1.address, 100n)
      ).to.not.be.reverted;
    });
  });

  describe("Rebase", function () {
    it("should allow positive rebase", async function () {
      const mintAmount = ethers.parseEther("1000000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](admin.address, mintAmount, "Seed");

      const rebaseAmount = ethers.parseEther("500000");
      await dpc20.connect(admin).rebase(rebaseAmount);

      expect(await dpc20.totalSupply()).to.equal(mintAmount + rebaseAmount);
    });

    it("should allow negative rebase", async function () {
      const mintAmount = ethers.parseEther("1000000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](admin.address, mintAmount, "Seed");

      const burnAmount = ethers.parseEther("200000");
      await dpc20.connect(admin).rebase(-burnAmount);

      expect(await dpc20.totalSupply()).to.equal(mintAmount - burnAmount);
    });

    it("should reject rebase exceeding max supply", async function () {
      const maxSupply = await dpc20.MAX_SUPPLY();
      await expect(
        dpc20.connect(admin).rebase(maxSupply + 1n)
      ).to.be.reverted;
    });

    it("should reject rebase from non-admin", async function () {
      await expect(
        dpc20.connect(user1).rebase(1000n)
      ).to.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("should allow admin to grant roles", async function () {
      const MINTER_ROLE = await dpc20.MINTER_ROLE();
      await dpc20.grantRole(MINTER_ROLE, user1.address);
      expect(await dpc20.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("should allow admin to revoke roles", async function () {
      const MINTER_ROLE = await dpc20.MINTER_ROLE();
      await dpc20.revokeRole(MINTER_ROLE, minter.address);
      expect(await dpc20.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });
  });
});
