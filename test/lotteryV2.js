//LotteryV2 test
const { ethers } = require("hardhat");
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe("Tests for LotteryV2.sol", function() {

  let lotteryV1, lotteryV2, proxy, lotteryProxyAddress, lotteryBeacon, ticket, lotteryFactory, owner, addr1, addr2;
  
  before("get contracts", async function () {
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

    const beaconAddress = await lotteryFactory.beacon();
    lotteryBeacon = await hre.ethers.getContractAt("LotteryBeacon", beaconAddress);

    await lotteryFactory.buildLottery(123, ethers.utils.parseEther("2"), ticket.address, 0); // 123 is salt, 2 is deposit requirement
    lotteryProxyAddress = await lotteryFactory.lotteries(0);

  })

  
  it('V1 Fails when ending', async function () {
    proxy = await hre.ethers.getContractAt("LotteryV1", lotteryProxyAddress, owner);
    await proxy.triggerStart(15); //15 seconds after the start lottery can be ended

    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("2") });
    await proxy.connect(addr1).depositFunds(ticket.address, 2, { value: ethers.utils.parseEther("2") });
    await proxy.connect(addr2).depositFunds(ticket.address, 3, { value: ethers.utils.parseEther("2") });
    await proxy.selectSurpriseWinner();
  
    let timeout = new Promise(function(resolve) {
      setTimeout(resolve, 15000);
    });
    await timeout;
    assert.isRejected(proxy.triggerEnd());

    await proxy.forceEnd();
  });

  it('Upgrades and fixes V1 problem', async function () {

    let initial = BigInt(await owner.getBalance()) + BigInt(await addr1.getBalance()) + BigInt(await addr2.getBalance());
    initial = initial.toString().substring(0,4);
    console.log("Signers:--------------", owner.address, addr1.address, addr2.address);

    await lotteryBeacon.update(lotteryV2.address);
    const lotteryProxyAddress = await lotteryFactory.lotteries(0);
    proxy = await hre.ethers.getContractAt("LotteryV2", lotteryProxyAddress, owner);
    const text = await proxy.upgradeChecker();
    expect(text === "Im new impl");

    await proxy.triggerStart(15); //15 seconds after the start lottery can be ended
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("2") });
    await proxy.connect(addr1).depositFunds(ticket.address, 2, { value: ethers.utils.parseEther("2") });
    await proxy.connect(addr2).depositFunds(ticket.address, 3, { value: ethers.utils.parseEther("2") });
    await proxy.selectSurpriseWinner();
    console.log("After surprise winner:",ethers.utils.formatEther(await owner.getBalance())
                ,ethers.utils.formatEther(await addr1.getBalance())
                ,ethers.utils.formatEther(await addr2.getBalance()));

    let timeout = new Promise(function(resolve) {
      setTimeout(resolve, 15000);
    });
    await timeout;
    await proxy.triggerEnd();

    console.log("After final winner:---", ethers.utils.formatEther(await owner.getBalance())
    ,ethers.utils.formatEther(await addr1.getBalance())
    ,ethers.utils.formatEther(await addr2.getBalance()));

    let final = BigInt(await owner.getBalance()) + BigInt(await addr1.getBalance()) + BigInt(await addr2.getBalance());
    final = final.toString().substring(0,4);

    expect(initial === final);
  });
  
  it('Makes second iteration of the V2', async function () {

    //change deposti requirement
    await proxy.changeDepositReq(ethers.utils.parseEther("11"));

    let initial = BigInt(await owner.getBalance()) + BigInt(await addr1.getBalance()) + BigInt(await addr2.getBalance());
    initial = initial.toString().substring(0,4);
    console.log("Signers:--------------", owner.address, addr1.address, addr2.address);
    console.log("depositFundss:-------------", 400, 2, 30);

    await proxy.triggerStart(15); //15 seconds after the start lottery can be ended
    await ticket.mint();
    await ticket.connect(addr1).mint();
    await ticket.connect(addr2).mint();
  
    await proxy.depositFunds(ticket.address, 1, { value: ethers.utils.parseEther("11") });
    await proxy.connect(addr1).depositFunds(ticket.address, 5, { value: ethers.utils.parseEther("11") });
    await proxy.connect(addr2).depositFunds(ticket.address, 6, { value: ethers.utils.parseEther("11") });
    await proxy.selectSurpriseWinner();
    console.log("After surprise winner:",ethers.utils.formatEther(await owner.getBalance())
                ,ethers.utils.formatEther(await addr1.getBalance())
                ,ethers.utils.formatEther(await addr2.getBalance()));

    let timeout = new Promise(function(resolve) {
      setTimeout(resolve, 15000);
    });
    await timeout;
    await proxy.triggerEnd();

    console.log("After final winner:---", ethers.utils.formatEther(await owner.getBalance())
    ,ethers.utils.formatEther(await addr1.getBalance())
    ,ethers.utils.formatEther(await addr2.getBalance()));

    let final = BigInt(await owner.getBalance()) + BigInt(await addr1.getBalance()) + BigInt(await addr2.getBalance());
    final = final.toString().substring(0,4);

    expect(initial === final);
  });
})