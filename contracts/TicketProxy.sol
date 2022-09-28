// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/proxy/Proxy.sol";

contract TicketProxy is Proxy{
    
    address logicContractAddress;
    
    constructor(address _logicContractAddress){
        logicContractAddress = _logicContractAddress;
    }

    function _implementation() internal view override returns (address) {
        return logicContractAddress;
    }

    function changeImpl(address impl) external {
      logicContractAddress = impl;
    }
}