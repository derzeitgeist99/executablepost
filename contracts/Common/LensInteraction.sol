// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';

import {ILensHub, DataTypes as LensDataTypes} from "@aave/lens-protocol/contracts/interfaces/ILensHub.sol";

contract lensInteraction {
    ILensHub lens;

    function lensGetProfile(uint256 _profileId) internal view returns(LensDataTypes.ProfileStruct memory){
    lens.getProfile(0);
        
        LensDataTypes.ProfileStruct memory profile = lens.getProfile(3);
        console.log(_profileId);
        console.log("handle");
        console.log(profile.handle);
    }


}