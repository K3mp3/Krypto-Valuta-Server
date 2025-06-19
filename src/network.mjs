import PubNub from "pubnub";

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

const logError = (message, error) => {
  console.error(`${message}:`, error);
};

class PubNubNetwork {
  constructor({
    publishKey,
    subscribeKey,
    uuid,
    blockchain,
    transactionPool,
    wallet,
  }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub({
      publishKey,
      subscribeKey,
      uuid,
      heartbeatInterval: 60,
    });

    this.pubnub.addListener({
      message: this.handleMessage.bind(this),
      presence: this.handlePresence.bind(this),
      status: this.handleStatus.bind(this),
    });

    this.subscribeToChannels();
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: Object.values(CHANNELS),
      withPresence: true,
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: {
        type: "TRANSACTION",
        transaction: transaction,
        timestamp: Date.now(),
        nodeId: this.pubnub.getUserId(),
      },
    });
  }

  handleMessage(messageEvent) {
    this.handleBlockchainSync(messageEvent);
    this.handleTransactionBroadcast(messageEvent);
  }

  handleBlockchainSync({ channel, message, publisher }) {
    if (publisher === this.pubnub.getUserId()) {
      return;
    }

    if (channel === CHANNELS.BLOCKCHAIN) {
      console.log(`Blockchain sync from ${publisher}`);
      const replaced = this.blockchain.replaceChain(message.chain);
      if (replaced) {
        console.log("Chain synced and replaced");
        this.transactionPool.clearBlockTransactions({
          chain: this.blockchain.chain,
        });
      }
    }
  }

  handleTransactionBroadcast({ channel, message, publisher }) {
    if (publisher === this.pubnub.getUserId()) {
      return;
    }

    if (channel === CHANNELS.TRANSACTION && message.type === "TRANSACTION") {
      console.log(`Transaction broadcast from ${publisher}`);

      const transaction = message.transaction;
      if (!this.transactionPool.transactionMap[transaction.id]) {
        this.transactionPool.addTransaction(transaction);
        console.log("Transaction added to pool");
      }
    }
  }

  handlePresence({ action, uuid, channel }) {
    console.log(`${uuid} ${action} kanalen ${channel}`);
    if (action === "join" && uuid !== this.pubnub.getUserId()) {
      setTimeout(() => {
        this.syncChain();
        this.syncTransactionPool();
      }, 1000);
    }
  }

  handleStatus({ category }) {
    if (category === "PNConnectedCategory") {
      console.log("Connected to PubNub blockchain-network");
      setTimeout(() => {
        this.syncChain();
      }, 2000);
    }
  }

  syncChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: {
        type: "BLOCKCHAIN_SYNC",
        chain: this.blockchain.chain,
        timestamp: Date.now(),
        nodeId: this.pubnub.getUserId(),
      },
    });
  }

  syncTransactionPool() {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: {
        type: "TRANSACTION_POOL_SYNC",
        transactionMap: this.transactionPool.transactionMap,
        timestamp: Date.now(),
        nodeId: this.pubnub.getUserId(),
      },
    });
  }

  publish({ channel, message }) {
    this.pubnub.publish(
      {
        channel,
        message,
      },
      (status, response) => {
        if (status.error) {
          logError(`Failed to publish to ${channel}`, status.error);
        } else {
          console.log(`Published to ${channel} successfully`);
        }
      }
    );
  }

  disconnect() {
    this.pubnub.unsubscribeAll();
    this.pubnub.destroy();
  }
}

export default PubNubNetwork;
