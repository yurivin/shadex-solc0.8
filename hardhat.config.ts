import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

// tasks
import "./src/tasks/accounts";

dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1,
      blockGasLimit: 30000000,
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999,
      },
      metadata: {
        bytecodeHash: "none",
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  typechain: {
    outDir: "./src/types",
    target: "ethers-v5",
  },
  paths: {
    tests: "./src/test",
  },
};

export default config;
