// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "./Helpers/DataTypes.sol";
import "./Helpers/Governance.sol";
import "./Helpers/LensInteraction.sol";
import "./Helpers/ERC20Interaction.sol";
import "./Helpers/ComparationLogic.sol";
import "./Helpers/Utils.sol";
import "./Interfaces/IExecutablePost.sol";


 contract ExecutablePost is Utils, LensInteraction, IExecutablePost, ERC20Interaction, ComparationLogic {

    constructor ( address _lens) {
        governance = msg.sender;
        treasury = address(this);
        oracleTimestampTolerance = 60*60*10;
        waitForAutomaticResolution = 0; // Functionality not implemented yet, but keeping the slot
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
    external  
    _checkERCBalance(_post.amount, _post.currency, _post.owner)
    _checkLensBeforePost(_lensPost.profileId)
    returns (bytes32 id, uint256 initialPubId ) {
        /// @dev Using "pseudo random" Id so no one can browse through the EPs
        id =generateId();
       
        /// @dev we transfer and then the post. So the post can go like "I just locked XY into executable post"
        _transferFromERC(_post.amount, _post.currency, _post.owner);

        /// @dev post to Lens and store info about the post.
       initialPubId = _postToLens(_lensPost);
        _post.lensPostInfo.profileId = _lensPost.profileId;
        _post.lensPostInfo.initialPubId = initialPubId;

        /// @dev closing remarks
        MapIdToPost[id] = _post;
        MapAddressToPost[msg.sender] = _post;
        emit DataTypes.IdCreated(id);
        
        return (id,initialPubId );

    }


    function resolveByOwner(
        bytes32 _id, 
        uint8 _resultPartyA,
        uint8 _resultPartyB,
        LensDataTypes.CommentData memory _commentData) 
        external
        _canResolve(MapIdToPost[_id],DataTypes.ResolveTypes.ResolveByOwner)
        _is100(_resultPartyA, _resultPartyB)
        _checkLensBeforePost(_commentData.profileId)
    
        {
            DataTypes.Post storage ep = MapIdToPost[_id];
            
            /// @dev transfer for partyA
            _transferERC(ep.amount*_resultPartyA/100,ep.currency,ep.partyA);
            
            /// @dev transfer to partyB
            _transferERC(ep.amount*_resultPartyB/100,ep.currency,ep.partyB);

            /// @dev post to lens as comment to inital post
            _commentData = _createCommentStruct(ep.lensPostInfo, _commentData);
            uint256 commentId = _commentToLens(_commentData);

            ep.resolved = true;
            emit DataTypes.LensPostCreated(commentId);
            

    }

    function resolveByOracle(
        bytes32 _id,
        uint256 _oracleRoundId,
        LensDataTypes.CommentData memory _commentData)
        external
        _canResolve(MapIdToPost[_id], DataTypes.ResolveTypes.ResolveByOracle)
        _isRoundIdOK(_oracleRoundId,MapIdToPost[_id].resolveConditions)
        _checkLensBeforePost(_commentData.profileId)
        {
            DataTypes.Post storage ep = MapIdToPost[_id];
            DataTypes.ResolveConditions storage conditions = ep.resolveConditions;
            
            /// @dev retrieve answer, evaluate winner and transfer
            int256 answer = _getAnswer(conditions.sourceAddress, _oracleRoundId);
            address sendTo = _compareTwoIntegers(conditions.valueInt,answer, conditions.operator) ? ep.partyA : ep.partyB;
            _transferERC(ep.amount,ep.currency,sendTo);

            /// @dev post to lens as comment to inital post
            _commentData = _createCommentStruct(ep.lensPostInfo, _commentData);
            uint256 commentId = _commentToLens(_commentData);

            ep.resolved = true;
            emit DataTypes.LensPostCreated(commentId);
           
        }
    

}
