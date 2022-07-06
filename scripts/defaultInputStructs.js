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

const { ethers } = require("hardhat");
const addressBook = require("../externalcontractaddresses.json")

const createPostStruct = (user, partyA, partyB) => {
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
        "resolvetype": 0,
        "resolveByOracleConditions": {
            "price": ethers.BigNumber.from(0)
        },
        "resolveByOwnerConditions": {
            "resolver": user.address
        },
        "lensPostInfo": {
            "profileId": 0,
            "initialPubId": 0,
            "resolvingPubId": 0
        }
    }
    return postStruct
}

module.exports = { lensPostStruct, createPostStruct }