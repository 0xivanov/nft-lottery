// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./LotteryBeacon.sol";
import "./LotteryV1.sol";

/// @title LotteryFactory
/// @author Ivan Ivanov
/// @notice This contract creates proxy contracts given an implementation by the beacon
contract LotteryFactory {

    mapping (uint => address) public lotteries;
    LotteryBeacon public immutable beacon;

    constructor (address implementation) {
        beacon = new LotteryBeacon(implementation);
    }

    function buildLottery (uint _minDeposit, address _ticketAddress, uint lotteryId) public {
        BeaconProxy lottery = new BeaconProxy(address(beacon),
        abi.encodeWithSelector(LotteryV1(address(0)).initialize.selector, _minDeposit, _ticketAddress));
        lotteries[lotteryId] = address(lottery);
    }
}