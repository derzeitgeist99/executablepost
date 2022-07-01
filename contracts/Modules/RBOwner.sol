// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Common/DataTypes.sol";

contract commonLogic {

    function fillBasicInfo(address _partyA, address _partyB) internal pure returns (DataTypes.Post memory _post) {
        _post.partyA = _partyA;
        _post.partyB = _partyB;

        return _post;
    }

    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
     
    }

    function afterPostRoutines(DataTypes.Post memory _post, bytes32 _id) internal {
        console.log("afterpost1");
      
        emit DataTypes.postCreated(_post.partyA,_post.partyB);

        emit DataTypes.idCreated(_id);
     
    }

}

interface IRBOwner {
    function postRBOwner(address _partyA, address _partyB) external returns (DataTypes.Post calldata, bytes32 _Id );
}

contract RBOwner is commonLogic, IRBOwner{
    function postRBOwner(address _partyA, address _partyB) public  returns (DataTypes.Post memory _post, bytes32 _id  ) {
        _post = fillBasicInfo(_partyA, _partyB);
        _id =generateId();


        afterPostRoutines(_post, _id);



        return (_post, _id);


    }

}