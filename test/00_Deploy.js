const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const fs = require("fs/promises");


describe("Deploys all contracts", async () => {
    it("Deploy", async () => {
        rbOwner = await deployContract("RBOwner")
        hub = await deployContract("hub")
        hub.setIRBOwner(rbOwner.address)

        const addresses = {
            "RBOwner": rbOwner.address,
            "Hub": hub.address
        }

        await fs.writeFile('./addresses.json', JSON.stringify(addresses));


    })
})