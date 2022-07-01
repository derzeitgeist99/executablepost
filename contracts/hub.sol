// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./Common/DataTypes.sol";
import "./Modules/RBOwner.sol";

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

    }


    //Is this a luxury?
    mapping(bytes32 => DataTypes.Post) internal MapIdToPost;
    mapping(address => DataTypes.Post) internal MapAddressToPost;

    /*Mapping of the storage
    */
    function postRBOwner(address _partyA, address _partyB) public {
        bytes32 Id;
        DataTypes.Post memory post;
        (post,Id) = iRBOwner.postRBOwner(_partyA,_partyB);

        MapIdToPost[Id] = post;
        MapAddressToPost[msg.sender] = post;

    }

    /* 
    resolveRBOwner()
    postRBOracle()
    resolveRBOracle
    */
    //
}