// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
//import "@chainlink/contracts/src/v0.7/dev/AggregatorProxy.sol";
import "../MyInterfaces/Chainlink/IAggregatorProxy.sol";

/**
 * @title OracleInteraction
 * @author derZeitgeist
 *
 * @notice All logic that queries Oracles is here
 */

contract OracleInteraction {

    function getOracleTimestampByRoundId (address _aggregatorAddress, uint256 _roundId) internal view returns (uint256 _timestamp){
        IAggregatorProxy priceFeed;
        priceFeed = IAggregatorProxy(_aggregatorAddress);
        _timestamp = priceFeed.getTimestamp(_roundId);
        return _timestamp;

    }

    function _getAnswer (address  _aggregatorAddress, uint256 _roundId) internal view returns (int256 _answer) {
        IAggregatorProxy priceFeed;
        priceFeed = IAggregatorProxy(_aggregatorAddress);
        _answer = priceFeed.getAnswer(_roundId);
        return _answer;

    }

    function getDecimals (address  _aggregatorAddress) internal view returns (uint8 _decimals) {
        IAggregatorProxy priceFeed;
        priceFeed = IAggregatorProxy(_aggregatorAddress);
        _decimals = priceFeed.decimals();
        return _decimals;
    }
}

