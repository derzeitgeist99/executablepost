const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployDai, deployDaiBank, deployContract } = require("../scripts/deployContracts");
const { parseEventValue, parseEventValueII } = require("../scripts/utils")


describe("CreatePost", async function () {
    let partyA = undefined
    let partyB = undefined
    let dai = undefined
    let bank = undefined
    let createPost = undefined

    before(async () => {
        // Get Addresses
        [partyA, partyB, _] = await ethers.getSigners()

        // Deploy Contracts
        dai = await deployContract("DAI")
        bank = await deployContract("DAIBank", [dai.address])
        createPost = await deployContract("ExecutablePost", [dai.address])

        //transfer DAI
        await dai.faucet(partyA.address, 1000)


    })

    it("Party A Should have 1000 DAI", async function () {
        balance = await dai.myBalanceOf(partyA.address)
        expect(balance).to.equal(1000)
    })
    it("Party A Should allow contract to spend 1000 DAI", async function () {
        const promise = await dai.connect(partyA).approve(createPost.address, 1000)
        await promise.wait()
        const allowance = await bank.allowance(partyA.address, createPost.address)
        expect(allowance).to.equal(1000)
    })

    it("Should create a contract", async function () {

        const newPostTx = await createPost.createContract(partyA.address, partyB.address, 1, 1000);
        const newPostReceipt = await newPostTx.wait();
        const contractID = parseEventValue(newPostReceipt, "ContractID")[0]

        expect(contractID.length).to.greaterThan(1)

        const getContractStructTx = await createPost.getContractMapping(contractID)
        expect(getContractStructTx.partyA).to.equal(partyA.address)

    })


})