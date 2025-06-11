import { readFile, writeFile } from "fs/promises";
import { createHash } from "../utilities/hash.mjs";
import { logError } from "../utilities/logger.mjs";
import Block from "./block.mjs";

export default class Blockchain {
  constructor() {
    this.chain = [Block.createGenesisBlock()];
    this.loadFromFile();
  }

  async loadFromFile() {
    try {
      const data = await readFile("blockchain.json", "utf8");
      const parsedData = JSON.parse(data);
      if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
        this.chain = parsedData;
      }
    } catch (error) {
      await logError("Could not read blockchain.json", error);
      console.log(
        "No existing blockchain file found, starting with genesis block"
      );
    }
  }

  async saveToFile() {
    try {
      await writeFile("blockchain.json", JSON.stringify(this.chain, null, 2));
    } catch (error) {
      await logError("Could not save blockchain.json", error);
      console.error("Error saving blockchain to file:", error);
    }
  }

  addBlock({ data }) {
    const newBlock = Block.mine({
      lastBlock: this.chain.at(-1),
      data,
    });
    this.chain.push(newBlock);
    this.saveToFile();
    return newBlock;
  }

  getBlock(index) {
    return this.chain[index];
  }

  getAllBlocks() {
    return this.chain;
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Incoming chain is not longer. Chain is not replaced");
      return false;
    }
    if (!Blockchain.isValidChain(newChain)) {
      console.log("Incoming chain is invalid. Chain is not replaced");
      return false;
    }
    this.chain = newChain;
    this.saveToFile();
    console.log("Chain replaced with:", newChain);
    return true;
  }

  static isValidChain(chain) {
    if (
      JSON.stringify(chain[0]) !== JSON.stringify(Block.createGenesisBlock())
    ) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, data, hash, prevHash, nonce, difficulty } =
        chain.at(i);
      const lastHash = chain[i - 1].hash;
      if (lastHash !== prevHash) return false;
      const validHash = createHash(
        timestamp,
        data,
        prevHash,
        nonce,
        difficulty
      );
      if (hash !== validHash) return false;
    }
    return true;
  }
}
