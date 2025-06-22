// blockchain.mjs - FIXAD VERSION utan onödig fil-skrivning
import { createHash } from "../../utilities/hash.mjs";
import { logError } from "../../utilities/logger.mjs";
import BlockModel from "../schemas/blockModel.mjs";
import Block from "./block.mjs";

export default class Blockchain {
  constructor() {
    this.chain = [Block.createGenesisBlock()];
    this.loadFromDatabase();
  }

  async loadFromDatabase() {
    try {
      const blocks = await BlockModel.find().sort({ index: 1 });

      if (blocks && blocks.length > 0) {
        this.chain = blocks.map((blockDoc) => {
          return new Block({
            timestamp: blockDoc.timestamp,
            hash: blockDoc.hash,
            prevHash: blockDoc.prevHash,
            data: blockDoc.data,
            nonce: blockDoc.nonce,
            difficulty: blockDoc.difficulty,
          });
        });
        console.log(`Loaded ${blocks.length} blocks from database`);
      } else {
        await this.saveGenesisBlock();
      }
    } catch (error) {
      await logError("Could not load blockchain from database", error);
      console.log(
        "No existing blockchain in database, starting with genesis block"
      );
      await this.saveGenesisBlock();
    }
  }

  async saveGenesisBlock() {
    try {
      const genesisBlock = this.chain[0];
      await BlockModel.create({
        index: 0,
        timestamp: genesisBlock.timestamp,
        hash: genesisBlock.hash,
        prevHash: genesisBlock.prevHash,
        data: genesisBlock.data,
        nonce: genesisBlock.nonce,
        difficulty: genesisBlock.difficulty,
      });
      console.log("Genesis block saved to database");
    } catch (error) {
      if (error.code !== 11000) {
        await logError("Could not save genesis block", error);
      }
    }
  }

  async saveBlockToDatabase(block, index) {
    try {
      await BlockModel.create({
        index: index,
        timestamp: block.timestamp,
        hash: block.hash,
        prevHash: block.prevHash,
        data: block.data,
        nonce: block.nonce,
        difficulty: block.difficulty,
      });
      console.log(`Block ${index} saved to database`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Block ${index} already exists in database`);
      } else {
        await logError(`Could not save block ${index} to database`, error);
        throw error;
      }
    }
  }

  addBlock({ data }) {
    const newBlock = Block.mine({
      lastBlock: this.chain.at(-1),
      data,
    });

    this.chain.push(newBlock);

    const blockIndex = this.chain.length - 1;
    this.saveBlockToDatabase(newBlock, blockIndex);

    return newBlock;
  }

  getBlock(index) {
    return this.chain[index];
  }

  getAllBlocks() {
    return this.chain;
  }

  async replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Incoming chain is not longer. Chain is not replaced");
      return false;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.log("Incoming chain is invalid. Chain is not replaced");
      return false;
    }

    this.chain = newChain;

    await this.syncDatabaseWithChain();

    console.log("Chain replaced with:", newChain);
    return true;
  }

  async syncDatabaseWithChain() {
    try {
      await BlockModel.deleteMany({});

      for (let i = 0; i < this.chain.length; i++) {
        const block = this.chain[i];
        await BlockModel.create({
          index: i,
          timestamp: block.timestamp,
          hash: block.hash,
          prevHash: block.prevHash,
          data: block.data,
          nonce: block.nonce,
          difficulty: block.difficulty,
        });
      }
      console.log("Database synchronized with new chain");
    } catch (error) {
      await logError("Could not sync database with chain", error);
    }
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
