// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./Common/DataTypes.sol";
import "./Modules/RBOwner.sol";
import {DataTypes as LensDataTypes} from "@aave/lens-protocol/contracts/interfaces/ILensHub.sol";

/* Import
DataTypes
CommonLogic */

contract hub {

    //This hub calls different contracts (modules) based on the logic of redemption
    // Here we connect them
    // ToDo: Add modifier to only gov!!!

    //constructor ()

    IRBOwner iRBOwner;
    //IRBOracle iRBOracle;
    function setIRBOwner(address _address) public {
        iRBOwner = IRBOwner(_address);
        emit DataTypes.contractAddressChanged(_address);

    }


    //Mapping of the storage
    //Is this a luxury?
    mapping(bytes32 => DataTypes.Post) internal MapIdToPost;
    mapping(address => DataTypes.Post) internal MapAddressToPost;

    function getPostById(bytes32 _id) public view returns (DataTypes.Post memory) {
        return MapIdToPost[_id];
    }

    
    function postRBOwner(DataTypes.Post memory _post, LensDataTypes.PostData calldata _lensPost ) public 
    {
        bytes32 id;
        uint256 initialPubId;
      
        (id,initialPubId) = iRBOwner.postRBOwner(_post,_lensPost);
        console.log("initial pub Id");
        console.log(initialPubId);

        _post.lensPostInfo.profileId = _lensPost.profileId;
        _post.lensPostInfo.initialPubId = initialPubId;

        MapIdToPost[id] = _post;
        MapAddressToPost[msg.sender] = _post;
        console.logBytes32(id);

    emit DataTypes.idCreated(id);


    }



    /* 
    resolveRBOwner()
    postRBOracle()
    resolveRBOracle
    */
    //
}