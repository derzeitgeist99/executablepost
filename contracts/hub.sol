// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./Helpers/DataTypes.sol";
import "./Helpers/Governance.sol";
import "./Helpers/LensInteraction.sol";
import "./Helpers/ERC20Interaction.sol";
import "./Helpers/OracleInteraction.sol";
import "./Helpers/ComparationLogic.sol";

contract utils is OracleInteraction{
    uint16 oracleTimestampTolerance;
    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
    }

    modifier canResolve (DataTypes.Post storage post, DataTypes.ResolveTypes _resolveType ) {
        
        if(post.amount == 0) {revert DataTypes.executablePostNotFound();}
        if(post.resolveConditions.resolveType != _resolveType ) {revert DataTypes.cannotUseThisFunctionToResolve(_resolveType,post.resolveConditions.resolveType);}
        if(post.resolver !=msg.sender) {revert DataTypes.youAreNotResolverOfExecutablePost( post.resolver);}
        if(post.resolveAfter > block.timestamp) {revert DataTypes.youTryToResolveTooEarly(block.timestamp,post.resolveAfter);}
        if(post.resolved) {revert DataTypes.alreadyResolved();}
        _;
    }

    modifier is100 (uint8 _resultPartyA, uint8 _resultPartyB) {
        if (_resultPartyA + _resultPartyB != 100) { revert DataTypes.partyAPlusPartyBIsNot100();}
        _;
    }

    modifier isRoundIdOK(uint256 _roundId, DataTypes.ResolveConditions storage _resolveConditions) {
        uint256 timestampForResolution = getOracleTimestamp( _resolveConditions.sourceAddress,_roundId);
        if (timestampForResolution == 0) {revert DataTypes.oracleError("Timestamp is 0. Either roundId is wrong or oracle doesn't work"); }
        uint256 absDelta = absDelta(timestampForResolution, _resolveConditions.timestamp);
        if (absDelta > oracleTimestampTolerance ) {revert DataTypes.timestampDeltaGreaterThanTolerance();}
        _;
    }

    function calculateTransferAmount(uint8 _result, uint _amount) internal returns (uint ){
        return (_result*_amount)/100;
    }

    function absDelta (uint256 _num1, uint256 _num2) internal pure returns (uint256) {
        int256 delta =  int(_num1) - int(_num2);
        uint256 absDelta = (delta < 0) ? uint256(delta*(-1)) : uint256(delta);

        return absDelta;
    }



}

interface IRBOwner {
    function post(
        DataTypes.Post calldata,
        LensDataTypes.PostData calldata
)
    external 
    returns (bytes32 id,uint256 initialPubId );
}

 contract hub is utils, lensInteraction, IRBOwner, ERC20Interaction, ComparationLogic {

    constructor ( address _lens) {
        governance = msg.sender;
        treasury = address(this);
        oracleTimestampTolerance = 60*60*10;
        //waitForAutomaticResolution = 60*60*24*7*52; //1 year. Functionality not implemented yet
        lens = ILensHub(_lens);

    }

    //Mapping of the storage
    //Is this a luxury?
    mapping(bytes32 => DataTypes.Post) internal MapIdToPost;
    mapping(address => DataTypes.Post) internal MapAddressToPost;

        function getPostById(bytes32 _id) public view returns (DataTypes.Post memory) {
        return MapIdToPost[_id];
    }

    function post(DataTypes.Post memory _post, LensDataTypes.PostData calldata _lensPost)
    public  
    checkERCBalance(_post.amount, _post.currency, _post.owner)
    checkLensBeforePost(_lensPost.profileId)
    returns (bytes32 id, uint256 initialPubId ) {

        id =generateId();
       
        transferFromERC(_post.amount, _post.currency, _post.owner);
        //we transfer and then the post. So the post can go like "I just locked XY into executable post"

       initialPubId = postToLens(_lensPost);
        _post.lensPostInfo.profileId = _lensPost.profileId;
        _post.lensPostInfo.initialPubId = initialPubId;

        MapIdToPost[id] = _post;
        MapAddressToPost[msg.sender] = _post;

        emit DataTypes.idCreated(id);
        
        return (id,initialPubId );

    }



    function resolveByOwner(
        bytes32 _id, 
        uint8 _resultPartyA,
        uint8 _resultPartyB,
        LensDataTypes.CommentData memory _commentData) 
        public
        canResolve(MapIdToPost[_id],DataTypes.ResolveTypes.ResolveByOwner)
        is100(_resultPartyA, _resultPartyB)
        checkLensBeforePost(_commentData.profileId)
    
        {

            DataTypes.Post storage ep = MapIdToPost[_id];
            //transfer for partyA

            transferERC(ep.amount*_resultPartyA/100,ep.currency,ep.partyA);
            // transfer to partyB
            transferERC(ep.amount*_resultPartyB/100,ep.currency,ep.partyB);

            //post to lens as comment to inital post
            _commentData = createCommentStruct(ep.lensPostInfo, _commentData);
            uint256 commentId = commentToLens(_commentData);

            ep.resolved = true;
            emit DataTypes.lensPostCreated(commentId);
            

    }

    function resolveByOracle(
        bytes32 _id,
        uint256 _oracleRoundId,
        LensDataTypes.CommentData memory _commentData)
        public
        canResolve(MapIdToPost[_id], DataTypes.ResolveTypes.ResolveByOracle)
        isRoundIdOK(_oracleRoundId,MapIdToPost[_id].resolveConditions)
        checkLensBeforePost(_commentData.profileId)
        {
            DataTypes.Post storage ep = MapIdToPost[_id];
            DataTypes.ResolveConditions storage conditions = ep.resolveConditions;
            int256 answer = getAnswer(conditions.sourceAddress, _oracleRoundId);
            

            address sendTo = compare(conditions.valueInt,answer, conditions.operator) ? ep.partyA : ep.partyB;
            transferERC(ep.amount,ep.currency,sendTo);

            //post to lens as comment to inital post
           
            _commentData = createCommentStruct(ep.lensPostInfo, _commentData);
            uint256 commentId = commentToLens(_commentData);

            ep.resolved = true;
            emit DataTypes.lensPostCreated(commentId);
           
        }
    

}
