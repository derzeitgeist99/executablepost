const chai = require("chai");
const chaiAsPromised = require("chai-as-promised")

const expect = chai.expect
chai.use(chaiAsPromised)

const { ethers } = require("hardhat");


const { getNamedSigners, getDAIBalances } = require("../scripts/utils");
const { deployAllContracts } = require("../scripts/deployContracts");
const { fundAllWithDai } = require("../scripts/fundAllwithDAI");
const addressBook = require("../externalcontractaddresses.json")
const DaiAbi = require("../artifacts/contracts/Mock/mockDAI.sol/DAI.json");
const { lensSetDispatcher, lensGetPostById } = require("../scripts/lensUtils");


// Inputs
const { lensPostStruct, lensCommentStruct, createPostStruct } = require("../scripts/defaultInputStructs");
const { newPost } = require("../scripts/newExecutablePost");
const { defaultAbiCoder, keccak256 } = require("ethers/lib/utils");
let postStruct


let dai
let tx
let receipt
let postId

let postInputStruct


let defaultResolutionInputs = [
    postId,
    BigInt("18446744073709591500"),
    lensCommentStruct,
    { gasLimit: 3 * 1000 * 1000 }
]


describe("Testing resovleByOracle Happy Path", async () => {

    before(async () => {
        ({ hub } = await deployAllContracts());
        ({ governance, user, partyA, partyB } = await getNamedSigners());
        dai = new ethers.Contract(addressBook.ERC20.local.DAI, DaiAbi.abi, governance)
        //setUp disptacher (ie contract that can post on behalf of profile)
        await lensSetDispatcher(hub.address)


    })

    it("Should resolve post by Oracle", async () => {

        //**************************<<<< Create Post >>>>**************************
        postInputStruct = createPostStruct(user, partyA, partyB, resolveType = "ResolveByOracle")
        tx = await dai.connect(user).approve(hub.address, postInputStruct.amount);
        // why this isnot waiting?
        await tx.wait()

        let initialBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);
        ({ postId, postStruct } = await newPost(hub, user, postInputStruct, lensPostStruct))

        initialBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);

        //**************************<<<< Resolve Post >>>>**************************
        let resolutionInputs = [...defaultResolutionInputs]
        resolutionInputs[0] = postId

        tx = await hub.connect(user).resolveByOracle(...resolutionInputs)
        receipt = await tx.wait()

        //*********************** <<<< Testing If Lens Posted >>>> ***********************

        commentId = (ethers.utils.defaultAbiCoder.decode(["uint256"], receipt.events[2].topics[1]))[0]
        expect(parseInt(commentId, 10), "did it Post to Lens").to.be.greaterThan(1)

        //*********************** <<<< Testing Balances >>>> ***********************
        const endingBalances = await getDAIBalances(dai, [partyA.address, partyB.address, hub.address]);
        const expectedEndingBalances = {
            "partyA": initialBalances[0] + parseInt(postStruct.amount, 10),
            "partyB": initialBalances[1],
            "hub": initialBalances[2] - parseInt(postStruct.amount, 10)
        }

        expect(expectedEndingBalances.partyA, "partyA balance").to.equal(endingBalances[0])
        expect(expectedEndingBalances.partyB, "partyB balance").to.equal(endingBalances[1])
        expect(expectedEndingBalances.hub, "hub balance").to.equal(endingBalances[2])

        //*********************** <<<< Testing If Resolved = True >>>> ***********************
        postStruct = await hub.getPostById(postId)
        expect(postStruct.resolved).to.be.true

    })
})

describe("Testing resolveByOracle UnHappy Path", async () => {
  before(async () => {
    ({ hub } = await deployAllContracts());
    ({ governance, user, partyA, partyB } = await getNamedSigners());
    dai = new ethers.Contract(
      addressBook.ERC20.local.DAI,
      DaiAbi.abi,
      governance
    );

    //setUp disptacher (ie contract that can post on behalf of profile)
    await lensSetDispatcher(hub.address);

    //create post
    postInputStruct = createPostStruct(
      user,
      partyA,
      partyB,
      (resolveType = "ResolveByOracle")
    );
    let tx = await dai
      .connect(user)
      .approve(hub.address, postInputStruct.amount);
    receipt = await tx.wait();
    ({ postId, postStruct } = await newPost(
      hub,
      user,
      postInputStruct,
      lensPostStruct
    ));
    defaultResolutionInputs[0] = postId;
  });

  it("Should reject because ExecutablePostNotFound()", async () => {
    let resolutionInputs = [...defaultResolutionInputs];
    resolutionInputs[0] = keccak256(
      defaultAbiCoder.encode(["string"], ["IdontExist"])
    );

    await expect(
      hub.connect(user).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("ExecutablePostNotFound");
  });
  it("Should reject because YouAreNotResolverOfExecutablePost()", async () => {
    let resolutionInputs = [...defaultResolutionInputs];
    await expect(
      hub.connect(partyA).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("YouAreNotResolverOfExecutablePost");
  });

  it("should reject because LensProfile does not exist, throws: TokenDoesNotExist()", async () => {
    //need a deep copy here since I am changing nested level...
    let resolutionInputs = [];
    resolutionInputs.push(
      JSON.parse(JSON.stringify(defaultResolutionInputs[0]))
    );
    resolutionInputs.push(BigInt("18446744073709591500"));
    resolutionInputs.push(
      JSON.parse(JSON.stringify(defaultResolutionInputs[2]))
    );
    resolutionInputs.push(
      JSON.parse(JSON.stringify(defaultResolutionInputs[3]))
    );

    resolutionInputs[2].profileId = 1234;

    await expect(
      hub.connect(user).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("TokenDoesNotExist");
  });
  it("Should reject because CannotUseThisFunctionToResolve()", async () => {
    // here I need to post with different resolveType. Creating deep copy
    let newPostInputStruct = JSON.parse(JSON.stringify(postInputStruct));
    newPostInputStruct.resolveConditions.resolveType = 0;
    tx = await dai
      .connect(user)
      .approve(hub.address, newPostInputStruct.amount);
    await tx.wait();
    ({ postId, postStruct } = await newPost(
      hub,
      user,
      newPostInputStruct,
      lensPostStruct
    ));

    let resolutionInputs = defaultResolutionInputs;
    resolutionInputs[0] = postId;
    await expect(
      hub.connect(user).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("CannotUseThisFunctionToResolve");
  });
  it("Should reject because YouTryToResolveTooEarly()", async () => {
    // here I need to post with different resolveType.
    let newPostInputStruct = { ...postInputStruct };
    newPostInputStruct.resolveAfter = 2 * 1000 * 1000 * 1000;

    tx = await dai
      .connect(user)
      .approve(hub.address, newPostInputStruct.amount);
    await tx.wait();
    ({ postId, postStruct } = await newPost(
      hub,
      user,
      newPostInputStruct,
      lensPostStruct
    ));

    let resolutionInputs = [...defaultResolutionInputs];
    resolutionInputs[0] = postId;
    await expect(
      hub.connect(user).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("YouTryToResolveTooEarly");
  });
  it("Should reject because AlreadyResolved()", async () => {
    let newPostInputStruct = { ...postInputStruct };
    tx = await dai
      .connect(user)
      .approve(hub.address, newPostInputStruct.amount);
    await tx.wait();
    ({ postId, postStruct } = await newPost(
      hub,
      user,
      newPostInputStruct,
      lensPostStruct
    ));

    let resolutionInputs = [...defaultResolutionInputs];
    resolutionInputs[0] = postId;
    tx = await hub.connect(user).resolveByOracle(...resolutionInputs);
    tx.wait();
    await expect(
      hub.connect(user).resolveByOracle(...resolutionInputs)
    ).to.be.rejectedWith("AlreadyResolved");
  });
  it("Should test transfer from and transfer");
});

describe("Testing oracleSpecific unHappyPath cases", async () => {
  it("Should reject because TimestampDeltaGreaterThanTolerance()");
  it("Should reject because OracleError(). Wrong oracle address");
  it("Should reject because OracleError(). Wrong roundId");
});