//LotteryV1 test
const { ethers, upgrades } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe("Tests for LotteryV1.sol", function() {

  let lotteryV1, lotteryV1Proxy, ticket, lotteryFactory, owner, addr1, addr2;
  
  beforeEach("get contracts", async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    const Ticket = await hre.ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy();
    await ticket.deployed();
  
    const LotteryV1 = await hre.ethers.getContractFactory("LotteryV1");
    lotteryV1 = await LotteryV1.deploy();
    await lotteryV1.deployed();
  
    const LotteryFactory = await hre.ethers.getContractFactory("LotteryFactory");
    lotteryFactory = await LotteryFactory.deploy(lotteryV1.address);
    await lotteryFactory.deployed();

    await lotteryFactory.buildLottery(123, ethers.utils.parseEther("100"), ticket.address, 0); //123 is salt, 100 is deposit requirement
    const lotteryProxyAddress = await lotteryFactory.lotteries(0);
  
    lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, owner);
    await lotteryV1Proxy.triggerStart(15); //15 seconds after the start lottery can be ended
  })


  it('Starts', async function () {
    expect(await lotteryV1Proxy.startAt != 0);
  });
  
  it('Fails when not owner calls start', async function () {
    await lotteryFactory.buildLottery(123, ethers.utils.parseEther("1"), ticket.address, 0); //123 is salt, 1 is deposit requirement
    const lotteryProxyAddress = lotteryFactory.lotteries(0);
  
    const lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, addr1);
    assert.isRejected(lotteryV1Proxy.triggerStart(1));
      
  });
  
  it('depositFunds', async function () {
    
    await ticket.mint();
    
    await lotteryV1Proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("100") });
    expect(await lotteryV1Proxy.ticketIds[0] == 1);
  
  });
  
  it('Fails when wrong nft data is given', async function () {
    assert.isRejected(lotteryV1Proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("100") }));
  });
  
  it('Chooses surprise winner', async function () {
    await ticket.mint();
    await ticket.connect(addr1).mint();
  
    await lotteryV1Proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.connect(addr1).depositFunds(ticket.address, 2, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.selectSurpriseWinner();
  });
  
  it('Fails when ending', async function () { 
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await lotteryV1Proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.connect(addr1).depositFunds(ticket.address, 2, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.connect(addr2).depositFunds(ticket.address, 3, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.selectSurpriseWinner();
  
  
    assert.isRejected(lotteryV1Proxy.triggerEnd());
  });
  
  it('V1 breaks because of bad implementation', async function () {  
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await lotteryV1Proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.connect(addr1).depositFunds(ticket.address, 2, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.connect(addr2).depositFunds(ticket.address, 3, { value: ethers.utils.parseEther("100") });
    await lotteryV1Proxy.selectSurpriseWinner();
  
    let timeout = new Promise(function(resolve) {
      setTimeout(resolve, 15000);
    });
    await timeout;
    assert.isRejected(lotteryV1Proxy.triggerEnd());
  });
  
})