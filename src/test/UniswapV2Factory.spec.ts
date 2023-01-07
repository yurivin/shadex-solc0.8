import { expect } from "chai";
import { constants as ethconst, Wallet } from "ethers";
import { UniswapV2Factory } from "../../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { getCreate2Address } from "./shared/utilities";
import { ethers } from "hardhat";

const TEST_ADDRESSES: [string, string] = [
  "0x1000000000000000000000000000000000000000",
  "0x2000000000000000000000000000000000000000",
];

describe("UniswapV2Factory", () => {
  async function fixture() {
    const tmp = await ethers.getContractFactory("UniswapV2Factory");
    const [wallet, other] = await ethers.getSigners();
    const factory = await tmp.deploy(wallet.address);
    return { factory: factory, wallet, other };
  }

  it("feeTo, feeToSetter, allPairsLength", async () => {
    const { factory, wallet } = await loadFixture(fixture);
    expect(await factory.feeTo()).to.eq(ethconst.AddressZero);
    expect(await factory.feeToSetter()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
  });

  async function createPair(
    factory: UniswapV2Factory,
    tokens: [string, string]
  ) {
    const pairContract = await ethers.getContractFactory("UniswapV2Pair");
    const create2Address = getCreate2Address(
      factory.address,
      tokens,
      pairContract.bytecode
    );
    await expect(factory.createPair(tokens[0], tokens[1]))
      .to.emit(factory, "PairCreated")
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, 1);

    await expect(factory.createPair(tokens[0], tokens[1])).to.be.reverted; // UniswapV2: PAIR_EXISTS
    await expect(factory.createPair(tokens[1], tokens[0])).to.be.reverted; // UniswapV2: PAIR_EXISTS
    expect(await factory.getPair(tokens[0], tokens[1])).to.eq(create2Address);
    expect(await factory.getPair(tokens[1], tokens[0])).to.eq(create2Address);
    expect(await factory.allPairs(0)).to.eq(create2Address);
    expect(await factory.allPairsLength()).to.eq(1);

    const pair = pairContract.attach(create2Address);
    expect(await pair.factory()).to.eq(factory.address);
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
  }

/*
TODO: Has to be checked how to rewrite this test with Shadex adjustments
it("Pair:codeHash", async () => {
    const { factory } = await loadFixture(fixture);
    const codehash = await factory.PAIR_HASH();
    // const pair = await ethers.getContractFactory("UniswapV2Pair");
    // expect(ethers.utils.keccak256(pair.bytecode)).to.be.eq(codehash);
    expect(codehash).to.be.eq(
      "0x443533a897cfad2762695078bf6ee9b78b4edcda64ec31e1c83066cee4c90a7e"
    );
  });
*/

  it("createPair", async () => {
    const { factory } = await loadFixture(fixture);
    await createPair(factory, [...TEST_ADDRESSES]);
  });

  it("createPair:reverse", async () => {
    const { factory } = await loadFixture(fixture);
    await createPair(
      factory,
      TEST_ADDRESSES.slice().reverse() as [string, string]
    );
  });

  it("createPair:gas", async () => {
    const { factory } = await loadFixture(fixture);
    const tx = await factory.createPair(...TEST_ADDRESSES);
    const receipt = await tx.wait();
    /* TODO: Check how test GAS with Shadex adjustments
    expect(receipt.gasUsed).to.eq(2355845);
    */
  });

  it("setFeeTo", async () => {
    const { factory, wallet, other } = await loadFixture(fixture);
    await expect(
      factory.connect(other).setFeeTo(other.address)
    ).to.be.revertedWith("UniswapV2: FORBIDDEN");
    await factory.setFeeTo(wallet.address);
    expect(await factory.feeTo()).to.eq(wallet.address);
  });

  it("setFeeToSetter", async () => {
    const { factory, wallet, other } = await loadFixture(fixture);
    await expect(
      factory.connect(other).setFeeToSetter(other.address)
    ).to.be.revertedWith("UniswapV2: FORBIDDEN");
    await factory.setFeeToSetter(other.address);
    expect(await factory.feeToSetter()).to.eq(other.address);
    await expect(factory.setFeeToSetter(wallet.address)).to.be.revertedWith(
      "UniswapV2: FORBIDDEN"
    );
  });
});
