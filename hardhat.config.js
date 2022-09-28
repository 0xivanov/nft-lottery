require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("solidity-docgen");
require("@nomicfoundation/hardhat-chai-matchers");
require('solidity-coverage')
require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  mocha: {
    timeout: 60000
  },
  settings: {
    outputSelection: {
      "*": {
          "*": ["storageLayout"],
      },
    },
  }
};
