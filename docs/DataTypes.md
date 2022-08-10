# Solidity API

## DataTypes

### UserNotAllowed

```solidity
error UserNotAllowed(string)
```

### AmountMustBeGreaterThanZero

```solidity
error AmountMustBeGreaterThanZero()
```

### InsufficientBalance

```solidity
error InsufficientBalance(uint256 balance, uint256 required)
```

### InsufficientAllowance

```solidity
error InsufficientAllowance(uint256 allowance, uint256 required)
```

### ExecutablePostNotFound

```solidity
error ExecutablePostNotFound()
```

_Errors possible during resolution_

### CannotUseThisFunctionToResolve

```solidity
error CannotUseThisFunctionToResolve(enum DataTypes.ResolveTypes _resolveTypeGiven, enum DataTypes.ResolveTypes _resolveTypeNeeded)
```

### YouAreNotResolverOfExecutablePost

```solidity
error YouAreNotResolverOfExecutablePost(address _ResolverAddress)
```

### YouTryToResolveTooEarly

```solidity
error YouTryToResolveTooEarly(uint256 _currentTimeStamp, uint256 _requiredTimeStamp)
```

### AlreadyResolved

```solidity
error AlreadyResolved()
```

### PartyAPlusPartyBIsNot100

```solidity
error PartyAPlusPartyBIsNot100()
```

### TimestampDeltaGreaterThanTolerance

```solidity
error TimestampDeltaGreaterThanTolerance()
```

_Errors possible specifically during Oracle resolution_

### OracleError

```solidity
error OracleError(string _message)
```

### IdCreated

```solidity
event IdCreated(bytes32 _id)
```

### ContractAddressChanged

```solidity
event ContractAddressChanged(address _newAddress)
```

### LensPostCreated

```solidity
event LensPostCreated(uint256 _lensPostId)
```

### ResolveTypes

```solidity
enum ResolveTypes {
  ResolveByOwner,
  ResolveByOracle
}
```

### ResolveOperators

```solidity
enum ResolveOperators {
  Equal,
  GreaterOrEqual,
  SmallerOrEqual
}
```

### Post

```solidity
struct Post {
  address partyA;
  address partyB;
  address owner;
  address resolver;
  uint256 resolveAfter;
  uint256 automaticallyResolveAfter;
  uint256 amount;
  address currency;
  bool resolved;
  struct DataTypes.ResolveConditions resolveConditions;
  struct DataTypes.LensPostInfo lensPostInfo;
}
```

### ResolveConditions

```solidity
struct ResolveConditions {
  enum DataTypes.ResolveTypes resolveType;
  string metric;
  string sourceString;
  address sourceAddress;
  uint256 timestamp;
  int256 valueInt;
  enum DataTypes.ResolveOperators operator;
}
```

### LensPostInfo

```solidity
struct LensPostInfo {
  uint256 profileId;
  uint256 initialPubId;
  uint256 resolvingPubId;
}
```

