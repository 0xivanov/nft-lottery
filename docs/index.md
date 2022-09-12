# Solidity API

## LotteryBeacon

This contract holds the implementation of the Lottery and the logic to upgrade to new version

### beacon

```solidity
contract UpgradeableBeacon beacon
```

### owner

```solidity
address owner
```

### implementation

```solidity
address implementation
```

### constructor

```solidity
constructor(address _implementation) public
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### update

```solidity
function update(address newImplementaion) public
```

## LotteryFactory

This contract creates proxy contracts given an implementation by the beacon

### lotteries

```solidity
mapping(uint256 => address) lotteries
```

### beacon

```solidity
contract LotteryBeacon beacon
```

### constructor

```solidity
constructor(address implementation) public
```

### buildLottery

```solidity
function buildLottery(uint256 _salt, uint256 _deposit, address _ticketAddress, uint256 lotteryId) public
```

### getBytecode

```solidity
function getBytecode(uint256 deposit, address ticketAddress) internal view returns (bytes)
```

### getAddress

```solidity
function getAddress(uint256 _salt, uint256 deposit, address ticketAddress) public view returns (address)
```

Precompute the address of the beacon proxy

## LotteryV1

This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds

### Participant

```solidity
struct Participant {
  address addr;
  bool exists;
}
```

### owner

```solidity
address owner
```

### ticketAddress

```solidity
address ticketAddress
```

### ticketIdToParticipant

```solidity
mapping(uint256 => struct LotteryV1.Participant) ticketIdToParticipant
```

address of the TIK nft.

### ticketIds

```solidity
uint256[] ticketIds
```

### started

```solidity
bool started
```

helper array to store the number of tickets

### ended

```solidity
bool ended
```

### startAt

```solidity
uint32 startAt
```

### endAt

```solidity
uint32 endAt
```

### deposit

```solidity
uint256 deposit
```

### deposits

```solidity
uint256 deposits
```

### surpriseWinnerSelected

```solidity
bool surpriseWinnerSelected
```

### locked

```solidity
bool locked
```

### Start

```solidity
event Start(uint256 startAt, uint256 endAt)
```

### Deposit

```solidity
event Deposit(address sender, uint256 amount)
```

### SurpriseWin

```solidity
event SurpriseWin(uint256 winningTicket, address surpriseWinner, uint256 amount)
```

### End

```solidity
event End(uint256 winningTicket, address winner, uint256 amount)
```

### log

```solidity
event log(uint256 random, uint256 winningTicketId)
```

### nonReentrant

```solidity
modifier nonReentrant()
```

### resetLottery

```solidity
modifier resetLottery()
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### initialize

```solidity
function initialize(uint256 _deposit, address _ticketAddress) external
```

Initializer for the LotteryFactory

| Name | Type | Description |
| ---- | ---- | ----------- |
| _deposit | uint256 | Deposit requirement |
| _ticketAddress | address | Address of the TIK nft. |

### triggerStart

```solidity
function triggerStart(uint8 _minutes) external virtual
```

Start the lottery

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minutes | uint8 | When this time passes the owner can end the lottery and no more deposits are accepted |

### depositFunds

```solidity
function depositFunds(address _ticket, uint256 ticketId) external payable virtual
```

Deposit funds in the prize pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ticket | address | Address of the TIK nft. |
| ticketId | uint256 | Id of the TIK nft which is used for this deposit |

### selectSurpriseWinner

```solidity
function selectSurpriseWinner() external virtual
```

Sends 50% of the prize pool to random participant
Can be called only by the owner and the lottery should be started

### triggerEnd

```solidity
function triggerEnd() external virtual
```

Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
Can be called only by the owner and the end time should be passed

### forceEnd

```solidity
function forceEnd() external virtual
```

Forcing the end of the lottery in case trigger end does not work
Can be called only by the owner and the end time should be passed

### changeDepositReq

```solidity
function changeDepositReq(uint256 _deposit) external virtual
```

Changes the deposit requirement

### getRandomNumber

```solidity
function getRandomNumber() internal view virtual returns (uint256)
```

Returns random number from 0-number of participants

_This can be vulnerable to attacks. Use Chainlink VRF instead_

### append

```solidity
function append(string a, string b, string c) internal pure returns (string)
```

## LotteryV2

This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds

_V2 comes with better implementation of the selectSurpriseWinner and triggerEnd functions_

### upgradeChecker

```solidity
string upgradeChecker
```

### remove

```solidity
function remove(uint256 _index) internal
```

[1,2,3] -- remove(1) --> [1,3,3] --> [1,3]

### selectSurpriseWinner

```solidity
function selectSurpriseWinner() external
```

Sends 50% of the prize pool to random participant
Can be called only by the owner and the lottery should be started

### triggerEnd

```solidity
function triggerEnd() external
```

Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
Can be called only by the owner and the end time should be passed

## Ticket

This contract gives permission to nft owners to deposit funds in the Lottery contract

### Mint

```solidity
event Mint(uint256 tokenId, address tokenHolder)
```

### tokenIds

```solidity
struct Counters.Counter tokenIds
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint() external
```

## LotteryBeacon

This contract holds the implementation of the Lottery and the logic to upgrade to new version

### beacon

```solidity
contract UpgradeableBeacon beacon
```

### owner

```solidity
address owner
```

### implementation

```solidity
address implementation
```

### constructor

```solidity
constructor(address _implementation) public
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### update

```solidity
function update(address newImplementaion) public
```

## LotteryFactory

This contract creates proxy contracts given an implementation by the beacon

### lotteries

```solidity
mapping(uint256 => address) lotteries
```

### beacon

```solidity
contract LotteryBeacon beacon
```

### constructor

```solidity
constructor(address implementation) public
```

### log

```solidity
event log(bytes test)
```

### buildLottery

```solidity
function buildLottery(uint256 _salt, uint256 _deposit, address _ticketAddress, uint256 lotteryId) public
```

### getBytecode

```solidity
function getBytecode(address _beacon, bytes lotteryAbi) public pure returns (bytes)
```

### getAddress

```solidity
function getAddress(uint256 _salt, address _beacon, uint256 _deposit, address _ticketAddress, address logic) public view returns (address)
```

### getContractCreationCode

```solidity
function getContractCreationCode(address logic) internal pure returns (bytes)
```

### computeAddress

```solidity
function computeAddress(uint256 salt, address implementation) public view returns (address)
```

## LotteryV1

This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds

### Participant

```solidity
struct Participant {
  address addr;
  bool exists;
}
```

### owner

```solidity
address owner
```

### ticketAddress

```solidity
address ticketAddress
```

### ticketIdToParticipant

```solidity
mapping(uint256 => struct LotteryV1.Participant) ticketIdToParticipant
```

address of the TIK nft.

### ticketIds

```solidity
uint256[] ticketIds
```

### started

```solidity
bool started
```

helper array to store the number of tickets

### ended

```solidity
bool ended
```

### startAt

```solidity
uint32 startAt
```

### endAt

```solidity
uint32 endAt
```

### deposit

```solidity
uint256 deposit
```

### deposits

```solidity
uint256 deposits
```

### surpriseWinnerSelected

```solidity
bool surpriseWinnerSelected
```

### locked

```solidity
bool locked
```

### Start

```solidity
event Start(uint256 startAt, uint256 endAt)
```

### Deposit

```solidity
event Deposit(address sender, uint256 amount)
```

### SurpriseWin

```solidity
event SurpriseWin(uint256 winningTicket, address surpriseWinner, uint256 amount)
```

### End

```solidity
event End(uint256 winningTicket, address winner, uint256 amount)
```

### log

```solidity
event log(uint256 random, uint256 winningTicketId)
```

### nonReentrant

```solidity
modifier nonReentrant()
```

### resetLottery

```solidity
modifier resetLottery()
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### initialize

```solidity
function initialize(uint256 _deposit, address _ticketAddress) external
```

Initializer for the LotteryFactory

| Name | Type | Description |
| ---- | ---- | ----------- |
| _deposit | uint256 | Deposit requirement |
| _ticketAddress | address | Address of the TIK nft. |

### triggerStart

```solidity
function triggerStart(uint8 _minutes) external virtual
```

Start the lottery

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minutes | uint8 | When this time passes the owner can end the lottery and no more deposits are accepted |

### depositFunds

```solidity
function depositFunds(address _ticket, uint256 ticketId) external payable virtual
```

Deposit funds in the prize pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ticket | address | Address of the TIK nft. |
| ticketId | uint256 | Id of the TIK nft which is used for this deposit |

### selectSurpriseWinner

```solidity
function selectSurpriseWinner() external virtual
```

Sends 50% of the prize pool to random participant
Can be called only by the owner and the lottery should be started

### triggerEnd

```solidity
function triggerEnd() external virtual
```

Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
Can be called only by the owner and the end time should be passed

### forceEnd

```solidity
function forceEnd() external virtual
```

Forcing the end of the lottery in case trigger end does not work
Can be called only by the owner and the end time should be passed

### changeDepositReq

```solidity
function changeDepositReq(uint256 _deposit) external virtual
```

Changes the deposit requirement

### getRandomNumber

```solidity
function getRandomNumber() internal view virtual returns (uint256)
```

Returns random number from 0-number of participants

_This can be vulnerable to attacks. Use Chainlink VRF instead_

### append

```solidity
function append(string a, string b, string c) internal pure returns (string)
```

## Ticket

This contract gives permission to nft owners to deposit funds in the Lottery contract

### Mint

```solidity
event Mint(uint256 tokenId, address tokenHolder)
```

### tokenIds

```solidity
struct Counters.Counter tokenIds
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint() external
```

## LotteryBeacon

This contract holds the implementation of the Lottery and the logic to upgrade to new version

### beacon

```solidity
contract UpgradeableBeacon beacon
```

### owner

```solidity
address owner
```

### implementation

```solidity
address implementation
```

### constructor

```solidity
constructor(address _implementation) public
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### update

```solidity
function update(address newImplementaion) public
```

## LotteryFactory

This contract creates proxy contracts given an implementation by the beacon

### lotteries

```solidity
mapping(uint256 => address) lotteries
```

### beacon

```solidity
contract LotteryBeacon beacon
```

### constructor

```solidity
constructor(address implementation) public
```

### buildLottery

```solidity
function buildLottery(uint256 _minDeposit, address _ticketAddress, uint256 lotteryId) public
```

## LotteryV1

This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds

### Participant

```solidity
struct Participant {
  address addr;
  bool exists;
}
```

### owner

```solidity
address owner
```

### ticketAddress

```solidity
address ticketAddress
```

### ticketIdToParticipant

```solidity
mapping(uint256 => struct LotteryV1.Participant) ticketIdToParticipant
```

address of the TIK nft.

### ticketIds

```solidity
uint256[] ticketIds
```

### started

```solidity
bool started
```

helper array to store the number of tickets

### ended

```solidity
bool ended
```

### startAt

```solidity
uint32 startAt
```

### endAt

```solidity
uint32 endAt
```

### minDeposit

```solidity
uint256 minDeposit
```

### deposits

```solidity
uint256 deposits
```

### surpriseWinnerSelected

```solidity
bool surpriseWinnerSelected
```

### locked

```solidity
bool locked
```

### Start

```solidity
event Start(uint256 startAt, uint256 endAt)
```

### Deposit

```solidity
event Deposit(address sender, uint256 amount)
```

### SurpriseWin

```solidity
event SurpriseWin(uint256 winningTicket, address surpriseWinner, uint256 amount)
```

### End

```solidity
event End(uint256 winningTicket, address winner, uint256 amount)
```

### log

```solidity
event log(uint256 random, uint256 winningTicketId)
```

### nonReentrant

```solidity
modifier nonReentrant()
```

### resetLottery

```solidity
modifier resetLottery()
```

### initialize

```solidity
function initialize(uint256 _minDeposit, address _ticketAddress) external
```

Initializer for the LotteryFactory

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minDeposit | uint256 | Minimal deposit |
| _ticketAddress | address | Address of the TIK nft. |

### triggerStart

```solidity
function triggerStart(uint8 _minutes) external virtual
```

Start the lottery

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minutes | uint8 | When this time passes the owner can end the lottery and no more deposits are accepted |

### deposit

```solidity
function deposit(address _ticket, uint256 ticketId) external payable virtual
```

Deposit funds in the prize pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ticket | address | Address of the TIK nft. |
| ticketId | uint256 | Id of the TIK nft which is used for this deposit |

### selectSurpriseWinner

```solidity
function selectSurpriseWinner() external virtual
```

Sends 50% of the prize pool to random participant
Can be called only by the owner and the lottery should be started

### triggerEnd

```solidity
function triggerEnd() external virtual
```

Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
Can be called only by the owner and the end time should be passed

### getRandomNumber

```solidity
function getRandomNumber() internal view virtual returns (uint256)
```

Returns random number from 0-number of participants

_This can be vulnerable to attacks. Use Chainlink VRF instead_

## LotteryV2

This contract stores deposits for users holding the TIK token. When the lottery ends, one user get 50% of the funds

_V2 comes with better implementation of the selectSurpriseWinner and triggerEnd functions_

### upgradeChecker

```solidity
string upgradeChecker
```

### remove

```solidity
function remove(uint256 _index) internal
```

[1,2,3] -- remove(1) --> [1,3,3] --> [1,3]

### selectSurpriseWinner

```solidity
function selectSurpriseWinner() external
```

Sends 50% of the prize pool to random participant
Can be called only by the owner and the lottery should be started

### triggerEnd

```solidity
function triggerEnd() external
```

Sends 50% of the prize pool to random participant and ends the current iteration of the lottery
Can be called only by the owner and the end time should be passed

## Ticket

