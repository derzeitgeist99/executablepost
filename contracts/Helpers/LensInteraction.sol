// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';

import {ILensHub, DataTypes as LensDataTypes} from "@aave/lens-protocol/contracts/interfaces/ILensHub.sol";
import {Errors as LensErrors} from "@aave/lens-protocol/contracts/libraries/Errors.sol";
import {DataTypes} from "./DataTypes.sol";

/**
 * @title LensInteraction
 * @author derZeitgeist
 *
 * @notice All logic that interacts with Lens Protocol is here. The idea_ is that we forward the Post information to Lens.
 */

contract LensInteraction {
    ILensHub lens;

    modifier _checkLensBeforePost (uint256 _profileId) {
        /// @dev Check if handle exists. 
        bytes memory handle = bytes(lens.getHandle(_profileId));
        if (handle.length == 0) {revert LensErrors.TokenDoesNotExist();}

        /// @dev Check if contract is whitelisted as dispatcher. Dispatcher is contract that post on behalf of user. 
        /// See more here https://docs.lens.xyz/docs/functions#setdispatcher
        /// @custom:later not sure how the address(this) would behave in case of proxy...
        address dispatcher = lens.getDispatcher(_profileId);
        if (dispatcher != address(this)) {revert LensErrors.NotDispatcher();}
        _;

    }

    function _postToLens(LensDataTypes.PostData calldata _lensPost) internal returns(uint256) {
        return lens.post(_lensPost);
    }

    function _createCommentStruct(DataTypes.LensPostInfo storage _originalLensPost, LensDataTypes.CommentData memory _commentData) internal returns (LensDataTypes.CommentData memory){
        _commentData.profileIdPointed = _originalLensPost.profileId;
        _commentData.pubIdPointed = _originalLensPost.initialPubId;

        return(_commentData);

    }

     function _commentToLens(LensDataTypes.CommentData memory _commentData) internal returns(uint256) {
        return lens.comment(_commentData);

    }


}