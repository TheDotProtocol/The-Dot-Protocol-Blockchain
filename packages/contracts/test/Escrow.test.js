const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HexchangeEscrow", function () {
  let escrow, token, admin, seller, buyer;

  beforeEach(async function () {
    [admin, seller, buyer] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("Test Token", "TEST", 18);
    await token.waitForDeployment();
    await token["mint(address,uint256)"](seller.address, ethers.parseEther("1000000"));

    const Escrow = await ethers.getContractFactory("HexchangeEscrow");
    escrow = await Escrow.deploy(admin.address, 50);
    await escrow.waitForDeployment();
  });

  it("should create an order", async function () {
    const amount = ethers.parseEther("1000");
    await escrow.connect(seller).createOrder(await token.getAddress(), amount, ethers.parseEther("0.01"));
    const order = await escrow.getOrder(0);
    expect(order.seller).to.equal(seller.address);
    expect(order.amount).to.equal(amount);
  });

  it("should fund an order", async function () {
    const amount = ethers.parseEther("1000");
    await escrow.connect(seller).createOrder(await token.getAddress(), amount, ethers.parseEther("0.01"));
    await token.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).fundOrder(0);
    const order = await escrow.getOrder(0);
    expect(order.state).to.equal(1);
  });

  it("should accept payment and release tokens", async function () {
    const amount = ethers.parseEther("1000");
    await escrow.connect(seller).createOrder(await token.getAddress(), amount, ethers.parseEther("0.01"));
    await token.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).fundOrder(0);
    await escrow.connect(buyer).acceptAndPay(0, { value: ethers.parseEther("10") });
    await escrow.connect(seller).confirmAndRelease(0);
    const order = await escrow.getOrder(0);
    expect(order.state).to.equal(3);
  });

  it("should cancel and refund", async function () {
    const amount = ethers.parseEther("1000");
    await escrow.connect(seller).createOrder(await token.getAddress(), amount, ethers.parseEther("0.01"));
    await token.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).fundOrder(0);
    const balBefore = await token.balanceOf(seller.address);
    await escrow.connect(seller).cancelOrder(0);
    expect(await token.balanceOf(seller.address)).to.be.gt(balBefore);
  });

  it("should raise and resolve dispute", async function () {
    const amount = ethers.parseEther("1000");
    await escrow.connect(seller).createOrder(await token.getAddress(), amount, ethers.parseEther("0.01"));
    await token.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).fundOrder(0);
    await escrow.connect(buyer).acceptAndPay(0, { value: ethers.parseEther("10") });
    await escrow.connect(buyer).raiseDispute(0);
    expect((await escrow.getOrder(0)).state).to.equal(4);
    await escrow.connect(admin).resolveDispute(0, true);
    expect((await escrow.getOrder(0)).state).to.equal(3);
  });

  it("should rate a user", async function () {
    await escrow.connect(buyer).rateUser(seller.address, 5);
    const [avg, count] = await escrow.getUserRating(seller.address);
    expect(avg).to.equal(5);
    expect(count).to.equal(1);
  });
});
