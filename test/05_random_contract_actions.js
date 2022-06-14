const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected, expectRedeemContractToBeRejected, getDAIBalances, generateRandomBN, shuffleArray } = require("../scripts/utils")

const expect = chai.expect


const createNewContract = async (createPost) => {
    // define parameters
    const allAddresses = await ethers.getSigners()
    // this makes sure that party A and B are not the same address
    const [partyA, partyB] = shuffleArray(allAddresses, 2)


    const redeemAfter = Math.floor(Math.random() * (1000 - 1) + 1)
    const amount = generateRandomBN(15, 1)

    //transfer DAI
    await dai.faucet(partyA.address, amount)
    await dai.connect(partyA).approve(createPost.address, amount)

    //post
    const newPostTx = await createPost.connect(partyA).createContract(partyA.address, partyB.address, redeemAfter, amount)
    const newPostReceipt = await newPostTx.wait();
    contractID = parseEventValue(newPostReceipt, "ContractID")[0]

    return contractID

}
const redeemContract = async (contractID) => {
    let contractStruct = await createPost.getContractMapping(contractID)

    // let latestBlockID = await ethers.provider.getBlockNumber()
    // let latestBlock = await ethers.provider.getBlock(latestBlockID)

    // console.log("Diff", contractStruct.resolveAfter - latestBlock.timestamp);

    const waitSeconds = 1000
    await network.provider.send("evm_increaseTime", [waitSeconds + 1])

    const signer = await ethers.provider.getSigner(contractStruct.resolverAddress)

    const partyAResult = Math.floor(Math.random() * 100)
    const partyBResult = 100 - partyAResult

    const addressesToTest = [contractStruct.partyA, contractStruct.partyB, createPost.address]
    const initialBalances = await getDAIBalances(dai, addressesToTest, true)

    const newRedeemTx = await createPost.connect(signer).resolveByMsgSender(partyAResult, partyBResult, contractID)
    const receipt = await newRedeemTx.wait()

    const amount = contractStruct.amount
    expect(amount.mul((partyAResult + partyBResult) / 100), "Amount").to.equal(amount)

    const endingBalances = await getDAIBalances(dai, addressesToTest, true)

    partyALog = { startingBalance: initialBalances[0], expect: initialBalances[0].add(amount.mul(partyAResult).div(100)), endingBalance: endingBalances[0], diff: endingBalances[0].sub(initialBalances[0]), amount: amount, pct: partyAResult }
    partyBLog = { startingBalance: initialBalances[1], expect: initialBalances[1].add(amount.mul(partyBResult).div(100)), endingBalance: endingBalances[1], diff: endingBalances[1].sub(initialBalances[1]), amount: amount, pct: partyBResult }
    //console.table([partyALog, partyBLog])


    //party A
    expect(initialBalances[0].add(amount.mul(partyAResult).div(100)), "partyA").to.equal(endingBalances[0])
    // //party B
    expect(initialBalances[1].add(amount.mul(partyBResult).div(100)), "partyB").to.equal(endingBalances[1])
    //contract
    const contractBalance = initialBalances[2].sub(amount).sub(endingBalances[2])
    //console.log(contractBalance.toNumber());

    expect(Math.abs(contractBalance.toNumber()), "contract").to.be.lessThan(2)

    // check if redeemed status is true
    contractStruct = await createPost.getContractMapping(contractID)
    expect(contractStruct.redeemed).to.be.true

}

describe.only("Random Contract Actions", async function () {
    before(async () => {
        const actionList = []

        // Deploy Contracts
        dai = await deployContract("DAI")
        bank = await deployContract("DAIBank", [dai.address])
        createPost = await deployContract("ExecutablePost", [dai.address])



    })

    it("Hey", async () => {
        const redeemList = []
        let totalContracts = 10



        while (redeemList.length > 0 || totalContracts > 0) {
            //console.log(totalContracts);

            let rand = Math.random()
            if ((totalContracts > 0) && (rand < 0.5 || redeemList.length === 0)) {
                //console.log("creating");

                const newContract = await createNewContract(createPost)
                redeemList.push(newContract)
                totalContracts -= 1 
            } else {
                // console.log("redeeming");
                // randomly select contractID to redeem
                element = Math.floor(Math.random() * redeemList.length)
                contractID = redeemList[element]

                await redeemContract(contractID)

                redeemList.splice(element, 1)

            }

            let contractBalance = await getDAIBalances(dai, [createPost.address], true)
            console.log(contractBalance[0].toString());
        }



    })

    it("evm_increae time < 1000")
    it("no need to substract 1 from ending balance")
    it("would be great to have logs and visualize them")
})