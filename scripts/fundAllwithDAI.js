const { deployContract } = require("./deployContracts")
const { getNamedSigners } = require("./utils")
const fs = require("fs/promises")
const { ethers } = require("hardhat");
const DaiAbi = require("../artifacts/contracts/Mock/mockDAI.sol/DAI.json");

const addressBook = require("../externalcontractaddresses.json")

const deployDai = async () => {
    const filePath = "./externalcontractaddresses.json"

    const dai = await deployContract("DAI", [], true);
    // update address book
    addressBook.ERC20 = { "local": { "DAI": dai.address } }
    await fs.writeFile(filePath, JSON.stringify(addressBook))

}

const fundAllWithDai = async () => {
    const namedAccounts = await getNamedSigners();
    const dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, namedAccounts.governance)

    for (account of Object.values(namedAccounts)) {
        const amount = 10 * 1000
        await dai.faucet(account.address, amount, { gasLimit: 3000000 })
        balance = await dai.myBalanceOf(account.address)
        console.log(`Account ${account.address}: sending ${amount} for new balance ${balance}`);

    };
}


//module.exports = { fundAllWithDai, deployDai }

//deployDai();
//fundAllWithDai()
//npx hardhat run Scripts/fundAllwithDAI.js --network localhost