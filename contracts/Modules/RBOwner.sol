// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Common/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract commonLogic {

    // Import DAI
    IERC20 dai;

    function _setDaiAddress (address _DAIAddress) internal {
        dai = IERC20(_DAIAddress);
        emit DataTypes.contractAddressChanged(_DAIAddress);
    }

    //Treasury

    address treasury;
    function _setTreasuryAddress(address _treasury) internal {
        treasury = _treasury;
        emit DataTypes.contractAddressChanged(treasury);
    
    }

    function fillBasicInfo(address _partyA, address _partyB) internal pure returns (DataTypes.Post memory _post) {
        _post.partyA = _partyA;
        _post.partyB = _partyB;

        return _post;
    }

    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
     
    }

    modifier checkDAIBalance(uint256 _amount ) {
        uint DAIbalance = dai.balanceOf(msg.sender);
        uint DAIallowance = dai.allowance(msg.sender, address(this));

        console.log(DAIallowance);
        console.log(DAIbalance);
        // if (DAIallowance < _amount) {
        // revert DataTypes.insufficientAllowance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
        //     }
        // if (DAIbalance < _amount) {
        // revert DataTypes.insufficientBalance({balance: DAIbalance,allowance: DAIallowance, required: _amount});
        //      }
        _;
    }


}

interface IRBOwner {
    function postRBOwner(address _partyA, address _partyB, uint256 _amount) external returns (DataTypes.Post calldata, bytes32 _Id );
}

contract RBOwner is commonLogic, IRBOwner{

    function postRBOwner(address _partyA, address _partyB, uint256 _amount)
    public view 
    checkDAIBalance(_amount)
    returns (DataTypes.Post memory _post, bytes32 _id  ) {
      
        _post = fillBasicInfo(_partyA, _partyB);
        _id =generateId();

        
        return (_post, _id);


    }

}

contract governanceUtil is commonLogic{

    address governance;

    constructor () {
        governance = msg.sender;
    }

    modifier onlyGov () {

       if (msg.sender != governance) {
        revert DataTypes.UserNotAllowed("Not a Governance Address"); }
        _;
    }

    function setDaiAddress (address _address) public  onlyGov {
        _setDaiAddress(_address);
    }

    function setTreasuryAddress (address _address) public onlyGov{
        _setTreasuryAddress(_address);
    }    

}

