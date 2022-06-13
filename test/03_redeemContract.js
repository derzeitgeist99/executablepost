const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected, expectRedeemContractToBeRejected, getDAIBalances } = require("../scripts/utils")

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

    it("Should redeem a contract and check balances of contract, partyA, partyB", async () => {
        const partyAResult = 50
        const partyBResult = 50

        const addressesToTest = [partyA.address, partyB.address, createPost.address]

        const initialBalances = await getDAIBalances(dai, addressesToTest)

        await network.provider.send("evm_increaseTime", [waitSeconds + 1])

        const newRedeemTx = await createPost.connect(partyA).resolveByMsgSender(partyAResult, partyBResult, contractID)
        const receipt = await newRedeemTx.wait()


        const endingBalances = await getDAIBalances(dai, addressesToTest)

        //party A
        expect(initialBalances[0] + (amount * partyAResult / 100)).to.equal(endingBalances[0])
        //party B
        expect(initialBalances[1] + (amount * partyBResult / 100)).to.equal(endingBalances[1])
        //contract
        expect(initialBalances[2] - amount).to.equal(endingBalances[2])

        // check if redeemed status is true
        const contractStruct = await createPost.getContractMapping(contractID)
        expect(contractStruct.redeemed).to.be.true

    })


})
