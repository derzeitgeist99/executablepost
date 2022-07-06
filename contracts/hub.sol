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
        transferERC(_post.amount, _post.currency, _post.owner);
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
        bytes32 id, 
        uint8 resultPartyA,
        uint8 resultPartyB,
        LensDataTypes.PostData calldata _lensPost) 
        public
        canResolve(MapIdToPost[id],DataTypes.ResolveTypes.ResolveByOwner)
        {
            console.log("here!");

    }

}

