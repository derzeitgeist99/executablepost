const { iterateObserversSafely } = require("@apollo/client/utilities");
const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected, expectRedeemContractToBeRejected } = require("../scripts/utils")

const expect = chai.expect


describe.skip("Timestamps", async function () {

    let contractID = undefined
    let partyA = undefined
    let partyB = undefined
    let dai = undefined
    let bank = undefined
    let createPost = undefined
    let amount = undefined

    beforeEach(async () => {
        amount = 1000;
        // Get Addresses
        [partyA, partyB, _] = await ethers.getSigners()

        // Deploy Contracts
        dai = await deployContract("DAI")
        bank = await deployContract("DAIBank", [dai.address])
        createPost = await deployContract("ExecutablePost", [dai.address])

        //transfer DAI
        await dai.faucet(partyA.address, amount)
        await dai.connect(partyA).approve(createPost.address, amount)

    })

    it("Timestamp", async () => {

        console.log("currentTime", Math.floor(Date.now() / 1000))

        for (let i = 0; i < 2; i++) {
            const newPostTx = await createPost.connect(partyA).createContract(partyA.address, partyB.address, 1000, 100)
            const receipt = await newPostTx.wait();
            const blockInfo = await (ethers.provider.getBlock(receipt.blockHash))
            console.log(`Run Number ${i} blockId: ${receipt.blockNumber} timestamp: ${blockInfo.timestamp}`)
            const waitSeconds = await createPost.getContractMapping(parseEventValue(receipt, "ContractID")[0])
            console.log(`contract will need to wait until ${waitSeconds.resolveAfter}`);

            await network.provider.send("evm_increaseTime", [1000])
        }

    })
})