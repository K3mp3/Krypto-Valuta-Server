import Miner from "../models/miner/Miner.mjs";
import {
  blockChain,
  pubNubNetwork,
  transactionPool,
  wallet,
} from "../server.mjs";

export const listAllBlocks = (req, res) => {
  const blocks = blockChain.getAllBlocks();
  console.log("=== BLOCKS DEBUG ===");
  console.log("Number of blocks:", blocks.length);
  console.log("Block structure:", blocks[0]);
  console.log("==================");

  res.status(200).json({
    success: true,
    data: blocks,
  });
};

export const addBlock = async (req, res) => {
  const miner = new Miner({
    transactionPool: transactionPool,
    wallet: wallet,
    blockchain: blockChain,
    pubNubNetwork: pubNubNetwork,
  });

  try {
    const newBlock = await miner.mineTransactions();

    if (!newBlock) {
      return res.status(400).json({
        success: false,
        message: "No valid transactions to mine",
      });
    }

    console.log("New block mined:", newBlock);

    res.status(201).json({
      success: true,
      message: "Block mined successfully",
      data: newBlock,
    });
  } catch (error) {
    console.error("Error mining block:", error);
    res.status(500).json({
      success: false,
      message: "Error mining block",
      error: error.message,
    });
  }
};

export const getBlockByIndex = (req, res) => {
  const { index } = req.params;
  const block = blockChain.getBlock(index);

  if (!block)
    return res.status(404).json({
      success: false,
      message: "Block not found",
    });

  res.status(200).json({
    success: true,
    message: "Block found",
    data: block,
  });
};
