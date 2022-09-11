// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Ticket.sol";

import "hardhat/console.sol";

/// @title LotteryV1
/// @author Ivan Ivanov
/// @notice This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds
contract LotteryV1 {
    using Counters for Counters.Counter;

    struct Participant {
        address addr;
        bool exists;
    }

    address public owner;
    address public ticketAddress; ///address of the TIK nft.

    mapping(uint => Participant) public ticketIdToParticipant;
    uint[] public ticketIds; /// helper array to store the number of tickets

    bool internal started;
    bool internal ended;
    uint32 public startAt;
    uint32 public endAt;
    uint public minDeposit;
    uint public deposits;
    bool internal surpriseWinnerSelected;
    bool internal locked;

    event Start(uint startAt, uint endAt);
    event Deposit(address indexed sender, uint amount);
    event SurpriseWin(uint winningTicket, address surpriseWinner, uint amount);
    event End(uint winningTicket, address winner, uint amount);
    event log(uint random, uint winningTicketId);

    modifier nonReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    modifier resetLottery() {
        _;
        startAt = 0;
        endAt = 0;
        for (uint i = 0; i < ticketIds.length; i++) {
            uint ticketId = ticketIds[i];
            delete ticketIdToParticipant[ticketId];
        }
        delete ticketIds;
        deposits = 0;
        surpriseWinnerSelected = false;
    }

    /// Initializer for the LotteryFactory
    /// @param _minDeposit Minimal deposit
    /// @param _ticketAddress Address of the TIK nft.
    function initialize(uint _minDeposit, address _ticketAddress) external {
        require(owner == address(0), "Lottery already initilized");
        require(
            _minDeposit > 100,
            "Minimum deposit should be more than 100 wei"
        );
        owner = tx.origin;
        minDeposit = _minDeposit;
        ticketAddress = _ticketAddress;
        ended = true;
    }

    /// Start the lottery
    /// @param _minutes When this time passes the owner can end the lottery and no more deposits are accepted
    function triggerStart(uint8 _minutes) external virtual {
        require(
            msg.sender == owner,
            "Transaction sender is not owner or lottery is not initialized"
        );
        require(!started, "Lottery is already started");
        require(ended, "Lottery is not ended");
        started = true;
        ended = false;
        startAt = uint32(block.timestamp);
        endAt = uint32(block.timestamp + _minutes * 1 seconds);
        emit Start(startAt, endAt);
    }

    /// Deposit funds in the prize pool
    /// @param _ticket Address of the TIK nft.
    /// @param ticketId Id of the TIK nft which is used for this deposit
    function deposit(address _ticket, uint ticketId) external payable virtual {
        require(started, "Lottery is not started");
        require(block.timestamp < endAt, "Lottery ended");
        require(msg.value > minDeposit, "Minimum deposit is 100 wei");
        require(
            _ticket == ticketAddress,
            "This nft is not supported by the lottery"
        );
        require(
            !ticketIdToParticipant[ticketId].exists,
            "This ticket is already used"
        );
        require(
            ERC721(_ticket).ownerOf(ticketId) == msg.sender,
            "Transaction sender is not ticket owner"
        );

        ticketIdToParticipant[ticketId] = Participant(msg.sender, true); /// add ticket id -> participant
        ticketIds.push(ticketId);
        deposits += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    /// Sends 50% of the prize pool to random participant
    ///@notice Can be called only by the owner and the lottery should be started
    function selectSurpriseWinner() external virtual nonReentrant {
        require(started, "Lottery is not started");
        require(!ended, "Lottery is already ended");
        require(!surpriseWinnerSelected, "Surprise winner is already selected");
        require(msg.sender == owner, "Transaction sender is not owner");

        uint winningTicketIndex = getRandomNumber();
        uint winningTicketId = ticketIds[winningTicketIndex];
        emit log(winningTicketIndex, winningTicketId);
        Participant memory surpriseWinner = ticketIdToParticipant[
            winningTicketId
        ];
        console.log(winningTicketIndex, winningTicketId);
        console.log(surpriseWinner.addr);
        payable(surpriseWinner.addr).transfer(deposits / 2);
        surpriseWinnerSelected = true;
    }

    /// Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
    ///@notice Can be called only by the owner and the end time should be passed
    function triggerEnd() external virtual nonReentrant resetLottery {
        require(started, "Lottery is not started");
        require(!ended, "Lottery is already ended");
        require(msg.sender == owner, "Transaction sender is not owner");
        require(block.timestamp > endAt, "End time is not reached");

        uint winningTicketIndex = getRandomNumber();
        uint winningTicketId = ticketIds[winningTicketIndex];
        emit log(winningTicketIndex, winningTicketId);
        Participant memory winner = ticketIdToParticipant[winningTicketId];
        console.log(winningTicketIndex, winningTicketId);
        console.log(winner.addr);
        payable(winner.addr).transfer(deposits);
        ended = true;
        started = false;

        emit End(winningTicketId, winner.addr, deposits);
    }

    ///Returns random number from 0-number of participants
    ///@dev This can be vulnerable to attacks. Use Chainlink VRF instead
    function getRandomNumber() internal view virtual returns (uint256) {
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

        return (seed - ((seed / ticketIds.length) * ticketIds.length));
    }
}
