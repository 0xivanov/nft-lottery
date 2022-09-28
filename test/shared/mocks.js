
const { smock } = require("@defi-wonderland/smock");

module.exports = {
    deployMockTicket : async function () {
        const MockTicket = await smock.mock("Ticket");
        const mockTicket = await MockTicket.deploy();
        return mockTicket;
    }
}