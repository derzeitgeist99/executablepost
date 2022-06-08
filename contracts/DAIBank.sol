// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAIBank  {

    IERC20 dai;
    event myLog (string);

    constructor (address _DAIAddress)  {
        dai = IERC20(_DAIAddress);

    }

    function myTransfer(address _from, address _to, uint _amount) public  {
        dai.transferFrom(_from, _to, _amount);
        emit myLog("Here");

    }


    function allowance(address _owner, address _spender) public view returns (uint256){
        return dai.allowance(_owner, _spender);
    }


}