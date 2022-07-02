const hre = require("hardhat");

async function deployContract(name, constructor = [], print = false, signer = false) {

    try {

        const Contract = await hre.ethers.getContractFactory(name, "", signer)


        const contract = await Contract.deploy(...constructor, { gasLimit: 3000000 })


        const deployReceipt = await contract.deployed()
        print ? console.log("\x1b[35m", `contract ${name} deployed to ${deployReceipt.address}`, "\x1b[0m") : null

        return contract
    } catch (error) {
        console.log(error)
        process.exit(2)

    }

}

async function deployAllContracts() {
    rbOwner = await deployContract("RBOwner")
    hub = await deployContract("hub")
    hub.setIRBOwner(rbOwner.address)

    return { hub, rbOwner }


}

module.exports = { deployContract, deployAllContracts }