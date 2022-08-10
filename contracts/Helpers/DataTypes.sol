// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';



library DataTypes {
//**************************<<<< Errors >>>>**************************
    error UserNotAllowed (string);
    error AmountMustBeGreaterThanZero ();
    error InsufficientBalance(uint balance, uint required);
    error InsufficientAllowance(uint allowance, uint required);

    /// @dev Errors possible during resolution
    error ExecutablePostNotFound();
    error CannotUseThisFunctionToResolve(ResolveTypes _resolveTypeGiven, ResolveTypes _resolveTypeNeeded);
    error YouAreNotResolverOfExecutablePost(address _ResolverAddress);
    error YouTryToResolveTooEarly(uint256 _currentTimeStamp, uint _requiredTimeStamp);
    error AlreadyResolved();
    error PartyAPlusPartyBIsNot100();

    /// @dev Errors possible specifically during Oracle resolution
    error TimestampDeltaGreaterThanTolerance();
    error OracleError(string _message);

   
//**************************<<<< Events >>>>**************************

    event IdCreated (bytes32  indexed _id);
    event ContractAddressChanged (address indexed _newAddress);
    event LensPostCreated (uint256 indexed _lensPostId);


//**************************<<<< Enums >>>>**************************
/// @dev Represents logic of resolution. Every enum items must have own resolution function
    enum ResolveTypes {
        ResolveByOwner,
        ResolveByOracle
    }

/// @dev If you add more ResolveOperators add also respective logic in ComparationLogic contract
    enum ResolveOperators {
        Equal,
        GreaterOrEqual,
        SmallerOrEqual
    }
   

//**************************<<<< Structs >>>>**************************

/** 
@notice this stores all data we need for future resolution of the contract
* @param partyA Address of party A, here ERC20 tokens will be transfered should party A benefit from resolution. Could be any address, even the resolver or owner. Defined by user.
* @param partyB Address of party B, here ERC20 tokens will be transfered should party B benefit from resolution. Could be any address, even the resolver or owner. Defined by user.
* @param owner Address of someone, who started the Post. Set in contract = msg.sender
* @param resolver Address of someone, who can trigger the resolution functions. Can be anyone. Party A, Party B owner. resovler must physicaly go and trigger the function. Defined by user.
* @param resolveAfter Since resolution makes sense only in the future, we need to specify when. Post can be resolved only after this timestamp. Defined by user.
* @param automaticallyResolveAfter Not used now, placeholder for future functionality that will assure automatic reversal of funds in case no one retrieves them. Defined by user.
* @param amount How much ERC20 is at stake. This will be transfered from msg.sender (aka owner). This amount gets then locked into the contract. Defined by user.
* @param currency Address of ERC20 contract. If you want to use DAI, use the address, not "DAI". Defined by user.
* @param resolved By default set to false. Changes to true after resolution function has been called. If this is true resolution functions will revert. 
* @param resolveCondition How do you want to have this resolved. Defined by user.
* @param lensPostInfo Here we store details neded for Lens Protocol interaction. 
* @dev tada 
* Now I see I am using this as state variable, but also as a vehicle to collect input from user. Therefore user might be confused / tempted to fill own value. (eg owner)
*/
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

/**
* @notice This stores detail of the future state and how to resolve it
* @param resolveType Choose mechanism for resolution. What is set here defines the resolution function to use
* @param metric For user reference, not used in contract. Every number must have a metric, right.
* @param sourceString For user reference, not used in contract. Useful for resolveByOwner to make sure resolver wont pull her own number
* @param sourceAddress Where the Oracle resides. Can be blank if you dont use resolveByOracle. List is here: https://docs.chain.link/docs/reference-contracts/
* @param timestamp Time of resolution is not the same as a target time. Used in contract by resolveByOracle
* @param valueInt what is the target value. Resolver will use this to define how to resolve, Used in contract by resolveByOracle
* @dev Sometimes you can have bool or string outcomes. This should be reflected here as another params
* @param operator this says if the actual value is greater/smaller/same vs target value
 */
    struct ResolveConditions {
        ResolveTypes resolveType;
        string metric;
        string sourceString;
        address sourceAddress;
        uint256 timestamp;
        int256 valueInt;
        ResolveOperators operator;
    }

    /**
    * @notice Here we store links to LensProtocol. All are filled by contract.
    * @param profileId User ProfileId on Lens Protocol
    * @param initialPubId what is the pubId created by the post function.
    * @param resolvingPubId what is the comment id  created by the resolving function
    */
    struct LensPostInfo {
        uint256 profileId;
        uint256 initialPubId;
        uint256 resolvingPubId;
    }
}