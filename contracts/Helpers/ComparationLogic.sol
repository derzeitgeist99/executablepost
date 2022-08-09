// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./DataTypes.sol";

contract ComparationLogic {
    function compare(int256 _valueInt, int256 _answer, DataTypes.ResolveOperators _operator) internal pure returns (bool result) {
    if (_operator == DataTypes.ResolveOperators.Equal) {
        result = (_answer == _valueInt) ? true : false;
        return result;
    }

    if (_operator == DataTypes.ResolveOperators.GreaterOrEqual) {
    result = (_answer >= _valueInt) ? true : false;
    return result;
    }

    if (_operator == DataTypes.ResolveOperators.SmallerOrEqual) {
    result = (_answer <= _valueInt) ? true : false;
    return result;
    }

}
    
}

