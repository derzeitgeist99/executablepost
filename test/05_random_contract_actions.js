const chai = require("chai");
const { ethers } = require("hardhat");
const { deployContract } = require("../scripts/deployContracts");
const { parseEventValue, expectCreateContractToBeRejected, expectRedeemContractToBeRejected, getDAIBalances } = require("../scripts/utils")

const expect = chai.expect


const createNewContract = async (nextId) => {

    const addresses = await ethers.getSigners()

    rand = Math.floor(Math.random() * (19 - 0) + 0)
    partyA = addresses[rand].address

    rand = Math.floor(Math.random() * (19 - 0) + 0)
    partyB = addresses[rand].address

    value = Math.floor(Math.random() * (10 ** 20 - 1) + 1)

    redeemAfter = Math.floor(Math.random() * (100000 - 1) + 1)
    console.log(redeemAfter);

}


describe.only("Random Contract Actions", async function () {
    before(async () => {
        const actionList = []
        const redeemList = []
    })

    it("Hey", async () => {

        for (i = 0; i < 10; i++) {
            let rand = Math.floor(Math.random() * 100)
            if (rand < 50) {

                const newContract = await createNewContract()
            } else {
                console.log("redeeming");
            }
        }
    })
})