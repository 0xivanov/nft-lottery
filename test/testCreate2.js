//LotteryFactory test
const { ethers } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;

describe("Tests for create2", function() {

  let lotteryV1, lotteryV2, proxy, lotteryProxyAddress, ticket, lotteryFactory, owner, addr1, addr2;
  
  beforeEach("get contracts", async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    const Ticket = await hre.ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy();
    await ticket.deployed();
  
    const LotteryV1 = await hre.ethers.getContractFactory("LotteryV1");
    lotteryV1 = await LotteryV1.deploy();
    await lotteryV1.deployed();

    const LotteryV2 = await hre.ethers.getContractFactory("LotteryV2");
    lotteryV2 = await LotteryV2.deploy();
    await lotteryV2.deployed();
  
    const LotteryFactory = await hre.ethers.getContractFactory("LotteryFactory");
    lotteryFactory = await LotteryFactory.deploy(lotteryV1.address);
    await lotteryFactory.deployed();
  });

  it("Precumputes the proxy address", async function () {

    let precomputedAddress = await lotteryFactory.getAddress(321, ethers.utils.parseEther("2"), ticket.address);
    await lotteryFactory.buildLottery(321, ethers.utils.parseEther("2"), ticket.address, 0); //2 is deposit requirement
    lotteryProxyAddress = await lotteryFactory.lotteries(0);

    expect(precomputedAddress === lotteryProxyAddress);
  });

  it("Precumputes the proxy address", async function () {

    let precomputedAddress = await lotteryFactory.getAddress(14123, ethers.utils.parseEther("2"), ticket.address);
    await lotteryFactory.buildLottery(14123, ethers.utils.parseEther("2"), ticket.address, 0); //2 is deposit requirement
    lotteryProxyAddress = await lotteryFactory.lotteries(0);

    expect(precomputedAddress === lotteryProxyAddress);
  });

  it("Precumputes the proxy address", async function () {

    let precomputedAddress = await lotteryFactory.getAddress(14123, ethers.utils.parseEther("2"), ticket.address);
    await lotteryFactory.buildLottery(3, ethers.utils.parseEther("2"), ticket.address, 0); //2 is deposit requirement
    lotteryProxyAddress = await lotteryFactory.lotteries(0);

    expect(precomputedAddress !== lotteryProxyAddress);
  });
})