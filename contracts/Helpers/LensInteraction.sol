// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';

import {ILensHub, DataTypes as LensDataTypes} from "@aave/lens-protocol/contracts/interfaces/ILensHub.sol";
import {Errors as LensErrors} from "@aave/lens-protocol/contracts/libraries/Errors.sol";
import {DataTypes} from "./DataTypes.sol";

contract lensInteraction {
    ILensHub lens;

    //modifiers
    modifier checkLensBeforePost (uint256 _profileId) {
        //Check if handle exists
        bytes memory handle = bytes(lens.getHandle(_profileId));
        if (handle.length == 0) {revert LensErrors.TokenDoesNotExist();}

        //Check if contract is whitelisted as dispatcher
        address dispatcher = lens.getDispatcher(_profileId);
        if (dispatcher != address(this)) {revert LensErrors.NotDispatcher();}
        _;

    }

    function postToLens(LensDataTypes.PostData calldata _lensPost) internal returns(uint256) {
        return lens.post(_lensPost);
    }

    function createCommentStruct(DataTypes.LensPostInfo storage _originalLensPost, LensDataTypes.CommentData memory _commentData) internal returns (LensDataTypes.CommentData memory){
        _commentData.profileIdPointed = _originalLensPost.profileId;
        _commentData.pubIdPointed = _originalLensPost.initialPubId;

        return(_commentData);

    }

     function commentToLens(LensDataTypes.CommentData memory _commentData) internal returns(uint256) {
        return lens.comment(_commentData);

    }


}