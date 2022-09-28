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

    await lotteryFactory.buildLottery(101, ticket.address, 0);
    const lotteryProxyAddress = await lotteryFactory.lotteries(0);
  
    lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, owner);
    await lotteryV1Proxy.triggerStart(15); //15 seconds
  })


  it('Starts', async function () {
    
    expect(await lotteryV1Proxy.startAt != 0);
  });
  
  it('Fails when not owner calls start', async function () {
    await lotteryFactory.buildLottery(101, ticket.address, 0);
    const lotteryProxyAddress = lotteryFactory.lotteries(0);
  
    const lotteryV1Proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, addr1);
    assert.isRejected(lotteryV1Proxy.triggerStart(1));
      
  });
  
  it('Deposits', async function () {
    
    await ticket.mint();
    
    await lotteryV1Proxy.deposit(ticket.address, 1, { value: ethers.utils.parseEther("0.5") });
    expect(await lotteryV1Proxy.ticketIds[0] == 1);
  
  });
  
  it('Fails when wrong nft data is given', async function () {
    assert.isRejected(lotteryV1Proxy.deposit(ticket.address, 1, { value: ethers.utils.parseEther("0.5") }));
  });
  
  it('Chooses surprise winner', async function () {
    await ticket.mint();
    await ticket.connect(addr1).mint();
  
    await lotteryV1Proxy.deposit(ticket.address, 1, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.connect(addr1).deposit(ticket.address, 2, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.selectSurpriseWinner();
  });
  
  it('Failes when ending', async function () { 
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await lotteryV1Proxy.deposit(ticket.address, 1, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.connect(addr1).deposit(ticket.address, 2, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.connect(addr2).deposit(ticket.address, 3, { value: ethers.utils.parseEther("0.5") });
    await lotteryV1Proxy.selectSurpriseWinner();
  
  
    assert.isRejected(lotteryV1Proxy.triggerEnd());
  });
  
  it('V1 breaks because of bad implementation', async function () {  
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
    assert.isRejected(lotteryV1Proxy.triggerEnd());
  });
  
})