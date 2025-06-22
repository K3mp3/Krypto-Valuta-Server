import TransactionSchema from "../schemas/transactionModel.mjs";
import Transaction from "./Transaction.mjs";

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
    this.loadFromDatabase();
  }

  async loadFromDatabase() {
    try {
      const transactions = await TransactionSchema.find({ status: "pending" });

      for (const txDoc of transactions) {
        this.transactionMap[txDoc.transactionId] = {
          id: txDoc.transactionId,
          input: txDoc.input,
          outputMap: txDoc.outputMap,
        };
      }

      console.log(
        `Loaded ${transactions.length} pending transactions from database`
      );
    } catch (error) {
      console.error("Could not load transactions from database:", error);
    }
  }

  async addTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;

    try {
      await TransactionSchema.findOneAndUpdate(
        { transactionId: transaction.id },
        {
          transactionId: transaction.id,
          input: transaction.input,
          outputMap: transaction.outputMap,
          status: "pending",
        },
        { upsert: true, new: true }
      );
      console.log(`Transaction ${transaction.id} saved to database`);
    } catch (error) {
      console.error("Could not save transaction to database:", error);
    }
  }

  async clearBlockTransactions({ chain }) {
    const transactionsToConfirm = [];

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
          transactionsToConfirm.push({
            transactionId: transaction.id,
            blockIndex: i,
          });
        }
      }
    }

    if (transactionsToConfirm.length > 0) {
      try {
        for (const tx of transactionsToConfirm) {
          await TransactionSchema.findOneAndUpdate(
            { transactionId: tx.transactionId },
            {
              status: "confirmed",
              blockIndex: tx.blockIndex,
            }
          );
        }
        console.log(
          `Confirmed ${transactionsToConfirm.length} transactions in database`
        );
      } catch (error) {
        console.error("Could not update transaction status:", error);
      }
    }
  }

  async clearTransactions() {
    this.transactionMap = {};

    try {
      await TransactionSchema.deleteMany({ status: "pending" });
      console.log("Cleared all pending transactions from database");
    } catch (error) {
      console.error("Could not clear transactions from database:", error);
    }
  }

  async replaceMap(transactionMap) {
    this.transactionMap = transactionMap;

    try {
      await TransactionSchema.deleteMany({ status: "pending" });

      for (const [id, transaction] of Object.entries(transactionMap)) {
        await TransactionSchema.create({
          transactionId: id,
          input: transaction.input,
          outputMap: transaction.outputMap,
          status: "pending",
        });
      }
      console.log(
        `Replaced transaction map with ${
          Object.keys(transactionMap).length
        } transactions`
      );
    } catch (error) {
      console.error("Could not replace transaction map in database:", error);
    }
  }

  transactionExists({ address }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.input.address === address
    );
  }

  validateTransactions() {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transaction.validate(transaction)
    );
  }
}
