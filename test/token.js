//tests for Ticket contract
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe('Tests for Ticket.sol', () => {

  let Ticket, ticket, owner, addr1, addr2;
  beforeEach("get contracts", async function () {
    Ticket = await hre.ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy();
    await ticket.deployed();
    [owner, addr1, addr2, _] = await ethers.getSigners();
  })

  it('Should set the right owner', async function () {
    await ticket.mint();
    expect(await ticket.ownerOf(1) == owner.address);
  })
})