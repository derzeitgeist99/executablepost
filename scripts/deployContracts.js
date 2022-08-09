const hre = require("hardhat");
const { getNamedSigners } = require("./utils");
const addressBook = require("../externalcontractaddresses.json")
const lensHubAddr = require("../../Tutorials/lens-protocol/addresses.json")["lensHub proxy"]


async function deployContract(name, constructor = [], print = false, signer = false) {

    try {
        //if not stated othwerwise deploy all contracts from governance address
        const { governance } = await getNamedSigners()
        signer = signer ? signer : governance

        const Contract = await hre.ethers.getContractFactory(name, "", signer)

        const contract = await Contract.connect(signer).deploy(...constructor, { gasLimit: 3 * 1000 * 1000 * 10 })


        const deployReceipt = await contract.deployed()
        print ? console.log("\x1b[35m", `contract ${name} deployed to ${deployReceipt.address}`, "\x1b[0m") : null

        return contract
    } catch (error) {
        console.log(error)
        process.exit(2)

    }

}

async function deployAllContracts() {


    hub = await deployContract("hub", [lensHubAddr])

    return { hub }

}

module.exports = { deployContract, deployAllContracts }