// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Common/DataTypes.sol";
import "../Common/Governance.sol";

contract ERC20Interaction is governanceUtil{
     modifier checkERCBalance(uint256 _amount, address _currency, address _owner ) {
        if(_amount < 1) {revert DataTypes.amountMustBeGreaterThanZero();}

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

        function transferERC(uint256 _amount, address _currency, address _owner) internal {
         IERC20 erc = IERC20(_currency);
         uint allowance = erc.allowance(_owner, treasury);
         console.log(allowance);
         uint balance = erc.balanceOf(_owner);
         console.log(balance);
         erc.transferFrom(_owner, treasury, _amount);
    }


}