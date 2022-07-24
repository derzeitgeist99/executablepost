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
let postStruct


let dai
let tx
let receipt
let postId

describe("Testing post", async () => {

    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)
        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(hub.address)


    })

    it("Should create post using function", async () => {

        postInputStruct = createPostStruct(user, partyA, partyB)
        tx = await dai.connect(user).approve(hub.address, postInputStruct.amount)
        const initialBalances = await getDAIBalances(dai, [user.address, hub.address]);
        ({ postId, postStruct } = await newPost(hub, user, postInputStruct, lensPostStruct))

        // test for party addresses
        // if these are failing check the events order
        expect(postStruct.partyA, "partyA address").to.equal(partyA.address)
        expect(postStruct.partyB, "partyB address").to.equal(partyB.address)
        expect(postStruct.owner, "owner address").to.equal(user.address)
        expect(postStruct.resolver, "resolver address").to.equal(user.address)
        expect(parseInt(postStruct.resolveAfter, 16), "resolveAfter").to.be.greaterThan(0)
        expect(parseInt(postStruct.automaticallyResolveAfter, 16), "AutomaticalyResolveAfter").to.be.greaterThan(parseInt(postStruct.resolveAfter, 16))
        expect(postStruct.resolver, "resovler address").to.equal(user.address)

        //check balances
        const endingBalances = await getDAIBalances(dai, [user.address, hub.address])


        expect(initialBalances[0] - parseInt(postStruct.amount, 10), "user DAI balance").to.equal(endingBalances[0])
        expect(initialBalances[1] + parseInt(postStruct.amount, 10), "contract DAI balance").to.equal(endingBalances[1])

        //check Lens
        receipt = await lensGetPostById(postStruct.lensPostInfo.profileId, postStruct.lensPostInfo.initialPubId)
        expect(lensPostStruct.contentURI, "Content URI").to.equal(receipt.contentURI)

    })


    it("Should test resolveAfter and automaticallyResolveAfter using timeblock and waitForAutomaticResolution")

    it("Should revert due to amount < 1")
    it("Should revert due to low allowance")
    it("Should revert due to low balance ")
    it("should revert due to invalid currency")
    it("should revert due to inexistent Lens profile")
    it("should revert due to wrong or no dispatcher")
    it("after error in lens it should get the money back?")

})
