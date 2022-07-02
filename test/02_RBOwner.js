const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");

const { getNamedSigners } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const { fundAllWithDai } = require("../scripts/fundAllwithDAI");



describe("Testing postRBOwner", async () => {

    before(async () => {
        ({ hub, rbOwner } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());

    })

    it("Should create post", async () => {
        await fundAllWithDai()
        let tx = await hub.connect(user).postRBOwner(partyA.address, partyB.address)
        let receipt = await tx.wait()
        // test for partyA
        let event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(partyA.address)
        //test for partyB
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[2])
        expect(event[0]).to.equal(partyB.address)

    })


})
