require('dotenv').config({ path: '/Users/andy/Keys/executablePost.env' }).parsed
const { ethers } = require('hardhat');
const hre = require("hardhat");


async function main() {


    const governor = new hre.ethers.Wallet(process.env.GOVERNOR_PRIVATE_KEY)

    const Hub = await hre.ethers.getContractFactory("hub", "", governor)
    console.log(Hub.signer.address);
    const hub = await Hub.deploy("0x53190533AB5a5F3813E8296392068b674999aFc2", { gasLimit: 9 * 1000 * 1000 })
    const deployReceipt = await hub.deployed()
    console.log("\x1b[35m", `contract ${Hub} deployed to ${deployReceipt.address}`, "\x1b[0m")


}

main()