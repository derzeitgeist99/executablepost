const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");


const { getNamedSigners, getDAIBalances } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const { fundAllWithDai } = require("../scripts/fundAllwithDAI");
const addressBook = require("../externalcontractaddresses.json")
const DaiAbi = require("../artifacts/contracts/Mock/mockDAI.sol/DAI.json");
const { lensSetDispatcher, lensGetPostById } = require("../scripts/lensUtils");


// Inputs
const { lensPostStruct, createPostStruct } = require("../scripts/defaultInputStructs");
const { newPost } = require("../scripts/newExecutablePost");
const { defaultAbiCoder, keccak256 } = require("ethers/lib/utils");
let postStruct


let dai
let tx
let receipt
let postId

let postInputStruct

let defaultResolutionInputs


describe.only("Testing post Happy Path", async () => {

    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)
        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(hub.address)


    })

    it.skip("Should resolve post by Owner", async () => {

        //create post

        postInputStruct = createPostStruct(user, partyA, partyB)
        tx = await dai.connect(user).approve(hub.address, postInputStruct.amount)
        const initialBalances = await getDAIBalances(dai, [user.address, hub.address]);
        ({ postId, postStruct } = await newPost(hub, user, postInputStruct, lensPostStruct))



        defaultResolutionInputs[0] = postId

        //resolve post
        tx = await hub.connect(user).resolveByOwner(...defaultResolutionInputs)
        receipt = await tx.wait()

    })
})

describe.only("Testing post UnHappy Path", async () => {


    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)

        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(hub.address)

        //create post
        postInputStruct = createPostStruct(user, partyA, partyB)
        let tx = await dai.connect(user).approve(hub.address, postInputStruct.amount);
        receipt = await tx.wait();
        ({ postId, postStruct } = await newPost(hub, user, postInputStruct, lensPostStruct))



        defaultResolutionInputs = [
            postId,
            50,
            50,
            lensPostStruct,
            { gasLimit: 3 * 1000 * 1000 }
        ]

        console.log("Calling from Before. Using this ID: ", defaultResolutionInputs[0])

    })

    it("Should reject because executablePostNotFound()", async () => {

        let resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[0] = keccak256(defaultAbiCoder.encode(["string"], ["IdontExist"]))
        console.log("Calling from Before. Using this ID: ", resolutionInputs[0])


        await expect(hub.connect(user).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("executablePostNotFound")
    })
    it("Should reject because youAreNotResolverOfExecutablePost()", async () => {

        let resolutionInputs = [...defaultResolutionInputs]
        console.log("Calling from Before. Using this ID: ", resolutionInputs[0])
        await expect(hub.connect(partyA).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("youAreNotResolverOfExecutablePost")
    })
    it.skip("Should reject because alreadyResolved()")
    it("Should reject because cannotUseThisFunctionToResolve()", async () => {

        // here I need to post with different resolveType. 
        let newPostInputStruct = { ...postInputStruct }
        newPostInputStruct.resolvetype = 1
        tx = await dai.connect(user).approve(hub.address, newPostInputStruct.amount);
        await tx.wait();
        ({ postId, postStruct } = await newPost(hub, user, newPostInputStruct, lensPostStruct))

        let resolutionInputs = defaultResolutionInputs
        resolutionInputs[0] = postId
        await expect(hub.connect(user).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("cannotUseThisFunctionToResolve")


    })
    it("Should reject because youTryToResolveTooEarly()", async () => {
        // here I need to post with different resolveType. 
        let newPostInputStruct = { ...postInputStruct }
        newPostInputStruct.resolveAfter = 2 * 1000 * 1000 * 1000

        tx = await dai.connect(user).approve(hub.address, newPostInputStruct.amount);
        await tx.wait();
        ({ postId, postStruct } = await newPost(hub, user, newPostInputStruct, lensPostStruct))

        let resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[0] = postId
        await expect(hub.connect(user).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("youTryToResolveTooEarly")

    })
})