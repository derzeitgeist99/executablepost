// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "hardhat/console.sol";
import "./OracleInteraction.sol";
import "./DataTypes.sol";

/**
 * @title Utils
 * @author derZeitgeist
 *
 * @notice This holds helper functions to break down complex logic into smaller pieces
 */

contract Utils is OracleInteraction {
    uint16 oracleTimestampTolerance;

    /**
     * @notice In order to resolve an executable post you need to meet multiple criteria. This one check them
     */

    modifier _canResolve(
        DataTypes.Post storage post,
        DataTypes.ResolveTypes _resolveType
    ) {
        ///@notice Criteria 1: The Executable Id must exist
        if (post.amount == 0) {
            revert DataTypes.ExecutablePostNotFound();
        }
        ///@notice Criteria 2: You must use same resolution function as defined in original Executable Post struct
        if (post.resolveConditions.resolveType != _resolveType) {
            revert DataTypes.CannotUseThisFunctionToResolve(
                _resolveType,
                post.resolveConditions.resolveType
            );
        }
        ///@notice Criteria 3: Sender must equal to DataTypes.Post.resolver
        if (post.resolver != msg.sender) {
            revert DataTypes.YouAreNotResolverOfExecutablePost(post.resolver);
        }
        ///@notice Criteria 4: Block time must be greater than DataTypes.Post.resolveAfter
        if (post.resolveAfter > block.timestamp) {
            revert DataTypes.YouTryToResolveTooEarly(
                block.timestamp,
                post.resolveAfter
            );
        }
        /// @notice Criteria 5: DataTypes.Post.resolved must be false
        if (post.resolved) {
            revert DataTypes.AlreadyResolved();
        }
        _;
    }

    /// @dev Used in Manual resolution to check if a+b = 100

    modifier _is100(uint8 _resultPartyA, uint8 _resultPartyB) {
        if (_resultPartyA + _resultPartyB != 100) {
            revert DataTypes.PartyAPlusPartyBIsNot100();
        }
        _;
    }

    /// @dev used in resolveByOracle to see if oracleRound represents timestamp specified in EP definition

    modifier _isRoundIdOK(
        uint256 _roundId,
        DataTypes.ResolveConditions storage _resolveConditions
    ) {
        uint256 timestampForResolution = getOracleTimestampByRoundId(
            _resolveConditions.sourceAddress,
            _roundId
        );
        if (timestampForResolution == 0) {
            revert DataTypes.OracleError(
                "Timestamp is 0. Either roundId is wrong or oracle doesn't work"
            );
        }
        uint256 absDelta = absDelta(
            timestampForResolution,
            _resolveConditions.timestamp
        );
        if (absDelta > oracleTimestampTolerance) {
            revert DataTypes.TimestampDeltaGreaterThanTolerance();
        }
        _;
    }

    /// @dev used in post to generate unique ID for each instance of EP

    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp, tx.origin));
    }

    function calculateTransferAmount(uint8 _result, uint256 _amount)
        internal
        pure
        returns (uint256)
    {
        return (_result * _amount) / 100;
    }

    function absDelta(uint256 _num1, uint256 _num2)
        internal
        pure
        returns (uint256 absDelta)
    {
        int256 delta = int256(_num1) - int256(_num2);
        absDelta = (delta < 0) ? uint256(delta * (-1)) : uint256(delta);

        return absDelta;
    }
}
