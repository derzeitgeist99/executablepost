# Solidity API

## ERC20Interaction

All logic that moves ERC20 tokens around is here

### _checkERCBalance

```solidity
modifier _checkERCBalance(uint256 _amount, address _currency, address _owner)
```

_Since we are 3rd party we need to check both allowance and balance. This could be broken down into more functions. Is it better?_

### _transferFromERC

```solidity
function _transferFromERC(uint256 _amount, address _currency, address _owner) internal
```

### _transferERC

```solidity
function _transferERC(uint256 _amount, address _currency, address _to) internal
```

