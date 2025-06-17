import PubNub from "pubnub";

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
};

// Helper function for logging errors
const logError = (message, error) => {
  console.error(`${message}:`, error);
};

class PubNubNetwork {
  constructor({ publishKey, subscribeKey, uuid, blockchain }) {
    this.blockchain = blockchain; // Store blockchain instance
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
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }

  handleMessage(messageEvent) {
    this.handleBlockchainSync(messageEvent);
  }

  handleBlockchainSync({ channel, message, publisher }) {
    if (publisher === this.pubnub.getUserId()) {
      return;
    }

    if (channel === CHANNELS.BLOCKCHAIN) {
      console.log(`Blockchain sync from ${publisher}`);
      const replaced = this.blockchain.replaceChain(message.chain);
      if (replaced) console.log("Chain synced");
    }
  }

  handlePresence({ action, uuid, channel }) {
    console.log(`${uuid} ${action} kanalen`);
    if (action === "join" && uuid !== this.pubnub.getUserId()) {
      setTimeout(() => {
        this.syncChain();
      }, 1000);
    }
  }

  handleStatus({ category }) {
    if (category === "PNConnectedCategory") {
      console.log("Connected to PubNub blockchain-network");
    }
  }

  syncChain() {
    this.pubnub.publish(
      {
        channel: CHANNELS.BLOCKCHAIN,
        message: {
          chain: this.blockchain.chain,
          timestamp: Date.now(),
          nodeId: this.pubnub.getUserId(),
        },
      },
      (status, response) => {
        if (status.error) {
          logError("Failed to sync chain", status.error);
        } else {
          console.log("Chain synced with network");
        }
      }
    );
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }

  disconnect() {
    this.pubnub.unsubscribeAll();
    this.pubnub.destroy();
  }
}

export default PubNubNetwork;
