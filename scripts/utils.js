const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

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
    return receipt

}

module.exports = {
    parseEventValue,
    expectCreateContractToBeRejected,
    expectRedeemContractToBeRejected
}