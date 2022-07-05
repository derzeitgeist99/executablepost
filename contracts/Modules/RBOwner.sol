// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import 'hardhat/console.sol';
import "../Common/DataTypes.sol";
import "../Common/Governance.sol";
import "../Common/LensInteraction.sol";
import "../Common/ERC20Interaction.sol";

contract utils {
    function generateId() internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp,tx.origin));
    }

}

interface IRBOwner {
    function postRBOwner(
        DataTypes.Post calldata,
        LensDataTypes.PostData calldata
)
    external 
    returns (bytes32 id,uint256 initialPubId );
}

 contract RBOwner is utils, lensInteraction, IRBOwner, ERC20Interaction{

    constructor (address _treasury, address _lens) {
        governance = msg.sender;
        treasury = _treasury;
        waitForAutomaticResolution = 60*60*24*7*52; //1 year
        lens = ILensHub(_lens);

    }

    function postRBOwner(DataTypes.Post calldata _post, LensDataTypes.PostData calldata _lensPost)
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
        
        return (id,initialPubId );


    }

}

