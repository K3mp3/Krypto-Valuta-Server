import Miner from "../models/miner/Miner.mjs";
import { blockChain, pubNubNetwork, transactionPool, wallet } from "../server.mjs";

export const listAllBlocks = (req, res) => {
  res.status(200).json({
    success: true,
    data: blockChain.getAllBlocks(),
  });
};

export const addBlock = (req, res) => {
  const miner = new Miner({
    transactionPool: transactionPool,
    wallet: wallet,
    blockchain: blockChain,
    pubNubNetwork: pubNubNetwork,
  });

  const newBlock = miner.mineTransactions();

  if (!newBlock) {
    return res.status(400).json({
      success: false,
      message: "No valid transactions to mine",
    });
  }

  res.status(201).json({
    success: true,
    message: "Block mined successfully",
    data: newBlock,
  });
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