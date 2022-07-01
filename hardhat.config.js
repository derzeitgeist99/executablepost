require("@nomiclabs/hardhat-waffle");
const infuraMumbaiAPI = require("./gitignore/keys.json").keys.infuraMumbaiAPI
const infuraRopstenAPI = require("./gitignore/keys.json").keys.infuraRopstenAPI

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      // forking: {
      //   enabled: true,
      //   url: infuraMumbaiAPI,
      //   blocknumber: 26871016
      // }
    }
  }
};
