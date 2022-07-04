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
        emit DataTypes.contractAddressChanged(_address);

    }


    //Mapping of the storage
    //Is this a luxury?
    mapping(bytes32 => DataTypes.Post) internal MapIdToPost;
    mapping(address => DataTypes.Post) internal MapAddressToPost;

    function getPostById(bytes32 _id) public view returns (DataTypes.Post memory) {
        return MapIdToPost[_id];
    }

    


    function postRBOwner(address _partyA, address _partyB,  uint256 _amount, address currency, uint256 _waitSeconds) public 
    {
        bytes32 id;
        DataTypes.Post memory post;
        (post,id) = iRBOwner.postRBOwner(_partyA,_partyB, msg.sender, _amount, currency,_waitSeconds);
        console.log(post.partyA);

        MapIdToPost[id] = post;
        MapAddressToPost[msg.sender] = post;



    emit DataTypes.idCreated(id);


    }



    /* 
    resolveRBOwner()
    postRBOracle()
    resolveRBOracle
    */
    //
}