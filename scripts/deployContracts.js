const hre = require("hardhat");

async function deployContract(name, constructor = [], print = false) {
    try {
        const Contract = await hre.ethers.getContractFactory(name)
        const contract = await Contract.deploy(...constructor)

        const deployReceipt = await contract.deployed()
        print ? console.log("\x1b[35m", `contract ${name} deployed to ${deployReceipt.address}`, "\x1b[0m") : null

        return contract
    } catch (error) {
        console.log(error)
        process.exit(2)

    }

}

module.exports = { deployContract }