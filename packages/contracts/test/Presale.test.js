const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HexchangePresale", function () {
  let presale, token, owner, buyer;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("Dot Protocol Coin", "3DOT", 18);
    await token.waitForDeployment();

    const Presale = await ethers.getContractFactory("HexchangePresale");
    // constructor(tokenAddress, tgeUnlock, vestingMonths)
    presale = await Presale.deploy(await token.getAddress(), 1000, 6); // 10% TGE, 6 month vesting
    await presale.waitForDeployment();

    // Fund presale contract with tokens
    await token["mint(address,uint256)"](await presale.getAddress(), ethers.parseEther("100000000"));
  });

  describe("Configuration", function () {
    it("should configure phases correctly", async function () {
      const now = Math.floor(Date.now() / 1000);

      // Phase 0: Private sale
      await presale.configurePhase(
        0,                                          // phase
        ethers.parseEther("0.005"),                 // price: $0.005
        ethers.parseEther("10000000"),              // allocation: 10M tokens
        now,                                        // startTime
        now + 3600,                                 // endTime: 1 hour
        ethers.parseEther("0.01"),                  // minPurchase: 0.01 ETH
        ethers.parseEther("10")                     // maxPurchase: 10 ETH
      );

      // Phase 1: Public sale
      await presale.configurePhase(
        1,                                          // phase
        ethers.parseEther("0.008"),                 // price: $0.008
        ethers.parseEther("50000000"),              // allocation: 50M tokens
        now + 3600,                                 // startTime
        now + 7200,                                 // endTime
        ethers.parseEther("0.01"),                  // minPurchase
        ethers.parseEther("5")                      // maxPurchase
      );

      const phase0 = await presale.phases(0);
      expect(phase0.price).to.equal(ethers.parseEther("0.005"));
      expect(phase0.tokensAllocated).to.equal(ethers.parseEther("10000000"));

      const phase1 = await presale.phases(1);
      expect(phase1.price).to.equal(ethers.parseEther("0.008"));
    });

    it("should start presale", async function () {
      const now = Math.floor(Date.now() / 1000);
      await presale.configurePhase(0, ethers.parseEther("0.005"), ethers.parseEther("10000000"), now, now + 3600, ethers.parseEther("0.01"), ethers.parseEther("10"));
      await presale.configurePhase(1, ethers.parseEther("0.008"), ethers.parseEther("50000000"), now + 3600, now + 7200, ethers.parseEther("0.01"), ethers.parseEther("5"));

      await presale.startPresale();
      // Presale is now active (no revert)
    });
  });

  describe("Emergency Pause (M-03)", function () {
    it("should pause and unpause", async function () {
      await presale.emergencyPause();
      expect(await presale.paused()).to.be.true;

      await presale.unpause();
      expect(await presale.paused()).to.be.false;
    });

    it("should revert purchases when paused", async function () {
      const now = Math.floor(Date.now() / 1000);
      await presale.configurePhase(0, ethers.parseEther("0.005"), ethers.parseEther("10000000"), now, now + 3600, ethers.parseEther("0.01"), ethers.parseEther("10"));
      await presale.emergencyPause();

      await expect(
        presale.connect(buyer).buyWithETH(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Presale: PAUSED");
    });
  });

  describe("Purchase", function () {
    it("should buy tokens with ETH", async function () {
      const now = Math.floor(Date.now() / 1000);
      await presale.configurePhase(
        0, ethers.parseEther("0.005"), ethers.parseEther("10000000"),
        now, now + 3600, ethers.parseEther("0.01"), ethers.parseEther("10")
      );

      const buyAmount = ethers.parseEther("1");
      await presale.connect(buyer).buyWithETH(0, { value: buyAmount });

      const purchase = await presale.purchases(buyer.address, 0);
      expect(purchase.amount).to.equal(buyAmount);
      expect(purchase.tokens).to.be.gt(0);
    });

    it("should revert if below minimum", async function () {
      const now = Math.floor(Date.now() / 1000);
      await presale.configurePhase(
        0, ethers.parseEther("0.005"), ethers.parseEther("10000000"),
        now, now + 3600, ethers.parseEther("0.1"), ethers.parseEther("10")
      );

      await expect(
        presale.connect(buyer).buyWithETH(0, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Presale: BELOW_MIN");
    });
  });
});
