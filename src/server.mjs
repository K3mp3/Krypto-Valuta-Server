import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.mjs";
import Blockchain from "./models/blockchain/blockchain.mjs";
import TransactionPool from "./models/wallet/TransactionPool.mjs";
import Wallet from "./models/wallet/Wallet.mjs";
import PubNubNetwork from "./network.mjs";
import blockchainRoutes from "./routes/blockchain-routes.mjs";
import transactionRoutes from "./routes/transaction-routes.mjs";
import userRoutes from "./routes/user-routes.mjs";

dotenv.config({ path: "./config/config.env" });

export const blockChain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();

const generateNodeId = () => `node-${Math.random().toString(36).substr(2, 9)}`;
const nodeId = process.env.NODE_ID || generateNodeId();

export const pubNubNetwork = new PubNubNetwork({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  uuid: nodeId,
  blockchain: blockChain,
  transactionPool,
  wallet,
});

const init = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

init();

const DEFAULT_PORT = 3000;
let NODE_PORT;

app.use("/api/blocks/", blockchainRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/transaction/", transactionRoutes);

if (process.env.GENERATE_NODE_PORT === "true") {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT} with Node ID: ${nodeId} as ${process.env.NODE_ENV}`
  );
  console.log("Connecting to PubNub blockchain-network...");
});

process.on("SIGTERM", () => {
  console.log("Closing server...");
  pubNubNetwork.disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Closing server...");
  pubNubNetwork.disconnect();
  process.exit(0);
});
