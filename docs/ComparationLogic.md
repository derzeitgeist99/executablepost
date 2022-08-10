# Solidity API

## ComparationLogic

All logic that compares expected results vs actual is here

_The challenge here was to give users freedom to set if expcted value should be higher, lower or equal to a future value
 therefore I went for this "switch" mechanism. At one point this can become more crowded, therefore it has own Contract as readability is critical._

### _compareTwoIntegers

```solidity
function _compareTwoIntegers(int256 _valueInt, int256 _answer, enum DataTypes.ResolveOperators _operator) internal pure returns (bool result)
```

