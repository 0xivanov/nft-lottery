
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Ticket
/// @author Ivan Ivanov
/// @notice This contract gives permission to nft owners to deposit funds in the Lottery contract
contract Ticket is ERC721{
    using Counters for Counters.Counter;

    event Mint(uint tokenId, address tokenHolder);
    Counters.Counter private tokenIds;

    constructor () ERC721("Ticket", "TIK") {}

    function mint() external {
        tokenIds.increment();
        _mint(msg.sender, tokenIds.current());
        emit Mint(tokenIds.current(), msg.sender);
    }
}
