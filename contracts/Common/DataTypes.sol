// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';



library DataTypes {

    error UserNotAllowed (string );
    error insufficientBalance(uint balance, uint required);
    error insufficientAllowance(uint allowance, uint required);

   
    event idCreated (bytes32  indexed _id);
    event contractAddressChanged (address indexed _newAddress);


    enum ResolveTypes {
        ResolveByOwner,
        ResolveByOracle
    }

    struct Post {
        address partyA;
        address partyB;
        address owner;
        uint256 resolveAfter;
        uint256 automaticallyResolveAfter;
        uint256 amount;
        address currency;
        bool resolved;

        ResolveTypes resolvetype;
        ResolveByOracleConditions resolveByOracleConditions;
        ResolveByOwnerConditions resolveByOwnerConditions;
        LensPostInfo lensPostInfo;
        // I assume this is gas inefficient as it creates empty struct also for unused data.
        // Tried mapping ,but that limits me in using modules as separate contracts

    }
    struct ResolveByOracleConditions {
        uint price;
    }

        struct ResolveByOwnerConditions {
        address resolver;
    }

    struct LensPostInfo {
        uint256 profileId;
        uint256 initialPubId;
        uint256 resolvingPubId;
    }
}