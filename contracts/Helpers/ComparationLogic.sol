// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./DataTypes.sol";

/**
 * @title ComparationLogic
 * @author derZeitgeist
 *
 * @notice All logic that compares expected results vs actual is here
 * @dev The challenge here was to give users freedom to set if expcted value should be higher, lower or equal to a future value
 therefore I went for this "switch" mechanism. At one point this can become more crowded, therefore it has own Contract as readability is critical.
 */

contract ComparationLogic {
    function _compareTwoIntegers(int256 _valueInt, int256 _answer, DataTypes.ResolveOperators _operator) internal pure returns (bool result) {
    /// @dev the IF block is same, only operator changes based on _operator
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

