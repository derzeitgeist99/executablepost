// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';



library DataTypes {
//**************************<<<< Errors >>>>**************************"
    error UserNotAllowed (string );
    error amountMustBeGreaterThanZero ();
    error insufficientBalance(uint balance, uint required);
    error insufficientAllowance(uint allowance, uint required);

    //Errors possible during resolution
    error executablePostNotFound();
    error cannotUseThisFunctionToResolve(ResolveTypes _resolveTypeGiven, ResolveTypes _resolveTypeNeeded);
    error youAreNotResolverOfExecutablePost(address _ResolverAddress);
    error youTryToResolveTooEarly(uint256 _currentTimeStamp, uint _requiredTimeStamp);
    error alreadyResolved();
    error partyAPlusPartyBIsNot100();

   
//**************************<<<< Events >>>>**************************"
    event idCreated (bytes32  indexed _id);
    event contractAddressChanged (address indexed _newAddress);
    event lensPostCreated (uint256 indexed _lensPostId);


//**************************<<<< Enums >>>>**************************"
    enum ResolveTypes {
        ResolveByOwner,
        ResolveByOracle
    }

    enum ResolveOperators {
        Equal,
        GreaterOrEqual,
        SmallerOrEqual
    }
   

//**************************<<<< Structs >>>>**************************"
    struct Post {
        address partyA;
        address partyB;
        address owner;
        address resolver;
        uint256 resolveAfter;
        uint256 automaticallyResolveAfter;
        uint256 amount;
        address currency;
        bool resolved;
        ResolveConditions resolveConditions;
        LensPostInfo lensPostInfo;

    }


    struct ResolveConditions {
        ResolveTypes resolveType;
        string metric;
        string sourceString;
        address sourceAddress;
        uint256 valueUint;
        ResolveOperators operator;
    }

    struct LensPostInfo {
        uint256 profileId;
        uint256 initialPubId;
        uint256 resolvingPubId;
    }
}