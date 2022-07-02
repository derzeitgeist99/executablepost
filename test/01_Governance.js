const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");
const { getNamedSigners } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const addressBook = require("../externalcontractaddresses.json")


describe("Testing Governance", async () => {


    before(async () => {
        ({ hub, rbOwner, gov } = await deployAllContracts());
        ({ governance, user, address3 } = await getNamedSigners());

    })


    it("should change contract Addresses", async () => {

        originalAddress = rbOwner.address

        let tx = await hub.connect(governance).setIRBOwner(address3.address)
        let receipt = await tx.wait()
        let event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])

        expect(event[0]).to.equal(address3.address)

        //when succesfull change the state back
        tx = await hub.connect(governance).setIRBOwner(originalAddress)
        receipt = await tx.wait()
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(originalAddress)

    })

    it.skip("Should change the DaiAddress", async () => {

        let tx = await gov.connect(governance).setDaiAddress(address3.address)
        let receipt = await tx.wait()
        let event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(address3.address)

        //when succesfull change the state back
        tx = await gov.connect(governance).setDaiAddress(addressBook.ERC20.local.DAI)
        receipt = await tx.wait()
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        console.log(event);
        expect(event[0]).to.equal(addressBook.ERC20.local.DAI)

    })


    it.skip("should revert contract Addresses ", async () => {
        await expect(hub.connect(user).setIRBOwner(address3.address)).to.be.rejectedWith("UnauthorizedAccount")
    })

    it("should revert dai address change", async () => {
        await expect(gov.connect(user).setDaiAddress(address3.address, { gasLimit: 300000 })).to.be.rejectedWith("UserNotAllowed")
    })

    it("Should test setting of treasury address (happy path)")
    it("Should test setting of treasury address (unhappy path)")


})

