//test for the upgrade
const { ethers, upgrades } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe("Tests for upgrading implementation", function() {

  let ticketProxy, proxy, lotteryBeacon, ticket, lotteryFactory, owner, addr1, addr2;
  
  before("get contracts", async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    const Ticket = await hre.ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy();
    await ticket.deployed();
  
    const TicketV2 = await hre.ethers.getContractFactory("TicketV2");
    ticketv2 = await TicketV2.deploy();
    await ticketv2.deployed();
  
    const TicketFactory = await hre.ethers.getContractFactory("TicketFactory");
    ticketFactory = await TicketFactory.deploy(ticket.address);
    await ticketFactory.deployed();

    await ticketFactory.addNewProxy();
    const proxyAddress = await ticketFactory.proxies(0);
    console.log(proxyAddress)
  
    proxy = await hre.ethers.getContractAt("Ticket", proxyAddress, owner);
    ticketProxy = await hre.ethers.getContractAt("TicketProxy", proxyAddress, owner);
  })
  
  it('Proxy should not have upgradeChecker function', async function () { 
    await proxy.mint();
    console.log(await proxy.ownerOf(0))

  });

  it('Proxy should be upgraded', async function () {

    await ticketProxy.changeImpl(ticketv2.address);
    await proxy.mint();
    console.log(await proxy.ownerOf(123))
  });
})