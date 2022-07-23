
const { defaultAbiCoder } = require('ethers/lib/utils');

const { ethers, network } = require("hardhat");

// const lensHubAddr = require("../../externalcontractaddresses.json").lens.local.ILensHub
const lensHubAddr = require("../../Tutorials/lens-protocol/addresses.json")["lensHub proxy"]
const lensHubAbi = require("../../Tutorials/lens-protocol/artifacts/contracts/interfaces/ILensHub.sol/ILensHub.json")

const lensSetDispatcher = async (RBAddress) => {

    const [admin, governance, user] = await ethers.getSigners()

    //connect to LensHub and set dispatcher (dispatcher = contract that can post on behalf of Profile)
    const lensHub = new ethers.Contract(lensHubAddr, lensHubAbi.abi, governance)
    await lensHub.connect(user).setDispatcher(1, RBAddress, { gasLimit: 3000000 })

    //*********These might come in handy during testing**************//
    //*********........................................**************//
    //get ProfileId
    // const profileId = await lensHub.getProfile(3)
    // const dispatcher = await lensHub.getDispatcher(1, { gasLimit: 3000000 })
    //contentURI = "ifps://..."
    //await lens.post(profileID, contentURI, collectModule, defaultAbiCoder.encode(['bool'], [true]), { gasLimit: 3000000 })
}

const lensGetPostById = async (profileId, pubId) => {
    const [admin, governance, user] = await ethers.getSigners()
    const lensHub = new ethers.Contract(lensHubAddr, lensHubAbi.abi, governance)

    const result = await lensHub.getPub(profileId, pubId)

    const pubCount = await lensHub.getPubCount(profileId)
    //console.log("Pub Count", parseInt(pubCount, 16));
    return result


}
module.exports = { lensSetDispatcher, lensGetPostById }

//lensSetDispatcher(RBAddress = "0xdd44de04b02f9a0fffb5d1d377342b547c7340c5")



