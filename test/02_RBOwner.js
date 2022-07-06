const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");
const { defaultAbiCoder } = require('ethers/lib/utils');

const { getNamedSigners, getDAIBalances } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const { fundAllWithDai } = require("../scripts/fundAllwithDAI");
const addressBook = require("../externalcontractaddresses.json")
const DaiAbi = require("../artifacts/contracts/Mock/mockDAI.sol/DAI.json");
const { lensSetDispatcher, lensGetPostById } = require("../scripts/lensUtils");
const collectModule = require("../../Tutorials/lens-protocol/addresses.json")["free collect module"]
//const referenceModule = require("../../Tutorials/lens-protocol/addresses.json")["follower only reference module"]

const amount = 10
const currency = addressBook.ERC20.local.DAI
const waitSeconds = 1000
let contentURI = Math.random().toString()
let dai

let tx
let receipt
let postId
let postStruct

describe("Testing postRBOwner", async () => {

    before(async () => {
        ({ hub, rbOwner } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)
        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(rbOwner.address)


    })

    it("Should create post using struct", async () => {
        tx = await dai.connect(user).approve(rbOwner.address, amount)
        receipt = await tx.wait()
        allowance = await dai.connect(user).allowance(user.address, hub.address)


        const initialBalances = await getDAIBalances(dai, [user.address, hub.address])


        postStruct = {
            "partyA": partyA.address,
            "partyB": partyB.address,
            "owner": user.address,
            "amount": ethers.BigNumber.from(amount),
            "currency": currency,
            "resolveAfter": ethers.BigNumber.from(1000),
            "automaticallyResolveAfter": ethers.BigNumber.from(1200),
            "resolved": false,
            "resolvetype": 0,
            "resolveByOracleConditions": {
                "price": ethers.BigNumber.from(0)
            },
            "resolveByOwnerConditions": {
                "resolver": user.address
            },
            "lensPostInfo": {
                "profileId": 0,
                "initialPubId": 0,
                "resolvingPubId": 0
            }
        }

        lensPostStruct = {
            "profileId": 1,
            "contentURI": contentURI,
            "collectModule": collectModule,
            "collectModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
            "referenceModule": '0x0000000000000000000000000000000000000000',
            "referenceModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
        }


        tx = await hub.connect(user).postRBOwner(postStruct, lensPostStruct, { gasLimit: 3000000 })
        receipt = await tx.wait()

        postId = (ethers.utils.defaultAbiCoder.decode(["bytes32"], receipt.events[3].topics[1]))[0]
        postStruct = await hub.getPostById(postId)

        // test for party addresses
        // if these are failing check the events order
        expect(postStruct.partyA, "partyA address").to.equal(partyA.address)
        expect(postStruct.partyB, "partyB address").to.equal(partyB.address)
        expect(postStruct.owner, "owner address").to.equal(user.address)
        expect(parseInt(postStruct.resolveAfter, 16), "resolveAfter").to.be.greaterThan(0)
        expect(parseInt(postStruct.automaticallyResolveAfter, 16), "AutomaticalyResolveAfter").to.be.greaterThan(parseInt(postStruct.resolveAfter, 16))
        expect(postStruct.resolveByOwnerConditions[0], "resovler address").to.equal(user.address)

        //check balances
        const endingBalances = await getDAIBalances(dai, [user.address, hub.address])
        expect(initialBalances[0] - amount, "user DAI balance").to.equal(endingBalances[0])
        expect(initialBalances[1] + amount, "contract DAI balance").to.equal(endingBalances[1])

        //check Lens
        receipt = await lensGetPostById(postStruct.lensPostInfo.profileId, postStruct.lensPostInfo.initialPubId)
        expect(contentURI, "Content URI").to.equal(receipt.contentURI)



    })


    it("Should test resolveAfter and automaticallyResolveAfter using timeblock and waitForAutomaticResolution")

    it("Should revert due to low allowance")
    it("Should revert due to low balance ")
    it("should revert due to invalid currency")
    it("should revert due to inexistent Lens profile")
    it("should revert due to wrong or no dispatcher")


})
