import Transaction from "../wallet/Transaction.mjs";

export default class Miner {
  constructor({ transactionPool, wallet, blockchain, pubNubNetwork }) {
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockchain = blockchain;
    this.pubNubNetwork = pubNubNetwork;
  }

  mineTransactions() {
    const validTransactions = this.transactionPool.validateTransactions();

    if (validTransactions.length === 0) {
      console.log("No valid transactions to mine");
      return false;
    }

    const rewardTransaction = Transaction.transactionReward({
      miner: this.wallet,
    });

    this.transactionPool.addTransaction(rewardTransaction);

    const blockData = [...validTransactions, rewardTransaction];
    const newBlock = this.blockchain.addBlock({ data: blockData });

    this.transactionPool.clearBlockTransactions({ chain: this.blockchain.chain });

    this.pubNubNetwork.syncChain();

    console.log("Block mined successfully");
    return newBlock;
  }
}