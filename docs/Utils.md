# Solidity API

## Utils

This holds helper functions to break down complex logic into smaller pieces

### oracleTimestampTolerance

```solidity
uint16 oracleTimestampTolerance
```

### _canResolve

```solidity
modifier _canResolve(struct DataTypes.Post post, enum DataTypes.ResolveTypes _resolveType)
```

In order to resolve an executable post you need to meet multiple criteria. This one check them

### _is100

```solidity
modifier _is100(uint8 _resultPartyA, uint8 _resultPartyB)
```

_Used in Manual resolution to check if a+b = 100_

### _isRoundIdOK

```solidity
modifier _isRoundIdOK(uint256 _roundId, struct DataTypes.ResolveConditions _resolveConditions)
```

_used in resolveByOracle to see if oracleRound represents timestamp specified in EP definition_

### generateId

```solidity
function generateId() internal view returns (bytes32)
```

_used in post to generate unique ID for each instance of EP_

### calculateTransferAmount

```solidity
function calculateTransferAmount(uint8 _result, uint256 _amount) internal pure returns (uint256)
```

### absDelta

```solidity
function absDelta(uint256 _num1, uint256 _num2) internal pure returns (uint256 absDelta)
```

