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

const expectCreateContractToBeRejected = async (createPost, partyA, partyB, resolveAfter, amount, message) => {
    await expect(createPost.createContract(partyA, partyB, resolveAfter, amount)).to.be.rejectedWith(message)

}

module.exports = { parseEventValue, expectCreateContractToBeRejected }