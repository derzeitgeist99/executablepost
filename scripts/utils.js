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

module.exports = { parseEventValue }