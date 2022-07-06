const { ethers } = require("hardhat");

const newPost = async (hub, user, postStruct, lensPostStruct, eventIndex = 3) => {
    tx = await hub.connect(user).post(postStruct, lensPostStruct, { gasLimit: 3000000 })
    receipt = await tx.wait()

    postId = (ethers.utils.defaultAbiCoder.decode(["bytes32"], receipt.events[eventIndex].topics[1]))[0]
    postStruct = await hub.getPostById(postId)

    return { postId, postStruct }
}

module.exports = { newPost }