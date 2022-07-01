const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");

const { getNamedSigners } = require("../scripts/utils");
const contractAddresses = require("../addresses.json")
const hubAbi = require("../artifacts/contracts/hub.sol/hub.json")


describe("Testing Governance", async () => {



    before(async () => {
        const [governance, user, address3] = await getNamedSigners()
        const hub = new ethers.Contract(contractAddresses["Hub"], hubAbi.abi)
    })


    it("should change contract Addresses", async () => {


        await hub.connect(governance).setIRBOwner(address3.address)

        //when succesfull change the state back
        await hub.connect(governance).setIRBOwner(contractAddresses.RBOwner)


    })

    it.skip("should revert contract Addresses ", async () => {
        await expect(hub.connect(user).setIRBOwner(address3.address)).to.be.rejectedWith("UnauthorizedAccount")
    })


})

