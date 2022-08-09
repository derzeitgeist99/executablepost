// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
//import "@chainlink/contracts/src/v0.7/dev/AggregatorProxy.sol";
import "../MyInterfaces/Chainlink/IAggregatorProxy.sol";

contract OracleInteraction {
//     function getCurrentValue (address _aggregatorAddress) internal view returns (int){
  
//     AggregatorInterface priceFeed;
//     priceFeed = AggregatorInterface(_aggregatorAddress);
   
//    // (,int value,,, ) = priceFeed.latestRoundData();
 
//   //  return value;

 //   }

    function getOracleTimestamp (address _aggregatorAddress, uint256 _roundId) internal view returns (uint256 _timestamp){
        IAggregatorProxy priceFeed;
        priceFeed = IAggregatorProxy(_aggregatorAddress);
        _timestamp = priceFeed.getTimestamp(_roundId);
        return _timestamp;

    }

    function getAnswer (address  _aggregatorAddress, uint256 _roundId) internal view returns (int256 _answer) {
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

