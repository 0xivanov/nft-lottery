// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./TicketProxy.sol";
import "./ticket/interface/ITicket.sol";
import "./ticket/Ticket.sol";

contract TicketFactory {
    address[] public ticketProxyContracts;

    address public impl;

    constructor(address _impl) {
        impl = _impl;
    }

    function addNewProxy(
        string calldata _name,
        string calldata _symbol,
        uint256 _startBlockNumber,
        uint256 _endBlockNumber,
        uint32 _ticketPrice,
        address _owner
    ) public {
        address newTicketProxy = address(new TicketProxy(impl));
        ITicket(newTicketProxy).initialize(
            _name,
            _symbol,
            _startBlockNumber,
            _endBlockNumber,
            _ticketPrice,
            _owner
        );
        ticketProxyContracts.push(newTicketProxy);
    }
}
