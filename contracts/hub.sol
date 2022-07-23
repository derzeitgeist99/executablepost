// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./Common/DataTypes.sol";
import "./Common/Governance.sol";
import "./Common/LensInteraction.sol";
import "./Common/ERC20Interaction.sol";

contract utils {
    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
    }

    modifier canResolve (DataTypes.Post storage post, DataTypes.ResolveTypes _resolveType ) {
        
        if(post.amount == 0) {revert DataTypes.executablePostNotFound();}
        if(post.resolvetype != _resolveType ) {revert DataTypes.cannotUseThisFunctionToResolve(_resolveType,post.resolvetype);}
        if(post.resolver !=msg.sender) {revert DataTypes.youAreNotResolverOfExecutablePost( post.resolver);}
        if(post.resolveAfter > block.timestamp) {revert DataTypes.youTryToResolveTooEarly(block.timestamp,post.resolveAfter);}
        if(post.resolved) {revert DataTypes.alreadyResolved();}
        _;
    }

    modifier is100 (uint8 _resultPartyA, uint8 _resultPartyB) {
        if (_resultPartyA + _resultPartyB != 100) { revert DataTypes.partyAPlusPartyBIsNot100();}
        _;
    }

    function calculateTransferAmount(uint8 _result, uint _amount) internal returns (uint ){
        return (_result*_amount)/100;
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

 contract hub is utils, lensInteraction, IRBOwner, ERC20Interaction{

    constructor ( address _lens) {
        governance = msg.sender;
        treasury = address(this);
        //waitForAutomaticResolution = 60*60*24*7*52; //1 year not implemented yet
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
       
        //this is last before return
        // still is this OK, knowing that we will be still changing state in the hub?
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
    
        {

            DataTypes.Post storage ep = MapIdToPost[_id];
            //transfer for partyA

            transferERC(ep.amount*_resultPartyA/100,ep.currency,ep.partyA);
            // transfer to partyB
            transferERC(ep.amount*_resultPartyB/100,ep.currency,ep.partyB);

            //post to lens as comment to inital post
            _commentData = createCommentStruct(ep.lensPostInfo, _commentData);
            uint256 commentId = commentToLens(_commentData);
            emit DataTypes.lensPostCreated(commentId);
            

    }

}

