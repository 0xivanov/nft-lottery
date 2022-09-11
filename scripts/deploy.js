//initial deploy script
const hre = require("hardhat");

async function main() {

  const Ticket = await hre.ethers.getContractFactory("Ticket");
  const ticket = await Ticket.deploy();
  await ticket.deployed();

  const LotteryV1 = await hre.ethers.getContractFactory("LotteryV1");
  const lotteryV1 = await LotteryV1.deploy();
  await lotteryV1.deployed();

  const LotteryV2 = await hre.ethers.getContractFactory("LotteryV2");
  const lotteryV2 = await LotteryV2.deploy();
  await lotteryV2.deployed();

  const LotteryFactory = await hre.ethers.getContractFactory("LotteryFactory");
  const lotteryFactory = await LotteryFactory.deploy(lotteryV2.address);
  await lotteryFactory.deployed();

  const beaconAddress = await lotteryFactory.beacon();
  console.log(beaconAddress);
  const lotteryBeacon = await hre.ethers.getContractAt("LotteryBeacon", beaconAddress);
  console.log(lotteryBeacon)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
