const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HexchangePresale", function () {
  let presale, token, paymentToken, owner, buyer1;

  beforeEach(async function () {
    [owner, buyer1] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("3DOT", "3DOT", 18);
    paymentToken = await MockERC20.deploy("USDT", "USDT", 6);
    await token.waitForDeployment();
    await paymentToken.waitForDeployment();

    const Presale = await ethers.getContractFactory("HexchangePresale");
    presale = await Presale.deploy(await token.getAddress(), await paymentToken.getAddress(), owner.address);
    await presale.waitForDeployment();

    const now = Math.floor(Date.now() / 1000);
    await presale.configurePhases(
      ethers.parseEther("0.000005"), ethers.parseEther("0.000008"), ethers.parseEther("0.00001"),
      ethers.parseEther("100"), ethers.parseEther("10000"), ethers.parseEther("10000000"),
      now, now + 3600, now + 3600, now + 7200, now + 7200, now + 10800, 2000, 6
    );
  });

  it("should configure phases correctly", async function () {
    expect(await presale.earlyBirdPrice()).to.equal(ethers.parseEther("0.000005"));
    expect(await presale.hardCap()).to.equal(ethers.parseEther("10000000"));
  });

  it("should start presale", async function () {
    await presale.startPresale();
    expect(await presale.currentPhase()).to.equal(1);
  });

  it("should accept ETH buy", async function () {
    await presale.startPresale();
    await expect(presale.connect(buyer1).buyWithETH({ value: ethers.parseEther("0.01") }))
      .to.emit(presale, "TokensPurchased");
  });

  it("should record purchases", async function () {
    await presale.startPresale();
    await presale.connect(buyer1).buyWithETH({ value: ethers.parseEther("0.01") });
    const purchases = await presale.getUserPurchases(buyer1.address);
    expect(purchases.length).to.equal(1);
  });

  it("should update totalRaised", async function () {
    await presale.startPresale();
    await presale.connect(buyer1).buyWithETH({ value: ethers.parseEther("0.01") });
    expect(await presale.totalRaised()).to.equal(ethers.parseEther("0.01"));
  });
});
