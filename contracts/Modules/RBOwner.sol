// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Common/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/lens-protocol/contracts/interfaces/ILensHub.sol";

contract governanceUtil {

    address public governance;
    address treasury;
    uint256 public waitForAutomaticResolution;

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
    modifier checkERCBalance(uint256 _amount, address _currency, address _owner ) {
        IERC20 erc = IERC20(_currency);

        uint ercAllowance = erc.allowance(_owner, address(this));
        console.log(ercAllowance);
    
       if (ercAllowance < _amount) {
        revert DataTypes.insufficientAllowance({allowance: ercAllowance, required: _amount});
            }

        uint ercBalance = erc.balanceOf(_owner);
        if (ercBalance < _amount) {
        revert DataTypes.insufficientBalance({balance: ercBalance, required: _amount});
             }
        _;
    }

    function fillBasicInfo(address _partyA, address _partyB, address _owner, uint256 _waitSeconds) internal view returns (DataTypes.Post memory _post) {
        _post.partyA = _partyA;
        _post.partyB = _partyB;
        _post.owner = _owner;
        _post.resolveAfter = block.timestamp + _waitSeconds;
        _post.automaticallyResolveAfter = _post.resolveAfter + waitForAutomaticResolution;

        return _post;
    }

    function fillResolveByOwnerConditions(address _resolver) internal pure returns (DataTypes.ResolveByOwnerConditions memory _conditions) {
        _conditions.resolver = _resolver;
        return _conditions;
    }

    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
     
    }

    function transferERC(uint256 _amount, address _currency, address _owner) internal {
         //or is he already in scope
         IERC20 erc = IERC20(_currency);
         uint allowance = erc.allowance(_owner, treasury);
         console.log(allowance);
         uint balance = erc.balanceOf(_owner);
         console.log(balance);
         erc.transferFrom(_owner, treasury, _amount);
    }

}

contract lensInteraction {
    ILensHub lens = ILensHub("0x67d269191c92Caf3cD7723F116c85e6E9bf55933");
    function getProfile(uint256 profileId) internal view {
        
    }
}

interface IRBOwner {
    function postRBOwner(
        address _partyA,
        address _partyB,
        address _owner,
        uint256 _amount,
        address _currency,
        uint256 _waitSeconds
)
    external 
    returns (DataTypes.Post calldata, bytes32 _Id );
}

 contract RBOwner is commonLogic, IRBOwner{

    constructor (address _treasury) {
        governance = msg.sender;
        treasury = _treasury;
        waitForAutomaticResolution = 60*60*24*7*52; //1 year

    }

    function postRBOwner(address _partyA, address _partyB, address _owner,uint256 _amount,address _currency, uint256 _waitSeconds)
    public  
    checkERCBalance(_amount, _currency, _owner)
    returns (DataTypes.Post memory _post, bytes32 _id  ) {

      
        _post = fillBasicInfo(_partyA, _partyB, _owner, _waitSeconds);
        _post.resolveByOwnerConditions = fillResolveByOwnerConditions(_owner);
        _id =generateId();

       
        //this is last before return
        // still is this OK, knowing that we will be still changing state in the hub?
        transferERC(_amount, _currency, _owner);

        
        return (_post, _id);


    }

}

