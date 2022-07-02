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


    //Is this a luxury?
    mapping(bytes32 => DataTypes.Post) internal MapIdToPost;
    mapping(address => DataTypes.Post) internal MapAddressToPost;

    /*Mapping of the storage
    */

    function afterPostRoutines(DataTypes.Post memory _post, bytes32 _id) internal {
    console.log("afterpost1");
    
    emit DataTypes.postCreated(_post.partyA,_post.partyB);
    emit DataTypes.idCreated(_id);
    
}

    function postRBOwner(address _partyA, address _partyB, uint256 _amount) public {
        bytes32 id;
        DataTypes.Post memory post;
        (post,id) = iRBOwner.postRBOwner(_partyA,_partyB, _amount);

        MapIdToPost[id] = post;
        MapAddressToPost[msg.sender] = post;

        afterPostRoutines(post, id);


    }

    /* 
    resolveRBOwner()
    postRBOracle()
    resolveRBOracle
    */
    //
}