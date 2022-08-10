# Solidity API

## ExecutablePost

### constructor

```solidity
constructor(address _lens) public
```

### MapIdToPost

```solidity
mapping(bytes32 => struct DataTypes.Post) MapIdToPost
```

### MapAddressToPost

```solidity
mapping(address => struct DataTypes.Post) MapAddressToPost
```

### getPostById

```solidity
function getPostById(bytes32 _id) public view returns (struct DataTypes.Post)
```

Allows to retrieve a specific Executable Post struct by its id.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | bytes32 | Id of the Executable Post struct |

### post

```solidity
function post(struct DataTypes.Post _post, struct DataTypes.PostData _lensPost) external returns (bytes32 id, uint256 initialPubId)
```

Step one in the Executable Post Lifecycle. This function:  
* defines the social contract: what is the "bet", how to resolve the bet and who benefits under what conditions
* creates DataTypes.Post struct that holds all necessary information for future resolution
* transfers ERC20 tokens from sender to contract
* posts on sender behalf into Lens protocol

| Name | Type | Description |
| ---- | ---- | ----------- |
| _post | struct DataTypes.Post | Holds information about the Executable Post. For details see DataTypes.sol |
| _lensPost | struct DataTypes.PostData | Holds information about the post that is forwarded to Lens protocol. User/FrontEnd is responsible for structuring the _lensPost.      No infromation from _post is used in _lensPost automatically. For details see DataTypes.sol of the Lens protocol. https://github.com/aave/lens-protocol/blob/main/contracts/libraries/DataTypes.sol |

### resolveByOwner

```solidity
function resolveByOwner(bytes32 _id, uint8 _resultPartyA, uint8 _resultPartyB, struct DataTypes.CommentData _commentData) external
```

One way close the lifecycle of Executable post. In this case the power to resolve lies solely in the competence of `DataType.Post.resolver`. The resolver
    can split the value to 2 parties, so the sum of shares is 100%
This function:
* transfers share of ERC20 tokens to the beneficiaries
* posts a comment to the original post on the behalf of resolver
* marks the resolved field as true and closes the lifecycle

This function must meet these criteria otherwise reverts:
* Criteria 1: The `MapIdToPost`mapping Id must exist (ie, struct was created earlier)
* Criteria 2: You must use same resolution function as defined in `DataTypes.Post.resolveConditions.resolveType` 
* Criteria 3: Sender must equal to `DataTypes.Post.resolver`
* Criteria 4: Block time must be greater than `DataTypes.Post.resolveAfter`
* Criteria 5: `DataTypes.Post.resolved` must be false
* Criteria 6: Resolver must have Lens Protocol profile
* Criteria A1: _resultPartyA + _resultPartyB must equal 100

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | bytes32 | Pass in the id of the Executable Post. |
| _resultPartyA | uint8 | How much of the `DataTypes.Post.amount` gets party A. Number from 0 to 100. |
| _resultPartyB | uint8 | How much of the `DataTypes.Post.amount` gets party B. Number from 0 to 100. |
| _commentData | struct DataTypes.CommentData | This is a message that is forwarded to original Lens post as a comment. User/FrontEnd is responsible for structuring the _lensPost.      Only id of the original post is used from DataTypes.Post. For details see DataTypes.sol of the Lens protocol |

### resolveByOracle

```solidity
function resolveByOracle(bytes32 _id, uint256 _oracleRoundId, struct DataTypes.CommentData _commentData) external
```

One way to close the lifecycle of Executable post. Resolved by result given by Oracle. 100% of value goes to either party A or Party B. 
This function:
* calls the oracle specified in the `DataTypes.Post.resolveConditions.sourceAddress`
* based on the answer decides who won
* transfers all ERC20 tokens to the winning party 
* posts a comment to the original post on the behalf of resolver
* marks the resolved field as true and closes the lifecycle
    
This function must meet these criteria otherwise reverts:
* Criteria 1: The `MapIdToPost`mapping Id must exist (ie, struct was created earlier)
* Criteria 2: You must use same resolution function as defined in `DataTypes.Post.resolveConditions.resolveType` 
* Criteria 3: Sender must equal to `DataTypes.Post.resolver`
* Criteria 4: Block time must be greater than `DataTypes.Post.resolveAfter`
* Criteria 5: `DataTypes.Post.resolved` must be false
* Criteria 6: Resolver must have Lens Protocol profile
* Criteria B1: Resolver passes roundId that corresponds to the `DataTypes.Post.timestamp`

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | bytes32 | Pass in the id of the Executable Post. |
| _oracleRoundId | uint256 | Represents timestamp. For more reference read here: https://docs.chain.link/docs/historical-price-data/ |
| _commentData | struct DataTypes.CommentData | This is a message that is forwarded to original Lens post as a comment. User/FrontEnd is responsible for structuring the _lensPost.      Only id of the original post is used from DataTypes.Post. For details see DataTypes.sol of the Lens protocol |

