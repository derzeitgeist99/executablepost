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
    error addressCannotRedeemContract(address resolverAddress, address msgSender);
    error redeemPctResultIsWrong();
    error resolvePeriodNotPassed(uint currentBlockTimeStamp, uint resolveAfter);

// Structs
    struct PostContract {
            address partyA;
            address partyB;
            address resolverAddress;
            uint256 resolveAfter;
            uint256 amount;
            bool redeemed;
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

/**@notice Starting point for user. Create contract that will be resolved after specified period.
@param _partyA First party of the contract can be the initiator of the post, but not necesarrily
@param _partyB Second party of the contract. 
@param _waitSeconds How many seconds you need to wait to resolve the contract
@param _amount Amount in DAI that will be transferred from the sender
*/

function createContract (address _partyA, address _partyB, uint256 _waitSeconds, uint256 _amount) external {
// console.log("Allowed Amount %s", dai.allowance(msg.sender, address(this)) );
// console.log("Balance %s", dai.balanceOf(msg.sender));
// console.log(" Amount %s", _amount );
uint DAIallowance = dai.allowance(msg.sender, address(this));
uint DAIbalance = dai.balanceOf(msg.sender);

/// checks and controls
    if (DAIallowance < _amount) {
        revert insufficientAllowance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
    }
    if (DAIbalance < _amount) {
        revert insufficientBalance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
    }

///  defining contract
    PostContract memory myPostContract;

    myPostContract.amount = _amount;
    myPostContract.partyA = _partyA;
    myPostContract.partyB = _partyB;
    myPostContract.resolveAfter = block.timestamp + _waitSeconds;
    myPostContract.resolverAddress = msg.sender;

    bytes32 id = keccak256(abi.encodePacked(block.timestamp));
    dai.transferFrom(msg.sender,address(this), _amount);


    contractMapping[id] = myPostContract;
    allContractsOfAddress[msg.sender].push(id);

    emit ContractID(id);

    // console.log("Balance at the End %s", dai.balanceOf(msg.sender));
    // console.log("contract Balance at the End %s", dai.balanceOf(address(this)));

}

 function resolveByMsgSender (uint _partyAResult, uint _partyBResult,bytes32 _contractID) public {
     PostContract memory myPostContract;
     myPostContract = contractMapping[_contractID];
     if(myPostContract.resolverAddress != msg.sender) {
        revert addressCannotRedeemContract({resolverAddress: myPostContract.resolverAddress, msgSender: msg.sender});
     }
     if(_partyAResult+_partyBResult !=100) {
         revert redeemPctResultIsWrong();
     }

     if(block.timestamp < myPostContract.resolveAfter) {
         revert resolvePeriodNotPassed({currentBlockTimeStamp: block.timestamp, resolveAfter: myPostContract.resolveAfter });
     }

     contractMapping[_contractID].redeemed = true;

     dai.transfer(myPostContract.partyA, myPostContract.amount * _partyAResult /100);
     dai.transfer(myPostContract.partyB, myPostContract.amount * _partyBResult /100);


 }

// Helper Functions

    function getContractMapping (bytes32 _id) external view returns (PostContract  memory _postContract){
        return contractMapping[_id];
    }

    function getAllContractsOfAddress (address _address) external view returns (bytes32 [] memory){
        return allContractsOfAddress[_address];
    }


}