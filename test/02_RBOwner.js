const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");

const { getNamedSigners, parseEventValue } = require("../scripts/utils");
const contractAddresses = require("../addresses.json")

const rbAbi = require("../artifacts/contracts/Modules/RBOwner.sol/RBOwner.json")

describe("Testing postRBOwner", async () => {
    before(async () => {
        const [governance, user, address3, addres4] = await getNamedSigners()
        const rb = new ethers.Contract(contractAddresses["RBOwner"], rbAbi.abi)
    })

    it("Should create post", async () => {
        let tx = await hub.connect(user).postRBOwner(address3.address, address4.address)
        let receipt = await tx.wait()

        let event1 = ethers.utils.defaultAbiCoder.decode(["address"], receipt.events[0].topics[1])

        console.log(event1);
        //console.log(receipt.events[0]);

        //console.log(address3.address);
    })


})
