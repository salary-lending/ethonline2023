import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@tableland/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  localTableland: {
    silent: false,
    verbose: false,
  },
};

export default config;
