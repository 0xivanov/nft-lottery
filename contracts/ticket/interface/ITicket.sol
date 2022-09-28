// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITicket {
    event TicketBought(address indexed sender, uint256 amount);
    event FirstWinnerSelected(
        uint256 winningTicket,
        address surpriseWinner,
        uint256 amount
    );
    event SecondWinnerSelected(
        uint256 winningTicket,
        address winner,
        uint256 amount
    );

    //function start() external;

    function started() external view returns (bool);

    function finished() external view returns (bool);

    function buyTicket() external payable;

    function pickFirstWinner() external;

    function pickSecondWinner() external;

    function initialize(
        string calldata _name,
        string calldata _symbol,
        uint256 _startBlockNumber,
        uint256 _endBlockNumber,
        uint256 _ticketPrice,
        address _owner
    ) external;
}
