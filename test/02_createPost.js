const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected } = require("../scripts/utils")

const expect = chai.expect



describe("CreatePost", async function () {
    let contractID = undefined
    let partyA = undefined
    let partyB = undefined
    let dai = undefined
    let bank = undefined
    let createPost = undefined

    beforeEach(async () => {
        // Get Addresses
        [partyA, partyB, _] = await ethers.getSigners()

        // Deploy Contracts
        dai = await deployContract("DAI")
        bank = await deployContract("DAIBank", [dai.address])
        createPost = await deployContract("ExecutablePost", [dai.address])

        //transfer DAI
        await dai.faucet(partyA.address, 1000)
        await dai.connect(partyA).approve(createPost.address, 1000)

    })


    it("Should create a contract", async function () {

        const newPostTx = await createPost.createContract(partyA.address, partyB.address, 1, 1000)

        const newPostReceipt = await newPostTx.wait();
        contractID = parseEventValue(newPostReceipt, "ContractID")[0]

        expect(contractID.length).to.greaterThan(1)

        const getContractStructTx = await createPost.getContractMapping(contractID)
        expect(getContractStructTx.partyA).to.equal(partyA.address)

    })

    it("Should create 2 contracts", async function () {
        for (let i = 0; i < 2; i++) {

            const newPostTx = await createPost.createContract(partyA.address, partyB.address, 1, 500)

            const newPostReceipt = await newPostTx.wait();
            contractID = parseEventValue(newPostReceipt, "ContractID")[0]

            expect(contractID.length).to.greaterThan(1)

            const getContractStructTx = await createPost.getContractMapping(contractID)
            expect(getContractStructTx.partyA).to.equal(partyA.address)
        }

    })

    it("Should fail after 3rd contract", async function () {
        // first 2 contracts
        for (let i = 0; i < 2; i++) {

            const newPostTx = await createPost.createContract(partyA.address, partyB.address, 1, 500)

            const newPostReceipt = await newPostTx.wait();
            contractID = parseEventValue(newPostReceipt, "ContractID")[0]

            expect(contractID.length).to.greaterThan(1)

            const getContractStructTx = await createPost.getContractMapping(contractID)
            expect(getContractStructTx.partyA).to.equal(partyA.address)
        }
        // third contract after allowance is depleted
        await expectCreateContractToBeRejected(createPost, partyA.address, partyB.address, 1, 1, "insufficientAllowance")
        // only 2 contracts are avaialble
        const listOfContracts = await createPost.getAllContractsOfAddress(partyA.address)
        expect(listOfContracts.length).to.equal(2)

    })

    it("Tx should fail due to insufficient Balance", async function () {
        const promise = await dai.connect(partyA).approve(createPost.address, 10000)
        await promise.wait()
        await expectCreateContractToBeRejected(createPost, partyA.address, partyB.address, 1, 10000, "insufficientBalance")
    })

    it("Tx should fail due to insufficient allowance", async function () {
        // lowering the allowance from 1000 to 900. Funds are same
        const promise = await dai.connect(partyA).approve(createPost.address, 900)
        await promise.wait()
        await expectCreateContractToBeRejected(createPost, partyA.address, partyB.address, 1, 1000, "insufficientAllowance")
    })


    it("Tx should fail because.... ")

})