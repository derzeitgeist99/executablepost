const hre = require("hardhat");
const { getNamedSigners } = require("./utils");
const addressBook = require("../externalcontractaddresses.json")

async function deployContract(name, constructor = [], print = false, signer = false) {

    try {
        //if not stated othwerwise deploy all contracts from governance address
        const { governance } = await getNamedSigners()
        signer = signer ? signer : governance

        const Contract = await hre.ethers.getContractFactory(name, "", signer)
        const contract = await Contract.connect(signer).deploy(...constructor, { gasLimit: 3000000 })


        const deployReceipt = await contract.deployed()
        print ? console.log("\x1b[35m", `contract ${name} deployed to ${deployReceipt.address}`, "\x1b[0m") : null

        return contract
    } catch (error) {
        console.log(error)
        process.exit(2)

    }

}

async function deployAllContracts() {

    const { governance } = await getNamedSigners()
    rbOwner = await deployContract("RBOwner")
    hub = await deployContract("hub")
    gov = await deployContract("governanceUtil", [], false, governance)
    hub.setIRBOwner(rbOwner.address)
    console.log(addressBook.ERC20.local.DAI)
    gov.connect(governance).setDaiAddress(addressBook.ERC20.local.DAI)
    gov.connect(governance).setTreasuryAddress(hub.address)

    return { hub, rbOwner, gov }


}

module.exports = { deployContract, deployAllContracts }