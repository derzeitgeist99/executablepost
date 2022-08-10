# Solidity API

## LensInteraction

All logic that interacts with Lens Protocol is here. The idea_ is that we forward the Post information to Lens.

### lens

```solidity
contract ILensHub lens
```

### _checkLensBeforePost

```solidity
modifier _checkLensBeforePost(uint256 _profileId)
```

### _postToLens

```solidity
function _postToLens(struct DataTypes.PostData _lensPost) internal returns (uint256)
```

### _createCommentStruct

```solidity
function _createCommentStruct(struct DataTypes.LensPostInfo _originalLensPost, struct DataTypes.CommentData _commentData) internal returns (struct DataTypes.CommentData)
```

### _commentToLens

```solidity
function _commentToLens(struct DataTypes.CommentData _commentData) internal returns (uint256)
```

