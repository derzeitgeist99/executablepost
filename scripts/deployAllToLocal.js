//const { ethers } = require("hardhat");

const { deployContract } = require("./deployContracts");
const fs = require("fs")

const main = async () => {
    const hre = require("hardhat");

    const contractOwner = (await ethers.getSigners())[0]


    dai = await deployContract("DAI", "", false, contractOwner)
    bank = await deployContract("DAIBank", [dai.address], false, contractOwner)
    executablePost = await deployContract("ExecutablePost", [dai.address], false, contractOwner)

    const contractList = [{ contract: dai, name: "dai.json" },
    { contract: bank, name: "bank.json" },
    { contract: executablePost, name: "executablePost.json" }]

    contractList.forEach(c => {
        const data = {
            address: c.contract.address,
            abi: c.contract.interface
        }

        fs.writeFileSync(`../src/Artifacts/${c.name}`, JSON.stringify(data))

    })



}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    }) 