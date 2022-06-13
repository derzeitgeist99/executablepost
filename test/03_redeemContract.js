const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected, expectRedeemContractToBeRejected } = require("../scripts/utils")

const expect = chai.expect


describe("RedeemPost", async function () {

    let contractID = undefined
    let partyA = undefined
    let partyB = undefined
    let dai = undefined
    let bank = undefined
    let createPost = undefined
    let amount = undefined
    let waitSeconds = undefined

    beforeEach(async () => {
        amount = 1000;
        waitSeconds = 1000;
        // Get Addresses
        [partyA, partyB, _] = await ethers.getSigners()

        // Deploy Contracts
        dai = await deployContract("DAI")
        bank = await deployContract("DAIBank", [dai.address])
        createPost = await deployContract("ExecutablePost", [dai.address])

        //transfer DAI
        await dai.faucet(partyA.address, amount)
        await dai.connect(partyA).approve(createPost.address, amount)

        //create contract and get its contracID
        const newPostTx = await createPost.connect(partyA).createContract(partyA.address, partyB.address, waitSeconds, amount)
        const newPostReceipt = await newPostTx.wait();
        contractID = parseEventValue(newPostReceipt, "ContractID")[0]

    })

    it("Should fail to redeem because msg sender is wrong", async () => {
        await expectRedeemContractToBeRejected(partyB, createPost, 50, 50, contractID, "addressCannotRedeemContract")
    })
    it("Should fail to redeem because math wont add up: partyAResult + partyB result <> 1", async () => {
        await expectRedeemContractToBeRejected(partyA, createPost, 51, 50, contractID, "redeemPctResultIsWrong")
        await expectRedeemContractToBeRejected(partyA, createPost, 49, 50, contractID, "redeemPctResultIsWrong")
    })
    it("Should fail because time is not right yet...", async () => {
        const wait = [0, waitSeconds - 500]
        for (let i = 0; i < wait.length; i++) {
            await network.provider.send("evm_increaseTime", [wait[i]])
            await expectRedeemContractToBeRejected(partyA, createPost, 50, 50, contractID, "resolvePeriodNotPassed")

        }
    })



    it("Should redeem a contract and check balances of contract, partyA, partyB",
        // async () => {
        // const partyAResult = 50
        // const partyBResult = 50

        // const newRedeemTx = await createPost.connect(partyA).resolveByMsgSender(partyAResult, partyBResult, contractID)
        // const receipt = await newRedeemTx.wait()
        // const blockTimestamp = (await (ethers.provider.getBlock(receipt.blockHash))).timestamp
        // console.log("number", blockTimestamp);


        // const partyA_balance = await dai.balanceOf(partyA.address)
        // expect(partyA_balance).to.equal(partyAResult * amount / 100)
        // }
    )

    it("Should redeem a contract",
        // async () => {
        // const newRedeemTx = await createPost.connect(partyA).resolveByMsgSender(50, 50, contractID)
        // newRedeemTx.wait()
        // const getContractStructTx = await createPost.getContractMapping(contractID)
        // expect(getContractStructTx.redeemed).to.be.true

        //}
    )
    it("Should multiple contracts and check balances of contract, partyA, partyB")

})
