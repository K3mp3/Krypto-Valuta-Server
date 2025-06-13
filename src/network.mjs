import PubNub from "pubnub";

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
};

class PubNubNetwork {
  constructor({ publishKey, subscribeKey, uuid }) {
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

  handleBlockchainSync({ channel, message, publisher }) {
    if (publisher === this.pubnub.getUserId()) {
      return;
    }

    if (channel === CHANNELS.BLOCKCHAIN) {
      console.log(`Blockchain sync from ${publisher}`);
      const replaced = blockchain.replaceChain(message.chain);

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
          chain: blockchain.chain,
          timestamp: Date.now(),
          nodeId: this.pubnub.getUserId(),
        },
      },
      (status, response) => {
        if (status.error) logError("Failed to sync chain", status.error);
        else console.log("Chain synced with network");
      }
    );
  }

  disconnect() {
    this.pubnub.unsubscribeAll();
    this.pubnub.destroy();
  }
}

export default PubNubNetwork;
