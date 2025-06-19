import Transaction from "../models/wallet/Transaction.mjs";
import {
  blockChain,
  pubNubNetwork,
  transactionPool,
  wallet,
} from "../server.mjs";
import { saveChainToDisk } from "../utilities/save.mjs";

export const listAllBlocks = (req, res) => {
  res.status(200).json({
    success: true,
    data: blockChain.getAllBlocks(),
  });
};

export const addBlock = (req, res) => {
  const validTransactions = transactionPool.validateTransactions();

  if (validTransactions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid transactions to mine",
    });
  }

  const rewardTransaction = Transaction.transactionReward({
    miner: wallet,
  });

  transactionPool.addTransaction(rewardTransaction);

  const blockData = [...validTransactions, rewardTransaction];
  const newBlock = blockChain.addBlock({ data: blockData });

  transactionPool.clearBlockTransactions({ chain: blockChain.chain });

  saveChainToDisk(blockChain.chain);
  pubNubNetwork.syncChain();

  res.status(201).json({
    success: true,
    message: "Block mined successfully",
    data: {
      block: newBlock,
      transactionsCount: blockData.length,
      reward: rewardTransaction,
    },
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

export const getMiningStats = (req, res) => {
  const pendingTransactions = Object.keys(
    transactionPool.transactionMap
  ).length;
  const walletBalance = wallet.balance;

  res.status(200).json({
    success: true,
    data: {
      pendingTransactions,
      walletBalance,
      canMine: pendingTransactions > 0,
    },
  });
};
