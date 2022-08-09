const collectModule = require("../../Tutorials/lens-protocol/addresses.json")["free collect module"]
const { defaultAbiCoder } = require('ethers/lib/utils');

const lensPostStruct = {
    "profileId": 1,
    "contentURI": Math.random().toString(),
    "collectModule": collectModule,
    "collectModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
    "referenceModule": '0x0000000000000000000000000000000000000000',
    "referenceModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
}

const lensCommentStruct = {
    "profileId": 1,
    "contentURI": Math.random().toString(),
    "profileIdPointed": 1,
    "pubIdPointed": 1,
    "collectModule": collectModule,
    "collectModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
    "referenceModule": '0x0000000000000000000000000000000000000000',
    "referenceModuleData": defaultAbiCoder.encode(['bool'], [true]),
    "referenceModuleInitData": defaultAbiCoder.encode(['bool'], [true]),
}


const { ethers } = require("hardhat");
const addressBook = require("../externalcontractaddresses.json")

const resolveByOwner = {
    "resolveType": 0,
    "metric": "number of puddles",
    "sourceString": "my window",
    "sourceAddress": "0x8464135c8F25Da09e49BC8782676a84730C318bC",
    "timestamp": 0,
    "valueInt": 3,
    "operator": 1

}

const resolveByOracle = {
    "resolveType": 1,
    "metric": "ETHUSD",
    "sourceString": "",
    "sourceAddress": addressBook.chainlink.mumbai.ETHUSD,
    "timestamp": 1652700000,
    "valueInt": 5000,
    "operator": 1

}


const createPostStruct = (user, partyA, partyB, resolveType = "ResolveByOwner") => {
    let resolveConditions

    switch (resolveType) {
        case "ResolveByOwner":
            resolveConditions = resolveByOwner
            break;
        case "ResolveByOracle":
            resolveConditions = resolveByOracle
            break;
        default:
            resolveConditions = resolveByOwner
            break;
    }

    postStruct = {

        "partyA": partyA.address,
        "partyB": partyB.address,
        "owner": user.address,
        "resolver": user.address,
        "amount": ethers.BigNumber.from(10),
        "currency": addressBook.ERC20.local.DAI,
        "resolveAfter": ethers.BigNumber.from(1000),
        "automaticallyResolveAfter": ethers.BigNumber.from(1200),
        "resolved": false,
        "resolveConditions": resolveConditions,
        "lensPostInfo": {
            "profileId": 0,
            "initialPubId": 0,
            "resolvingPubId": 0
        }
    }

    return postStruct
}

module.exports = { lensPostStruct, lensCommentStruct, createPostStruct }