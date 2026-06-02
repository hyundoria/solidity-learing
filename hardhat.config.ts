import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper"

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  vyper: {
    version: "0.3.0",
  },
  networks: {
    kairos: {
      url:"https://public-en-kairos.node.kaia.io",
      accounts:["0x47236703fe365b19f5c71895958be038a7a3a444032e3e6a9e9185765bdc3a0c"],
    }
  },
  etherscan: {
      apiKey: {
        kairos: "unnecessary",
      },
      customChains: [
        {
          network: "kairos",
          chainId: 1001,
          urls: {
            apiURL: "https://compiler-api-v2.kaiascan.io/kairos/hardhat-verify",
            browserURL: "https://kairos.kaiascan.io",
          }
        },
      ]
    
}
};

export default config;
