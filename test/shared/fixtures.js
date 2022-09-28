const { deployMockTicket } =  require("./mocks");
const { ethers } = require('hardhat');

module.exports = {
    ticketFixture : async () => {
        const [deployer] = await ethers.getSigners();
        const Ticket = await ethers.getContractFactory("Ticket");
        const ticket = await Ticket.connect(deployer).deploy();
        await ticket.deployed();

        const mockTicket = await deployMockTicket(ticket);
        return { ticket, mockTicket };
    }
}