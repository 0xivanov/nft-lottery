// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interface/ITicket.sol";
import "hardhat/console.sol";

error InvalidInput();
error InvalidAmount();
error Unavailable();
error Unauthorized();
error TransactionFailed();
error WinnerAlreadyChosen();

/// @title Ticket
/// @author Ivan Ivanov
/// @notice This contract gives permission to nft owners to deposit funds in the Lottery contract
contract Ticket is
    ITicket,
    ReentrancyGuard,
    Initializable,
    ERC721URIStorageUpgradeable
{
    using Counters for Counters.Counter;

    Counters.Counter public ticketIds;

    uint256 public startBlockNumber;
    uint256 public endBlockNumber;

    uint256 public rewardPool;
    uint256 public TICKET_PRICE;

    bool public firstWinnerSelected;
    bool public secondWinnerSelected;

    address public owner;

    mapping(uint256 => address) public ticketIdsToParticipants;

    modifier fromBlock(uint256 blockNumber) {
        if (block.number < blockNumber) revert Unavailable();
        _;
    }

    modifier toBlock(uint256 blockNumber) {
        if (block.number > blockNumber) revert Unavailable();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function initialize(
        string calldata _name,
        string calldata _symbol,
        uint256 _startBlockNumber,
        uint256 _endBlockNumber,
        uint256 ticketPrice,
        address _owner
    ) external initializer {
        if (
            bytes(_name).length == 0 ||
            bytes(_symbol).length == 0 ||
            _startBlockNumber < block.number ||
            _endBlockNumber < _startBlockNumber ||
            ticketPrice <= 0 ||
            _owner == address(0)
        ) revert InvalidInput();

        __ERC721_init(_name, _symbol);
        startBlockNumber = _startBlockNumber;
        endBlockNumber = _endBlockNumber;
        TICKET_PRICE = ticketPrice;
        owner = _owner;
    }

    function started() external view returns (bool) {
        if (startBlockNumber == 0) return false;
        return block.number > startBlockNumber;
    }

    function finished() external view returns (bool) {
        if (endBlockNumber == 0) return false;
        return block.number > endBlockNumber;
    }

    function buyTicket()
        external
        payable
        fromBlock(startBlockNumber)
        toBlock(endBlockNumber)
    {
        if (msg.value != TICKET_PRICE) revert InvalidAmount();
        createTicket();
        ticketIdsToParticipants[ticketIds.current()] = msg.sender;
        ticketIds.increment();
        emit TicketBought(msg.sender, msg.value);
    }

    function pickFirstWinner() external onlyOwner {
        if (ticketIdsToParticipants[0] == address(0)) revert Unavailable();
        if (firstWinnerSelected) revert WinnerAlreadyChosen();
        (uint256 ticketId, address winner) = pickWinner(rewardPool / 2);
        rewardPool = rewardPool / 2;
        firstWinnerSelected = true;
        emit FirstWinnerSelected(ticketId, winner, rewardPool);
    }

    function pickSecondWinner() external onlyOwner fromBlock(endBlockNumber) {
        if (ticketIdsToParticipants[0] == address(0) || !firstWinnerSelected)
            revert Unavailable();
        if (secondWinnerSelected) revert WinnerAlreadyChosen();
        (uint256 ticketId, address winner) = pickWinner(rewardPool);
        secondWinnerSelected = true;
        emit SecondWinnerSelected(ticketId, winner, rewardPool);
        rewardPool = 0;
    }

    function pickWinner(uint256 reward) internal returns (uint256, address) {
        uint256 randomNumber = getRandomNumber(ticketIds.current());
        address winner = ticketIdsToParticipants[randomNumber];
        payable(winner).transfer(reward);
        return (randomNumber, winner);
    }

    function createTicket() internal virtual {
        _mint(msg.sender, ticketIds.current());
        rewardPool += msg.value;
    }

    function getRandomNumber(uint256 floor)
        internal
        view
        virtual
        returns (uint256)
    {
        if (floor <= 0) revert InvalidInput();

        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                        block.difficulty +
                        ((
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                        ) / (block.timestamp)) +
                        block.gaslimit +
                        ((uint256(keccak256(abi.encodePacked(msg.sender)))) /
                            (block.timestamp)) +
                        block.number
                )
            )
        );

        return seed % floor;
    }
}
