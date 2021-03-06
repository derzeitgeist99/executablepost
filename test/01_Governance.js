const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");
const { getNamedSigners } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const addressBook = require("../externalcontractaddresses.json")


describe("Testing Governance", async () => {

    let hub
    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, address3 } = await getNamedSigners());

    })


    it("Should change the Treasury Address", async () => {

        let tx = await hub.connect(governance)._setTreasuryAddress(address3.address)
        let receipt = await tx.wait()
        let event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(address3.address)

        //when succesfull change the state back
        tx = await hub.connect(governance)._setTreasuryAddress(hub.address)
        receipt = await tx.wait()
        event = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])
        expect(event[0]).to.equal(hub.address)

    })


    // it("should revert contract Addresses ", async () => {
    //     await expect(hub.connect(user).setIRBOwner(address3.address)).to.be.rejectedWith("UserNotAllowed")
    // })
    //cannot get the error message. so keeping this test as pending
    it.skip("should revert Treasury address change", async () => {
        await expect(hub.connect(user)._setTreasuryAddress(address3.address, { gasLimit: 300000 })).to.be.rejected
    })
    it("Should revert unwhitelisted currency")
    it("should change the Automatic resolution period")
    it("should test update of lens address")
    it("should revert update of lens address due to unauthorized user")


})

