import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.mjs";
import Blockchain from "./models/blockchain.mjs";
import blockchainRoutes from "./routes/blockchain-routes.mjs";
import userRoutes from "./routes/user-routes.mjs";

dotenv.config({ path: "./config/config.env" });

export const blockChain = new Blockchain();

const generateNodeId = () => `node-${Math.random().toString(36).substr(2, 9)}`;
const nodeId = process.env.NODE_ID || generateNodeId();

// export const pubNubNetwork = new PubNubNetwork({
//   publishKey: process.env.PUBNUB_PUBLISH_KEY,
//   subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
//   uuid: nodeId,
// });

const init = async () => {
  try {
    const options = { useNewUrlParser: true, useUnifiedTopology: true };
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("connected to the database!");
  } catch (error) {
    console.error(error);
  }
};

init();

const DEFAULT_PORT = 3000;
let NODE_PORT;

app.use("/api/blocks/", blockchainRoutes);
app.use("/api/user/", userRoutes);

if (process.env.GENERATE_NODE_PORT === "true") {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT} with Node ID: ${nodeId} as ${process.env.NODE_ENV}`
  );

  console.log("Connecting tp PubNub blockchain-network...");
});

// process.on("SIGTERM", () => {
//   console.log("Closing server...");
//   pubNubNetwork.disconnect();
//   process.exit(0);
// });

// process.on("SIGINT", () => {
//   console.log("Closing server...");
//   pubNubNetwork.disconnect();
//   process.exit(0);
// });
