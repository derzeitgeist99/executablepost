// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";



contract ExecutablePost {

// Events
    event ContractID(bytes32 indexed ContractID);

// Errors
    error insufficientBalance(uint balance, uint allowance, uint required);
    error insufficientAllowance(uint balance, uint allowance, uint required);

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

// Import DAI
    IERC20 dai;

// Constructor
    constructor (address _DAIAddress)  {
        dai = IERC20(_DAIAddress);

    }

// Logic!

function createContract (address _partyA, address _partyB, uint256 _resolveAfter, uint256 _amount) external {
// console.log("Allowed Amount %s", dai.allowance(msg.sender, address(this)) );
// console.log("Balance %s", dai.balanceOf(msg.sender));
// console.log(" Amount %s", _amount );
uint DAIallowance = dai.allowance(msg.sender, address(this));
uint DAIbalance = dai.balanceOf(msg.sender);


    if (DAIallowance < _amount) {
        revert insufficientAllowance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
    }
    if (DAIbalance < _amount) {
        revert insufficientBalance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
    }

    PostContract memory myPostContract;

    myPostContract.amount = _amount;
    myPostContract.partyA = _partyA;
    myPostContract.partyB = _partyB;
    myPostContract.resolveAfter = _resolveAfter;

    bytes32 id = keccak256(abi.encodePacked(block.timestamp));

    dai.transferFrom(msg.sender,address(this), _amount);


    contractMapping[id] = myPostContract;
    allContractsOfAddress[msg.sender].push(id);

    emit ContractID(id);

    // console.log("Balance at the End %s", dai.balanceOf(msg.sender));
    // console.log("contract Balance at the End %s", dai.balanceOf(address(this)));

}

function getContractMapping (bytes32 _id) external view returns (PostContract  memory _postContract){
    return contractMapping[_id];
}

function getAllContractsOfAddress (address _address) external view returns (bytes32 [] memory){
    return allContractsOfAddress[_address];
}


}