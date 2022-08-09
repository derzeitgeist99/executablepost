// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAggregatorProxy {
    function decimals() external view returns (uint8);
    function getAnswer(uint256 roundId) external view  returns (int256 answer);
    function getTimestamp(uint256 roundId) external view returns (uint256 updatedAt);
}

