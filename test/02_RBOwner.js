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


const amount = 10
const currency = addressBook.ERC20.local.DAI
const waitSeconds = 1000
let dai

let tx
let receipt
let event
let postId
let postStruct

describe("Testing postRBOwner", async () => {

    before(async () => {
        ({ hub, rbOwner } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)

    })



    it("Should create post", async () => {
        tx = await dai.connect(user).approve(rbOwner.address, amount)
        receipt = await tx.wait()
        allowance = await dai.connect(user).allowance(user.address, hub.address)


        const initialBalances = await getDAIBalances(dai, [user.address, hub.address])


        tx = await hub.connect(user).postRBOwner(partyA.address, partyB.address, amount, currency, waitSeconds, { gasLimit: 3000000 })
        //console.log(tx)
        receipt = await tx.wait()


        postId = (ethers.utils.defaultAbiCoder.decode(["bytes32"], receipt.events[2].topics[1]))[0]
        postStruct = await hub.getPostById(postId)



        // test for party addresses
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

    })
    it("Should test resolveAfter and automaticallyResolveAfter using timeblock and waitForAutomaticResolution")

    it("Should revert due to low allowance")
    it("Should revert due to low balance ")
    it("should revert due to invalid currency")
    it("should revert due to inexistent Lens profile")


})
