// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Helpers/DataTypes.sol";

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