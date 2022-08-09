const { ethers } = require("hardhat");
const oracleABI = require("./oracleABI.json")
const addressBook = require("../../externalcontractaddresses.json")
const { getNamedSigners } = require("../utils")

let oracle
const getPhaseId = (roundId) => {
    return BigInt(roundId) >> 64n
}

const getRoundId = (phaseId, aggregatorRoundId) => {
    return (phaseId << 64n) | aggregatorRoundId
}

const getTimestamp = async (roundId) => {
    const timestamp = await oracle.getTimestamp(roundId)
    return timestamp
}

const intrapolateRoundId = (min, max, targetTimestamp) => {

    // I know 2 roundIds. I need to find a third that is proportionate to corresponding timestamps

    // console.log("Max", Number(max.roundId));
    // console.log("Min", Number(min.roundId));

    // I have 3 timestamps that I know. Min, Max and targetTimesamp. Target is somewhere in the middle
    // Here I define where between min and max this is.
    const targetTimestampIndex = Math.floor((targetTimestamp - min.timestamp) / (max.timestamp - min.timestamp) * 100)

    // Here I apply the targetTimestamp index to the known roundId.

    let midRoundId = BigInt(min.roundId) + ((BigInt(max.roundId) - BigInt(min.roundId)) * BigInt(targetTimestampIndex)) / BigInt(100)


    // console.log("Mid", Number(midRoundId));


    return midRoundId

}

const getNewMinMax = (min, mid, max, tgt) => {
    console.log("origMin", Number(min.roundId));
    console.log("origMid", Number(mid.roundId));
    console.log("origMax", Number(max.roundId));

    if (tgt.timestamp > min.timestamp && tgt.timestamp < mid.timestamp) {
        console.log("MinMid")
        let max = { ...mid }
        console.log("newMid", Number(mid.roundId));
        console.log("newMax", Number(max.roundId));
        max.name = "max"
        return { min, max }
    }

    else if (tgt.timestamp > mid.timestamp && tgt.timestamp < max.timestamp) {
        console.log("MidMax")
        min = { ...mid }
        console.log("newMid", Number(mid.roundId));
        console.log("newMin", Number(min.roundId));
        min.name = "min"
        return { min, max }
    }

}

const myLog = (objs) => {
    // console.log("Timestamp")

    // for (let i = 0; i < objs.length; i++) {
    //     console.log(`---> Variable ${objs[i].name} : ${Number(objs[i].timestamp)}`)
    // }

    console.log(`RoundId`)
    for (let i = 0; i < objs.length; i++) {
        console.log(`---> Variable ${objs[i].name} : ${Number(objs[i].roundId)}`)
    }

}



async function main(targetTimestamp = 1652710000) {
    const namedAccounts = await getNamedSigners();
    oracle = new ethers.Contract(addressBook.chainlink.mumbai.ETHUSD, oracleABI.result, namedAccounts.governance)


    let latestRoundData = await oracle.latestRoundData()
    latestPhaseId = getPhaseId(latestRoundData.roundId)
    // console.log(Number(latestRoundData.updatedAt))
    // console.log(Number(latestRoundData.roundId))

    //  console.log(Number(latestRoundData.roundId))
    // console.log(latestRoundData);

    latestMinusOne = await oracle.getRoundData(BigInt(latestRoundData.roundId) - BigInt("100"))
    //console.log(latestMinusOne);
    // console.log(Number(latestMinusOne.updatedAt))
    // console.log(Number(latestMinusOne.roundId))

    //check if requested timestamp is not in the future

    if (targetTimestamp > latestRoundData.updatedAt) {
        console.log("Timestamp is not available (in the future)")
        return
    }

    // check if requested timestamp is not too old
    const minRoundId = getRoundId(BigInt(1), BigInt(1))
    const minTimestamp = await getTimestamp(minRoundId)
    if (targetTimestamp < minTimestamp) {
        console.log("Timestamp is not available (too early)")
        return
    }

    //check in which phaseId the timestamp sits

    let targetPhaseId
    let previousMinRoundIdTimestamp = latestRoundData.updatedAt

    for (i = latestPhaseId; i > 0; i--) {

        const minRoundId = getRoundId(i, BigInt("1"))
        const minRoundIdTimestamp = await getTimestamp(minRoundId)
        if (targetTimestamp > minRoundIdTimestamp && targetTimestamp < previousMinRoundIdTimestamp) {
            console.log(`Phase ${i} begins with RoundId ${minRoundId} at ${minRoundIdTimestamp}`)
            targetPhaseId = i
            break
        }
        previousMinRoundIdTimestamp = minRoundIdTimestamp
    }

    let min = { "name": "min", "roundId": 0, "timestamp": 0 }
    let max = { "name": "max", "roundId": 0, "timestamp": 0 }
    let mid = { "name": "mid", "roundId": 0, "timestamp": 0 }
    let tgt = { "name": "tgt", "roundId": 0, "timestamp": targetTimestamp }

    min.roundId = getRoundId(targetPhaseId, BigInt(1))
    min.timestamp = await getTimestamp(min.roundId)

    //this works only if target phaseID is currently in use. If the target phaseId is in previous phase, then at one point max.timestamp will equal 0.
    // and everything will break
    // to work around this: we can add a step to find new max, where max.timestamp > tgt.timestamp and carry on. 
    // wont do it now...

    max.roundId = latestRoundData.roundId
    max.timestamp = latestRoundData.updatedAt
    myLog([min, mid, max, tgt])

    for (i = 0; i < 20; i++) {


        console.log("######Round ", i)


        mid.roundId = intrapolateRoundId(min, max, targetTimestamp)
        mid.timestamp = await getTimestamp(mid.roundId)
        myLog([min, mid, max, tgt])
        const delta = Math.abs(mid.timestamp - tgt.timestamp)
        console.log(delta);
        console.log(delta < 60 * 60)
        if (delta < 60 * 60) {
            tgt.roundId = mid.roundId
            console.log("Found the Answer")
            console.log("Target roundId is", tgt.roundId)

            break
        }

        ({ min, max } = getNewMinMax(min, mid, max, tgt))

        myLog([min, mid, max, tgt])

    }


}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
