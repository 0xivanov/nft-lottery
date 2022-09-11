// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/// @title LotteryBeacon
/// @author Ivan Ivanov
/// @notice This contract holds the implementation of the Lottery and the logic to upgrade to new version
contract LotteryBeacon {

    UpgradeableBeacon public immutable beacon;
    address public immutable owner;
    address public implementation;

    constructor(address _implementation) {
        beacon = new UpgradeableBeacon(_implementation);
        implementation = _implementation;
        owner = tx.origin;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can update implementation");
        _;
    }

    function update(address newImplementaion) public onlyOwner {
        beacon.upgradeTo(newImplementaion);
        implementation = newImplementaion;
    }
}