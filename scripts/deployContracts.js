const hre = require("hardhat");

async function deployContract(name, constructor = []) {
    try {
        const Contract = await hre.ethers.getContractFactory(name)
        const contract = await Contract.deploy(...constructor)

        const deployReceipt = await contract.deployed()
        console.log("\x1b[35m", `contract ${name} deployed to ${deployReceipt.address}`, "\x1b[0m");

        return contract
    } catch (error) {
        console.log(error)
        process.exit(2)

    }

}

module.exports = { deployContract }