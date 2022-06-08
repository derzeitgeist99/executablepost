// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

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


}