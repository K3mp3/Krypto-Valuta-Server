import { blockChain, pubNubNetwork, transactionPool, wallet } from "../server.mjs";
import Wallet from "../models/wallet/Wallet.mjs";

export const addTransaction = (req, res) => {
  const { amount, recipient } = req.body;
  
  let transaction = transactionPool.transactionExists({
    address: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockChain.chain,
      });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, statusCode: 400, error: error.message });
  }

  transactionPool.addTransaction(transaction);
  pubNubNetwork.broadcastTransaction(transaction);

  res.status(201).json({ success: true, statusCode: 201, data: transaction });
};

export const getWalletInfo = (req, res) => {
  const address = wallet.publicKey;
  const balance = Wallet.calculateBalance({
    chain: blockChain.chain,
    address: address,
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: { address: address, balance: balance },
  });
};

export const getTransactions = (req, res) => {
  const userTransactions = [];

  for (let i = 1; i < blockChain.chain.length; i++) {
    const block = blockChain.chain[i];
    for (let transaction of block.data) {
      if (
        transaction.input.address === wallet.publicKey ||
        transaction.outputMap[wallet.publicKey]
      ) {
        userTransactions.push({
          ...transaction,
          blockIndex: i,
          status: "confirmed",
        });
      }
    }
  }

  const pendingTransactions = Object.values(transactionPool.transactionMap)
    .filter(
      (tx) =>
        tx.input.address === wallet.publicKey || tx.outputMap[wallet.publicKey]
    )
    .map((tx) => ({ ...tx, status: "pending" }));

  const allTransactions = [...userTransactions, ...pendingTransactions];

  res.status(200).json({
    success: true,
    data: allTransactions,
  });
};

export const listAllTransactions = (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: transactionPool.transactionMap,
  });
};