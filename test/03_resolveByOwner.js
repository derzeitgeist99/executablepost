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


let defaultResolutionInputs = [
    postId,
    50,
    50,
    lensPostStruct,
    { gasLimit: 3 * 1000 * 1000 }
]


describe.only("Testing post Happy Path", async () => {

    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)
        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(hub.address)


    })

    it("Should resolve post by Owner", async () => {

        //create post

        postInputStruct = createPostStruct(user, partyA, partyB)
        tx = await dai.connect(user).approve(hub.address, postInputStruct.amount);
        // why this isnot waiting?
        await tx.wait()


        let initialBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);
        ({ postId, postStruct } = await newPost(hub, user, postInputStruct, lensPostStruct))

        initialBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);

        let resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[0] = postId

        //resolve post
        tx = await hub.connect(user).resolveByOwner(...resolutionInputs)
        receipt = await tx.wait()

        const endingBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);
        const expectedEndingBalances = {
            "partyA": initialBalances[0] + parseInt(postStruct.amount, 10) * resolutionInputs[1] / 100,
            "partyB": initialBalances[1] + parseInt(postStruct.amount, 10) * resolutionInputs[1] / 100,
            "hub": initialBalances[2] - parseInt(postStruct.amount, 10)
        }

        console.log("Initial Hub", initialBalances[2])
        console.log("Expected Hub", expectedEndingBalances.hub)
        console.log("Ending Hub", endingBalances[2])

        expect(expectedEndingBalances.partyA, "partyA balance").to.equal(endingBalances[0])
        expect(expectedEndingBalances.partyB, "partyB balance").to.equal(endingBalances[1])
        expect(expectedEndingBalances.hub, "hub balance").to.equal(endingBalances[2])


    })
})

describe("Testing post UnHappy Path", async () => {


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
    it("Should reject because partyAPlusPartyBIsNot100()", async () => {
        //Too high
        let resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[1] = 51;
        resolutionInputs[2] = 50;
        await expect(hub.connect(user).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("partyAPlusPartyBIsNot100")

        //Too Low
        resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[1] = 49;
        resolutionInputs[2] = 50;
        await expect(hub.connect(user).resolveByOwner(...resolutionInputs))
            .to.be.rejectedWith("partyAPlusPartyBIsNot100")


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
    it("Should test transfer from and transfer")
})