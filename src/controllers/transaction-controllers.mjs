import { pubNubNetwork, transactionPool, wallet } from "../server.mjs";

export const addTransaction = (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.transactionExists({
    address: wallet.publicKey,
  });

  try {
    if (transaction) transaction.update({ sender: wallet, recipient, amount });
    else transaction = wallet.createTransaction({ recipient, amount });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, statusCode: 400, error: error.message });
  }

  transactionPool.addTransaction(transaction);
  pubNubNetwork.broadcastTransaction(transaction);

  res.status(201).json({ success: true, statusCode: 201, data: transaction });
};
