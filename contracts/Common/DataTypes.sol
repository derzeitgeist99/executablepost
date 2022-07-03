// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';

library DataTypes {

    error UserNotAllowed (string );
    error insufficientBalance(uint balance, uint allowance, uint required);
    error insufficientAllowance(uint balance, uint allowance, uint required);

    event postCreated (address indexed _party1, address indexed _partyB);
    event idCreated (bytes32  _id);
    event contractAddressChanged (address indexed _newAddress);


    enum ResolveTypes {
        ResolveByOwner,
        ResolveByOracle
    }

    struct Post {
        address partyA;
        address partyB;
        address owner;
        uint resolveAfter;
        uint256 amount;
        address _currency;
        bool resolved;

        ResolveTypes resolvetype;
        ResolveByOracleConditions resolveByOracleConditions;
        ResolveByOwnerConditions resolveByOwnerConditions;
        // I assume this is gas inefficient as it creates empty struct also for unused data.
        // Tried mapping ,but that limit me in using modules as separate contracts

    }

    struct ResolveByOracleConditions {
        uint price;
    }

        struct ResolveByOwnerConditions {
        address resolver;
    }
}