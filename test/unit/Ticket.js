//tests for Ticket contract

const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployMockTicket } = require("../shared/mocks");
let { NAME, SYMBOL, PRICE, getBlocks } = require("../utils/ticket-utils");
const { mineBlocks } = require("../utils/mineBlocks")

describe.only('Tests for Ticket.sol', function () {

    async function deployTokenFixture() {
        const [deployer, alice, bob, charlie, daniel] = await ethers.getSigners();
        const Ticket = await ethers.getContractFactory("Ticket");
        const ticket = await Ticket.deploy();

        const mockTicket = await deployMockTicket(ticket);
        return { deployer, alice, bob, charlie, daniel, ticket, mockTicket };
    }

    async function loadVariables() {
        const blocks = await getBlocks();
        const { deployer, alice, bob, charlie, daniel, ticket, mockTicket } = await loadFixture(deployTokenFixture);
        const initParams = [NAME, SYMBOL, blocks.START_BLOCK, blocks.END_BLOCK, PRICE, deployer.address];

        return { deployer, alice, bob, charlie, daniel, ticket, mockTicket, initParams, blocks };
    }

    describe("Initialize", async function () {
        let ticket, deployer, blocks, initParams;
        beforeEach(async function () {
            ({ ticket, deployer, blocks, initParams } = await loadVariables());
            await ticket.initialize(...initParams);
        });

        it("should set name", async function () {
            expect(await ticket.name()).to.equal(NAME);
        });
        it("should set symbol", async function () {
            expect(await ticket.symbol()).to.equal(SYMBOL);
        });
        it("should set start blok number", async function () {
            expect(await ticket.startBlockNumber()).to.equal(blocks.START_BLOCK);
        });
        it("should set end block number", async function () {
            expect(await ticket.endBlockNumber()).to.equal(blocks.END_BLOCK);
        });
        it("should set ticket price", async function () {
            expect(await ticket.TICKET_PRICE()).to.equal(PRICE);
        });
        it("should set owner", async function () {
            expect(await ticket.owner()).to.equal(deployer.address);
        });
    });

    describe("Revert initialize", async function () {
        let ticket, blocks, initParams;
        let initError = false;
        beforeEach(async function () {
            ({ ticket, blocks, initParams } = await loadVariables());
        });

        afterEach(async function () {
            if (initError) {
                await expect(ticket.initialize(...initParams))
                    .to.be.revertedWith("Initializable: contract is already initialized");
            } else {
                await expect(ticket.initialize(...initParams))
                    .to.be.revertedWithCustomError(ticket, "InvalidInput");
            }
        });

        it('should throw if name is empty string', function () {
            initParams[0] = "";
        });

        it('should throw if symbol is empty string', function () {
            initParams[1] = "";
        });

        it('should throw if starting block less than current one', function () {
            initParams[2] = blocks.CURRENT_BLOCK - 1;
        });

        it('should throw if ending block less than or equal to the starting one', function () {
            initParams[3] = blocks.START_BLOCK - 1;
        });

        it('should throw if ticket is free', function () {
            initParams[4] = 0;
        });

        it('should throw if initialize is called multiple times', async function () {
            await ticket.initialize(...initParams);
            initError = true;
        });
    });

    describe("BuyTicket", async function () {
        let ticket, alice, initParams;
        beforeEach(async function () {
            ({ ticket, alice, initParams, blocks } = await loadVariables());
            await ticket.initialize(...initParams);
            await mineBlocks(7);
            await ticket.connect(alice).buyTicket({ value: PRICE });
        });

        afterEach(async function () {
            ({ blocks } = await loadVariables());
        });

        it('should mint ticket and transfer its ownership', async function () {
            expect(await ticket.ownerOf(0)).to.equal(alice.address);
        });

        it('should increase ticketIds', async function () {
            expect(await ticket.ticketIds()).to.equal(BigNumber.from(1));
        });

        it('should increase reward pool', async function () {
            expect(await ticket.rewardPool()).to.equal(PRICE);
        });

        it('should increase reward pool', async function () {
            expect(await ticket.rewardPool()).to.equal(PRICE);
        });

        it('should set the participantsToTicketId mapping correctly', async function () {
            expect(await ticket.ticketIdsToParticipants(0)).to.equal(alice.address);
        });
    });

    describe("Revert buyTicket", async function () {
        let ticket, initParams;
        let priceError = false;
        beforeEach(async function () {
            ({ ticket, deployer, blocks, initParams } = await loadVariables());
            await ticket.initialize(...initParams);
        });

        afterEach(async function () {
            if (priceError) {
                await expect(ticket.buyTicket({ value: PRICE.add(BigInt(1)) })).to.be.revertedWithCustomError(ticket, "InvalidAmount");
            } else {
                await expect(ticket.buyTicket({ value: PRICE })).to.be.revertedWithCustomError(ticket, "Unavailable");
            }
            ({ blocks } = await loadVariables());
        });

        it('should throw if start block number is bigger than current block number', async function () {

        });

        it('should throw if end block number is smaller than current block number', async function () {
            await mineBlocks(16);
        });

        it('should throw if transaction value is not equal to ticket price', async function () {
            await mineBlocks(6);
            priceError = true;
        });

    });

    describe("PickFirstWinner and PickSecondWinner", async function () {
        let ticket, initParams, deployer, alice, bob, charlie, daniel, rewardPool;
        beforeEach(async function () {
            ({ ticket, initParams, deployer, alice, bob, charlie, daniel } = await loadVariables());
            await ticket.initialize(...initParams);
            await mineBlocks(6);
            await ticket.connect(alice).buyTicket({ value: PRICE });
            rewardPool = BigNumber.from(0);
            rewardPool = rewardPool.add(PRICE); // ????
        });

        afterEach(async function () {
            ({ blocks } = await loadVariables());
        });

        it('should pay the winner', async function () {
            await expect(ticket.connect(deployer).pickFirstWinner())
                .to.changeEtherBalances(
                    [alice, ticket],
                    [rewardPool.div(2), -rewardPool.div(2)]
                );

            rewardPool = rewardPool.div(2)
            await mineBlocks(10);

            await expect(ticket.connect(deployer).pickSecondWinner())
                .to.changeEtherBalances(
                    [alice, ticket],
                    [rewardPool, -rewardPool]
                );
        });

        it('should half the rewardPool and change flag to true', async function () {
            await ticket.connect(deployer).pickFirstWinner();
            expect(await ticket.rewardPool())
                .to.equal(rewardPool.div(2));
            expect(await ticket.firstWinnerSelected())
                .to.equal(true);

            rewardPool = rewardPool.div(2)
            await mineBlocks(10);

            await expect(ticket.connect(deployer).pickSecondWinner())
                .to.changeEtherBalances(
                    [alice, ticket],
                    [rewardPool, -rewardPool]
                );
            expect(await ticket.rewardPool())
                .to.equal(0);
            expect(await ticket.secondWinnerSelected())
                .to.equal(true);

        });

        it('should emit event', async function () {
            await expect(ticket.connect(deployer).pickFirstWinner())
                .to.emit(ticket, "FirstWinnerSelected").withArgs(0, alice.address, rewardPool.div(2));

            rewardPool = rewardPool.div(2)
            await mineBlocks(10);

            await expect(ticket.connect(deployer).pickSecondWinner())
                .to.emit(ticket, "SecondWinnerSelected").withArgs(0, alice.address, rewardPool);
        });

        describe("#multiple participants", async function () {
            beforeEach(async function () {
                await ticket.connect(bob).buyTicket({ value: PRICE });
                await ticket.connect(charlie).buyTicket({ value: PRICE });
                await ticket.connect(daniel).buyTicket({ value: PRICE });
                rewardPool = rewardPool.add(PRICE.mul(3));
            });

            for (let index = 0; index < 6; index++) {
                it('should pay the winner', async function () {
                    let tx = await ticket.connect(deployer).pickFirstWinner();
                    let result = await tx.wait();
                    const event = result.events.find(event => event.event === 'FirstWinnerSelected');
                    const [ticketId, winnerAddress, reward] = event.args;
                    console.log(ticketId, winnerAddress, reward);
                    let winner = await ethers.getSigner(winnerAddress);
                    await expect(tx)
                        .to.changeEtherBalances(
                            [winner, ticket],
                            [rewardPool.div(2), -rewardPool.div(2)]
                        );

                    rewardPool = rewardPool.div(2)
                    await mineBlocks(10);

                    let tx2 = await ticket.connect(deployer).pickSecondWinner();
                    let result2 = await tx2.wait();
                    const event2 = result2.events.find(event => event.event === 'SecondWinnerSelected');
                    const [ticketId2, winnerAddress2, reward2] = event2.args;
                    console.log(ticketId2, winnerAddress2, reward2);
                    let winner2 = await ethers.getSigner(winnerAddress2);
                    await expect(tx2)
                        .to.changeEtherBalances(
                            [winner2, ticket],
                            [rewardPool, -rewardPool]
                        );
                });
            }

            it('should half the rewardPool and change flag to true', async function () {
                await ticket.connect(deployer).pickFirstWinner();
                expect(await ticket.rewardPool())
                    .to.equal(rewardPool.div(2));
                expect(await ticket.firstWinnerSelected())
                    .to.equal(true);

                await mineBlocks(10);

                await ticket.connect(deployer).pickSecondWinner();
                expect(await ticket.rewardPool())
                    .to.equal(0);
                expect(await ticket.secondWinnerSelected())
                    .to.equal(true);
            });

            it('should emit event', async function () {
                await expect(ticket.connect(deployer).pickFirstWinner())
                    .to.emit(ticket, "FirstWinnerSelected");

                await mineBlocks(10);

                await expect(ticket.connect(deployer).pickSecondWinner())
                    .to.emit(ticket, "SecondWinnerSelected");
            });
        });
    });

    describe("Revert PickFirstWinner and PickSecondWinner", async function () {
        let ticket, initParams, deployer, alice;
        let buyTicket = true;
        beforeEach(async function () {
            ({ ticket, initParams, deployer, alice } = await loadVariables());
            await ticket.initialize(...initParams);
            if (buyTicket) {
                await mineBlocks(6);
                await ticket.connect(alice).buyTicket({ value: PRICE });
            }
        });

        afterEach(async function () {
            ({ blocks } = await loadVariables());
        });

        it('should throw if not owner calls the function ', async function () {
            await expect(ticket.connect(alice).pickFirstWinner())
                .to.revertedWithCustomError(ticket, "Unauthorized");
            await expect(ticket.connect(alice).pickSecondWinner())
                .to.revertedWithCustomError(ticket, "Unauthorized");
        });

        it('should throw if winner is already chosen', async function () {
            await ticket.connect(deployer).pickFirstWinner();
            await expect(ticket.connect(deployer).pickFirstWinner())
                .to.revertedWithCustomError(ticket, "WinnerAlreadyChosen");

            await mineBlocks(10);

            await ticket.connect(deployer).pickSecondWinner();
            await expect(ticket.connect(deployer).pickSecondWinner())
                .to.revertedWithCustomError(ticket, "WinnerAlreadyChosen");
            buyTicket = false;
        });

        it('should throw if there are no participants', async function () {
            await expect(ticket.connect(deployer).pickFirstWinner())
                .to.revertedWithCustomError(ticket, "Unavailable");

            await expect(ticket.connect(deployer).pickSecondWinner())
                .to.revertedWithCustomError(ticket, "Unavailable");
        });
    });
});