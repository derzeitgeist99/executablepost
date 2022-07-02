// SPDX-License-Identifier: MIT

pragma solidity ^ 0.8.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAI is ERC20 {
    constructor()  ERC20("Dai Stablecoin","DAI"){

    }

    function faucet (address _to, uint _amount) external {
        _mint(_to, _amount);
    }

    function myBalanceOf(address _address) external view returns (uint) {
        return balanceOf(_address);
    }

    function myAllowance(address _owner, address _spender) public view returns (uint256){
        return allowance(_owner, _spender);
    }
}