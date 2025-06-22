import Wallet from "../models/wallet/Wallet.mjs";
import {
  blockChain,
  pubNubNetwork,
  transactionPool,
  wallet,
} from "../server.mjs";

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

export const getTransactions = async (req, res) => {
  console.log("=== DEEP TRANSACTION DEBUG ===");
  console.log("Current wallet address:", wallet.publicKey);

  const userTransactions = [];

  console.log("Scanning blockchain with", blockChain.chain.length, "blocks");
  for (let i = 1; i < blockChain.chain.length; i++) {
    const block = blockChain.chain[i];
    console.log(`\n--- Block ${i} ---`);
    console.log("Block data length:", block.data.length);

    for (let j = 0; j < block.data.length; j++) {
      const transaction = block.data[j];
      console.log(`\nTransaction ${j} in block ${i}:`);
      console.log(
        "Full transaction object:",
        JSON.stringify(transaction, null, 2)
      );
      console.log("Transaction ID:", transaction.id);
      console.log("Input address:", transaction.input?.address);
      console.log("Input amount:", transaction.input?.amount);
      console.log("Input timestamp:", transaction.input?.timestamp);
      console.log("OutputMap:", transaction.outputMap);
      console.log("OutputMap keys:", Object.keys(transaction.outputMap || {}));

      // Check if this transaction belongs to our wallet
      const isFromOurWallet = transaction.input?.address === wallet.publicKey;
      const isToOurWallet =
        transaction.outputMap && transaction.outputMap[wallet.publicKey];

      console.log("Is from our wallet:", isFromOurWallet);
      console.log("Is to our wallet:", isToOurWallet);
      console.log(
        "Our wallet gets:",
        transaction.outputMap?.[wallet.publicKey]
      );

      if (isFromOurWallet || isToOurWallet) {
        console.log("✅ MATCH! Adding transaction to user list");
        userTransactions.push({
          id: transaction.id,
          input: transaction.input,
          outputMap: transaction.outputMap,
          blockIndex: i,
          status: "confirmed",
        });
      } else {
        console.log("❌ No match");
      }
    }
  }

  const poolTransactions = Object.values(transactionPool.transactionMap);
  console.log("\n--- Pending Transactions ---");
  console.log("Pool has", poolTransactions.length, "transactions");

  const pendingTransactions = [];
  poolTransactions.forEach((tx, index) => {
    console.log(`\nPending transaction ${index}:`);
    console.log("Transaction:", JSON.stringify(tx, null, 2));

    const isFromOurWallet = tx.input?.address === wallet.publicKey;
    const isToOurWallet = tx.outputMap && tx.outputMap[wallet.publicKey];

    if (isFromOurWallet || isToOurWallet) {
      console.log("✅ PENDING MATCH! Adding to user list");
      pendingTransactions.push({
        id: tx.id,
        input: tx.input,
        outputMap: tx.outputMap,
        status: "pending",
      });
    }
  });

  const allTransactions = [...userTransactions, ...pendingTransactions];

  console.log("\n=== FINAL RESULT ===");
  console.log("Total user transactions found:", allTransactions.length);
  console.log("User transactions:", JSON.stringify(allTransactions, null, 2));
  console.log("========================");

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
