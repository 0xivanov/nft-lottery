//test for the upgrade
const { ethers, upgrades } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe.skip("Tests for upgrading implementation", function() {

  let lotteryV1, proxy, lotteryBeacon, ticket, lotteryFactory, owner, addr1, addr2;
  
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

    await lotteryFactory.buildLottery(101, ticket.address, 0);
    const lotteryProxyAddress = await lotteryFactory.lotteries(0);
  
    proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, owner);

    const beaconAddress = await lotteryFactory.beacon();
    lotteryBeacon = await hre.ethers.getContractAt("LotteryBeacon", beaconAddress);
  })
  
  it('Proxy should not have upgradeChecker function', async function () { 
    expect(() => {proxy.upgradeChecker()}).to.throw(TypeError);
  });

  it('Proxy should be upgraded', async function () {

    await lotteryBeacon.update(lotteryV2.address);
    const lotteryProxyAddress = await lotteryFactory.lotteries(0);
    let newProxy = await hre.ethers.getContractAt("LotteryV2", lotteryProxyAddress, owner);
    const text = await newProxy.upgradeChecker();
    expect(text === "Im new impl");
  });
})