// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Common/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract governanceUtil {

    address public governance;
    address treasury;

    modifier onlyGov () {
       if (msg.sender != governance) {
        revert DataTypes.UserNotAllowed("Not a Governance Address"); }
        _;
    }


    //Treasury
    function _setTreasuryAddress(address _treasury) public onlyGov{
        treasury = _treasury;
        emit DataTypes.contractAddressChanged(treasury);   
    }
}

 contract commonLogic is governanceUtil{

    function fillBasicInfo(address _partyA, address _partyB) internal pure returns (DataTypes.Post memory _post) {
        _post.partyA = _partyA;
        _post.partyB = _partyB;

        return _post;
    }

    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
     
    }

    modifier checkDAIBalance(uint256 _amount, address _currency ) {
        IERC20 dai = IERC20(_currency);


        uint DAIbalance = dai.balanceOf(tx.origin);
        uint DAIallowance = dai.allowance(tx.origin, treasury);

        console.log(DAIallowance);
        console.log(DAIbalance);
       if (DAIallowance < _amount) {
        revert DataTypes.insufficientAllowance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
            }
        if (DAIbalance < _amount) {
        revert DataTypes.insufficientBalance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
             }
        _;
    }


}

interface IRBOwner {
    function postRBOwner(address _partyA, address _partyB, uint256 _amount, address _currency) external returns (DataTypes.Post calldata, bytes32 _Id );
}

 contract RBOwner is commonLogic, IRBOwner{

    constructor (address _treasury) {
        governance = msg.sender;
        treasury = _treasury;

    }

    function postRBOwner(address _partyA, address _partyB, uint256 _amount,address _currency)
    public view 
    checkDAIBalance(_amount, _currency)
    returns (DataTypes.Post memory _post, bytes32 _id  ) {
        console.log("Calling from RB");
        console.log(msg.sender);
        console.log(tx.origin);
      
        _post = fillBasicInfo(_partyA, _partyB);
        _id =generateId();

        
        return (_post, _id);


    }

}

