// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Helpers/DataTypes.sol";
import "../Helpers/Governance.sol";

/**
 * @title ERC20Interaction
 * @author derZeitgeist
 *
 * @notice All logic that moves ERC20 tokens around is here
 */

contract ERC20Interaction is GovernanceUtils{

    /// @dev Since we are 3rd party we need to check both allowance and balance. This could be broken down into more functions. Is it better?
     modifier _checkERCBalance(uint256 _amount, address _currency, address _owner ) {

        if(_amount < 1) {revert DataTypes.AmountMustBeGreaterThanZero();}

        IERC20 erc = IERC20(_currency);

        uint ercAllowance = erc.allowance(_owner, treasury);
        if (ercAllowance < _amount) {
        revert DataTypes.InsufficientAllowance({allowance: ercAllowance, required: _amount});
            }

        uint ercBalance = erc.balanceOf(_owner);
        if (ercBalance < _amount) {
        revert DataTypes.InsufficientBalance({balance: ercBalance, required: _amount});
             }
        _;
    }

        function _transferFromERC(uint256 _amount, address _currency, address _owner) internal {
         IERC20 erc = IERC20(_currency);
         erc.transferFrom(_owner, treasury, _amount);
    }
        function _transferERC(uint256 _amount, address _currency, address _to) internal {
            IERC20  erc = IERC20(_currency);
            erc.transfer(_to, _amount);
        }


}