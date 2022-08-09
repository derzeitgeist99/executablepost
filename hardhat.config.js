require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({ path: '/Users/andy/Keys/executablePost.env' }).parsed
//const infuraMumbaiAPI = require("./gitignore/keys.json").keys.infuraMumbaiAPI
//const infuraRopstenAPI = require("./gitignore/keys.json").keys.infuraRopstenAPI


module.exports = {


  solidity: {
    compilers: [
      { version: "0.8.10" },
      { version: "0.7.0" }
    ]
  }
  ,
  networks: {
    hardhat: {
      // forking: {
      //   enabled: true,
      //   url: infuraMumbaiAPI,
      //   blocknumber: 26871016
      // }
    },
    polygonMumbai: {
      url: process.env.URL_MUMBAI,
      accounts: [process.env.GOVERNOR_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_APIKEY
    }
  }
};
