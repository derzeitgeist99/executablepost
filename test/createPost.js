const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployDai, deployDaiBank, deployContract } = require("../scripts/deployContracts");


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
        createPost = await deployContract("ExecutablePost")

        //transfer DAI
        await dai.faucet(partyA.address, 1000)


    })

    it("Party A Should have 1000 DAI", async function () {
        balance = await dai.myBalanceOf(partyA.address)
        expect(balance).to.equal(1000)
    })

    it("Should return a struct", async function () {

        const newPostTx = await createPost.createContract(partyA.address, partyB.address, 1000, 10);
        const newPostReceipt = await newPostTx.wait();

        const contractID = newPostReceipt.events[0].args["ContractID"]

        const getContractStructTx = await createPost.getContractMapping(contractID)
        expect(getContractStructTx.partyA).to.equal(partyA.address)
    })
})