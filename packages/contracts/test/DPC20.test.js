const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DPC20", function () {
  let dpc20, owner, minter, pauser, rebaseRole, user;

  beforeEach(async function () {
    [owner, minter, pauser, rebaseRole, user] = await ethers.getSigners();
    const DPC20 = await ethers.getContractFactory("DPC20");
    dpc20 = await DPC20.deploy();
    await dpc20.waitForDeployment();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
    const REBASE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REBASE_ROLE"));

    await dpc20.grantRole(MINTER_ROLE, minter.address);
    await dpc20.grantRole(PAUSER_ROLE, pauser.address);
    await dpc20.grantRole(REBASE_ROLE, rebaseRole.address);
  });

  describe("Token basics", function () {
    it("should have correct name and symbol", async function () {
      expect(await dpc20.name()).to.equal("Dot Protocol Coin");
      expect(await dpc20.symbol()).to.equal("3DOT");
    });

    it("should have 18 decimals", async function () {
      expect(await dpc20.decimals()).to.equal(18);
    });

    it("should have correct MAX_SUPPLY", async function () {
      expect(await dpc20.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000000000"));
    });
  });

  describe("Minting", function () {
    it("should mint tokens with reason", async function () {
      const amount = ethers.parseEther("1000");
      await dpc20.connect(minter)["mint(address,uint256,string)"](user.address, amount, "Test mint");
      expect(await dpc20.balanceOf(user.address)).to.equal(amount);
    });

    it("should mint tokens without reason", async function () {
      const amount = ethers.parseEther("500");
      await dpc20.connect(minter)["mint(address,uint256)"](user.address, amount);
      expect(await dpc20.balanceOf(user.address)).to.equal(amount);
    });

    it("should revert if non-minter tries to mint", async function () {
      await expect(
        dpc20.connect(user)["mint(address,uint256,string)"](user.address, ethers.parseEther("100"), "")
      ).to.be.revertedWithCustomError(dpc20, "AccessControlUnauthorizedAccount");
    });

    it("should revert if minting exceeds MAX_SUPPLY", async function () {
      const maxSupply = await dpc20.MAX_SUPPLY();
      await expect(
        dpc20.connect(minter)["mint(address,uint256,string)"](user.address, maxSupply + 1n, "Exceed")
      ).to.be.revertedWith("DPC20: exceeds max supply");
    });
  });

  describe("Rebase with cap (C-02 fix)", function () {
    beforeEach(async function () {
      // Mint some tokens to the contract for rebase
      await dpc20.connect(minter)["mint(address,uint256,string)"](await dpc20.getAddress(), ethers.parseEther("1000000"), "Rebase pool");
    });

    it("should allow rebase within 5% cap", async function () {
      const supply = await dpc20.totalSupply();
      const maxDelta = supply * 5n / 100n; // 5%
      const delta = maxDelta / 2n; // 2.5%

      const oldSupply = await dpc20.totalSupply();
      await dpc20.connect(rebaseRole).rebase(delta);
      const newSupply = await dpc20.totalSupply();
      expect(newSupply - oldSupply).to.equal(delta);
    });

    it("should revert if rebase exceeds 5% cap", async function () {
      const supply = await dpc20.totalSupply();
      const overCap = (supply * 6n) / 100n; // 6% > 5% cap

      await expect(
        dpc20.connect(rebaseRole).rebase(overCap)
      ).to.be.revertedWith("DPC20: rebase exceeds 5% cap");
    });

    it("should allow negative rebase (deflation)", async function () {
      const contractAddr = await dpc20.getAddress();
      const balance = await dpc20.balanceOf(contractAddr);
      const delta = -(balance / 20n); // -5% of contract balance (within cap)

      const oldSupply = await dpc20.totalSupply();
      await dpc20.connect(rebaseRole).rebase(delta);
      const newSupply = await dpc20.totalSupply();
      expect(oldSupply - newSupply).to.equal(-delta);
    });

    it("should revert if negative rebase exceeds cap", async function () {
      const supply = await dpc20.totalSupply();
      const overCap = -(supply * 6n) / 100n; // -6% > 5% cap

      await expect(
        dpc20.connect(rebaseRole).rebase(overCap)
      ).to.be.revertedWith("DPC20: rebase exceeds 5% cap");
    });

    it("should emit Rebased event", async function () {
      const supply = await dpc20.totalSupply();
      const delta = supply / 20n; // 5%

      await expect(dpc20.connect(rebaseRole).rebase(delta))
        .to.emit(dpc20, "Rebased");
    });
  });

  describe("Pause", function () {
    it("should pause and unpause", async function () {
      await dpc20.connect(pauser).pause();
      expect(await dpc20.paused()).to.be.true;

      await expect(
        dpc20.connect(minter)["mint(address,uint256,string)"](user.address, ethers.parseEther("100"), "")
      ).to.be.revertedWith("DPC20: paused");

      await dpc20.connect(pauser).unpause();
      expect(await dpc20.paused()).to.be.false;
    });
  });

  describe("Emergency rebase and pause", function () {
    it("should rebase and pause in one tx", async function () {
      await dpc20.connect(minter)["mint(address,uint256,string)"](await dpc20.getAddress(), ethers.parseEther("1000000"), "Pool");
      const supply = await dpc20.totalSupply();
      const delta = supply / 20n; // 5%

      await dpc20.connect(owner).emergencyRebaseAndPause(delta);
      expect(await dpc20.paused()).to.be.true;
    });
  });
});
