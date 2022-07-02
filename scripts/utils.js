const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")
const BN = require("bn.js");
const { ethers } = require("hardhat");



const expect = chai.expect
chai.use(chaiAsPromised)

const parseEventValue = (receipt, eventName, print = false) => {
    logs = receipt.events
    result = logs.filter(log => log.event === eventName)
    let parsedResult = []
    result.map((log) => {
        parsedResult.push(log.args[eventName]);
        print ? console.log(`Parsing Event ${eventName}: ${log.args[eventName]}`) : null
    })

    return parsedResult


};

const expectCreateContractToBeRejected = async (sender, createPost, partyA, partyB, resolveAfter, amount, errorMessage) => {
    await expect(createPost.connect(sender).createContract(partyA, partyB, resolveAfter, amount)).to.be.rejectedWith(errorMessage)

}

const expectRedeemContractToBeRejected = async (sender, createPost, partyAResult, partyBResult, contractID, errorMessage) => {
    const receipt = await expect(createPost.connect(sender).resolveByMsgSender(partyAResult, partyBResult, contractID)).to.be.rejectedWith(errorMessage)
    // redeemed status must remain false after revert
    const contractStruct = await createPost.getContractMapping(contractID)
    expect(contractStruct.redeemed).to.be.false
    return receipt

}

const getDAIBalances = async (contract, addresses, BN = false) => {

    let balances = []
    for (let address of addresses) {
        let balance = await contract.balanceOf(address)

        balances.push(BN ? balance : balance.toNumber())

    }
    return balances

}

const generateRandomBN = (max, min) => {
    exponent = Math.floor(Math.random() * (max - min) + min)

    a = Math.floor(Math.random() * (10 ** exponent))
    b = Math.floor(Math.random() * (10 ** exponent))

    return a.toString() + b.toString()

}

const shuffleArray = (array, desiredLength) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let t = array[i]
        array[i] = array[j]
        array[j] = t


    }
    const keepArray = array.slice(0, desiredLength)
    return keepArray
}

const getNamedSigners = async () => {

    const accounts = await ethers.getSigners()

    governance = accounts[1]
    user = accounts[2]
    address3 = accounts[3]
    address4 = accounts[4]
    partyA = accounts[5]
    partyB = accounts[6]


    return { governance, user, address3, address4, partyA, partyB }
}



module.exports = {
    parseEventValue,
    expectCreateContractToBeRejected,
    expectRedeemContractToBeRejected,
    getDAIBalances,
    generateRandomBN,
    shuffleArray,
    getNamedSigners,

}