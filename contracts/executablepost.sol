// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "hardhat/console.sol";



contract ExecutablePost {

// Events
    event ContractID(bytes32 indexed ContractID);

// Structs
    struct PostContract {
            address partyA;
            address partyB;
            uint256 resolveAfter;
            uint256 amount;
        }

//Mappings
    mapping (address => bytes32[]) public allContractsOfAddress;
    mapping (bytes32 => PostContract) public contractMapping;

// Logic!

function createContract (address _partyA, address _partyB, uint256 _resolveAfter, uint256 _amount) external {

    PostContract memory myPostContract;

    myPostContract.amount = _amount;
    myPostContract.partyA = _partyA;
    myPostContract.partyB = _partyB;
    myPostContract.resolveAfter = _resolveAfter;

    bytes32 id = keccak256(abi.encodePacked(block.timestamp));

    contractMapping[id] = myPostContract;
    allContractsOfAddress[msg.sender].push(id);

    emit ContractID(id);

}

function getContractMapping (bytes32 _id) external view returns (PostContract  memory _postContract){
    return contractMapping[_id];
}

function getAllContractOfAddress (address _address) external view returns (bytes32 [] memory){
    return allContractsOfAddress[_address];
}

}