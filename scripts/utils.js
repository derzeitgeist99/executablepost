const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")
const BN = require("bn.js");


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


const whiteListViaLens = async (_address) => {
    const fs = require('fs/promises');
    const { exec } = require("child_process");

    const content = JSON.stringify({ address: _address })

    await fs.writeFile("/Users/andy/my_repos/Tutorials/lens-protocol/tasks/myTasks/addressToWhiteList.json", content);

    exec("cd /Users/andy/my_repos/Tutorials/lens-protocol && npx hardhat white-list-profile-creator --network localhost ", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    const waiting = new Promise((resolve, reject) => {

        setTimeout(() => resolve("done"), 5000)
    })

    result = await waiting

    console.log(result);

}

module.exports = {
    parseEventValue,
    expectCreateContractToBeRejected,
    expectRedeemContractToBeRejected,
    getDAIBalances,
    generateRandomBN,
    shuffleArray,
    whiteListViaLens
}