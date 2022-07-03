const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");

const { getNamedSigners } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const { fundAllWithDai } = require("../scripts/fundAllwithDAI");
const addressBook = require("../externalcontractaddresses.json")
const DaiAbi = require("../artifacts/contracts/Mock/mockDAI.sol/DAI.json");


const amount = 1000
const currency = addressBook.ERC20.local.DAI
let dai

let tx
let receipt
let event

describe("Testing postRBOwner", async () => {

    before(async () => {
        ({ hub, rbOwner } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi)

    })



    it("Should create post", async () => {
        tx = await dai.connect(user).approve(hub.address, amount)
        receipt = await tx.wait()

        allowance = await dai.connect(user).allowance(user.address, hub.address)
        console.log(parseInt(allowance, 10));

        tx = await hub.connect(user).postRBOwner(partyA.address, partyB.address, 1000, currency, { gasLimit: 300000 })
        receipt = await tx.wait()
        // test for partyA
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(partyA.address)
        //test for partyB
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[2])
        expect(event[0]).to.equal(partyB.address)

    })


})
