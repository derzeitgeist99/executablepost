# Solidity API

## OracleInteraction

All logic that queries Oracles is here

### getOracleTimestampByRoundId

```solidity
function getOracleTimestampByRoundId(address _aggregatorAddress, uint256 _roundId) internal view returns (uint256 _timestamp)
```

### _getAnswer

```solidity
function _getAnswer(address _aggregatorAddress, uint256 _roundId) internal view returns (int256 _answer)
```

### getDecimals

```solidity
function getDecimals(address _aggregatorAddress) internal view returns (uint8 _decimals)
```

