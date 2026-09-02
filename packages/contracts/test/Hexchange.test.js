const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Hexchange AMM", function () {
  let factory, router, tokenA, tokenB, deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA", 18);
    tokenB = await MockERC20.deploy("Token B", "TKB", 18);
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    // Mint tokens to deployer
    const mintAmt = ethers.parseEther("10000000");
    await tokenA["mint(address,uint256)"](deployer.address, mintAmt);
    await tokenB["mint(address,uint256)"](deployer.address, mintAmt);

    const Factory = await ethers.getContractFactory("HexchangeFactory");
    factory = await Factory.deploy(deployer.address);
    await factory.waitForDeployment();

    const Router = await ethers.getContractFactory("HexchangeRouter");
    router = await Router.deploy(await factory.getAddress());
    await router.waitForDeployment();
  });

  describe("Factory", function () {
    it("should create a pair", async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should reject duplicate pairs", async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      await expect(factory.createPair(await tokenA.getAddress(), await tokenB.getAddress())).to.be.reverted;
    });
  });

  describe("Add Liquidity", function () {
    it("should add liquidity and get LP tokens", async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      await tokenA.approve(await router.getAddress(), ethers.parseEther("200000"));
      await tokenB.approve(await router.getAddress(), ethers.parseEther("200000"));

      const amount = ethers.parseEther("100000");
      const deadline = Math.floor(Date.now() / 1000) + 600;

      await router.addLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        amount, amount, amount, amount, deployer.address, deadline
      );

      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      const Pair = await ethers.getContractFactory("HexchangePair");
      const pair = Pair.attach(pairAddress);
      expect(await pair.balanceOf(deployer.address)).to.be.gt(0);
    });
  });

  describe("Swap", function () {
    beforeEach(async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      await tokenA.approve(await router.getAddress(), ethers.parseEther("200000"));
      await tokenB.approve(await router.getAddress(), ethers.parseEther("200000"));
      
      // Add 100k liquidity per side
      const amount = ethers.parseEther("100000");
      const deadline = Math.floor(Date.now() / 1000) + 600;
      await router.addLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        amount, amount, amount, amount, deployer.address, deadline
      );
    });

    it("should swap tokens", async function () {
      // Swap a smaller amount (0.1% of pool) to avoid slippage issues
      const swapAmt = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 600;
      const balBefore = await tokenB.balanceOf(deployer.address);

      await router.swapExactTokensForTokens(
        swapAmt, 0,
        [await tokenA.getAddress(), await tokenB.getAddress()],
        deployer.address, deadline
      );

      const balAfter = await tokenB.balanceOf(deployer.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("should get amounts out", async function () {
      const amounts = await router.getAmountsOut(ethers.parseEther("1000"), [
        await tokenA.getAddress(), await tokenB.getAddress(),
      ]);
      expect(amounts[1]).to.be.gt(0);
    });
  });
});
