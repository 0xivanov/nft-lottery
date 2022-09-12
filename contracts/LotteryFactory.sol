// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./LotteryBeacon.sol";
import "./LotteryV1.sol";
import "./LotteryV2.sol";


/// @title LotteryFactory
/// @author Ivan Ivanov
/// @notice This contract creates proxy contracts given an implementation by the beacon
contract LotteryFactory {

    mapping (uint => address) public lotteries;
    LotteryBeacon public immutable beacon;

    constructor (address implementation) {
        beacon = new LotteryBeacon(implementation);
    }

    function buildLottery (uint _salt, uint _deposit, address _ticketAddress, uint lotteryId) public {
        BeaconProxy lottery = new BeaconProxy{salt: bytes32(_salt)}(address(beacon),
        abi.encodeWithSelector(LotteryV1(address(0)).initialize.selector,_deposit,_ticketAddress));
        lotteries[lotteryId] = address(lottery);
    }

    function getBytecode(uint deposit, address ticketAddress) internal view returns (bytes memory) {
        bytes memory bytecode = type(BeaconProxy).creationCode;

        return abi.encodePacked(bytecode, abi.encode(address(beacon), abi.encodeWithSelector(LotteryV1(address(0)).initialize.selector, deposit, ticketAddress)));
    }

    /// Precompute the address of the beacon proxy
    function getAddress(uint _salt, uint deposit, address ticketAddress)
        public
        view
        returns (address)
    {
        bytes memory bytecode = getBytecode(deposit, ticketAddress);
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode))
        );

        // NOTE: cast last 20 bytes of hash to address
        return address(uint160(uint(hash)));
    }
}