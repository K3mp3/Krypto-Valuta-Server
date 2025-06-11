import { MINE_RATE } from "../utilities/config.mjs";
import { createHash } from "../utilities/hash.mjs";
import { GENESIS } from "./genesis.mjs";

export default class Block {
  constructor({ timestamp, hash, prevHash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.hash = hash;
    this.prevHash = prevHash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static createGenesisBlock() {
    return new Block(GENESIS);
  }

  static mine({ lastBlock, data }) {
    const prevHash = lastBlock.hash;
    let nonce = 0;
    let timestamp;
    let difficulty = lastBlock.difficulty;
    let hash;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        previousBlock: lastBlock,
        timestamp,
      });
      hash = createHash(timestamp, prevHash, data, nonce, difficulty);
    } while (!hash.startsWith("0".repeat(difficulty)));

    return new Block({ timestamp, hash, prevHash, data, nonce, difficulty });
  }

  static adjustDifficulty({ previousBlock, timestamp }) {
    const { difficulty } = previousBlock;
    if (difficulty < 1) return 1;

    return timestamp - previousBlock.timestamp > MINE_RATE
      ? difficulty - 1
      : difficulty + 1;
  }
}
