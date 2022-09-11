//tests for LotteryFactory, LotteryBeacon and LotteryV1, V2 contracts
//LotteryV1 has broken methods
const { ethers, upgrades } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe("tests", function() {
  let lotteryV1, lotteryV2, ticket, lotteryFactory, lotteryBeacon, owner, addr1, addr2;
  beforeEach("get contracts", async function () {
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
  
    const beaconAddress = await lotteryFactory.beacon();
    lotteryBeacon = await hre.ethers.getContractAt("LotteryBeacon", beaconAddress);
  
    [owner, addr1, addr2, _] = await ethers.getSigners();
  })
  
  //LotteryFactory test
  it('Builds new proxies', async function () {
    await lotteryFactory.buildLottery(101, ticket.address, 0);
    const lotteryProxyAddress = lotteryFactory.lotteries(0);
  
    const lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress);
    console.log(lotteryV1Proxy.functions)
    expect(lotteryV1Proxy != null)
  })
  
  
  //LotteryBeacon and upgraing test
  it('Upgrades', async function () {
    await lotteryFactory.buildLottery(101, ticket.address, 0);
    const lotteryProxyAddress = lotteryFactory.lotteries(0);

  
    const lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, owner);
    await lotteryV1Proxy.triggerStart(15); // 15 seconds
    
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await lotteryV1Proxy.deposit(ticket.address, 1, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.connect(addr1).deposit(ticket.address, 2, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.connect(addr2).deposit(ticket.address, 3, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.selectSurpriseWinner();
  
    let timeout = new Promise(function(resolve) {
      setTimeout(resolve, 15000);
    });
    await timeout;
    assert.isRejected(await lotteryV1Proxy.triggerEnd());
  });
})

