
const mintProfile = async (lensHub, user, governance) => {



    const handle = "diezeit"
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    let profileID = await lensHub.getProfileIdByHandle(handle)

    if (profileID > 0) {
        console.log("Profile ID already exists");
        return profileID
    }

    const inputStruct = {
        to: user.address,
        handle: handle,
        imageURI: '',
        followModule: ZERO_ADDRESS,
        followModuleInitData: [],
        followNFTURI: '',
    };


    await lensHub.connect(governance).whitelistProfileCreator(user.address, true, { gasLimit: 3000000 })

    await lensHub.connect(user).createProfile(inputStruct, { gasLimit: 3000000 })
    console.log("here3");


    profileID = await lensHub.getProfileIdByHandle(handle)
    console.log(`Profile ID by handle: ${profileID}`);

    return profileID

}

module.exports = { mintProfile }