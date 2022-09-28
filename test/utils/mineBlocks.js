const mineBlocks = async function (numberOfBlocks) {
    await hre.network.provider.send("hardhat_mine", [`0x${numberOfBlocks}`]);
};

module.exports = { mineBlocks };