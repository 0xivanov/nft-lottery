// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./LotteryV1.sol";

/// @title LotteryV2
/// @author Ivan Ivanov
/// @notice This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds 
/// @dev V2 comes with better implementation of the selectSurpriseWinner and triggerEnd functions 
contract LotteryV2 is LotteryV1 {

    string public constant upgradeChecker = "Im new impl";

    using Counters for Counters.Counter;

    /// [1,2,3] -- remove(1) --> [1,3,3] --> [1,3] 
    function remove(uint _index) internal {
      require(_index < ticketIds.length, "Index is out of bounds");
      for(uint i = _index ; i < ticketIds.length - 1; i++) {
        ticketIds[i] = ticketIds[i+1];
      }
      ticketIds.pop();
    }
    function selectSurpriseWinner() external override nonReentrant {
        require(started, "Lottery is not started");
        require(!ended, "Lottery is already ended");
        require(!surpriseWinnerSelected, "Surprise winner is already selected");
        require(msg.sender == owner, "Transaction sender is not owner");
        require(ticketIds.length > 0, "No deposits yet");

        uint winningTicketIndex = getRandomNumber();
        uint winningTicketId = ticketIds[winningTicketIndex];
        emit log(winningTicketIndex, winningTicketId);
        Participant memory surpriseWinner = ticketIdToParticipant[
            winningTicketId
        ];
        payable(surpriseWinner.addr).transfer(deposits / 2);
        console.log("Surprise winner:------", surpriseWinner.addr);
        surpriseWinnerSelected = true;
        deposits = deposits / 2;
        delete ticketIdToParticipant[winningTicketId];
        remove(winningTicketIndex);
        emit SurpriseWin(winningTicketId, surpriseWinner.addr, deposits);
    }

    function triggerEnd() external override nonReentrant resetLottery {
        require(started, "Lottery is not started");
        require(!ended, "Lottery is already ended");
        require(msg.sender == owner, "Transaction sender is not owner");
        require(block.timestamp > endAt, "End time is not reached");

        if (ticketIds.length > 0) {
            uint winningTicketIndex = getRandomNumber();
            uint winningTicketId = ticketIds[winningTicketIndex];
            emit log(winningTicketIndex, winningTicketId);
            Participant memory winner = ticketIdToParticipant[winningTicketId];
            payable(winner.addr).transfer(deposits);
            console.log("Winner:---------------", winner.addr);
            emit End(winningTicketId, winner.addr, deposits);
        } else {
            emit End(0, address(0), deposits);
        }
        ended = true;
        started = false;
    }
}
