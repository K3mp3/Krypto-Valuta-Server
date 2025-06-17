import { blockChain, pubNubNetwork } from "../server.mjs";
import { saveChainToDisk } from "../utilities/save.mjs";

export const listAllBlocks = (req, res) => {
  res.status(200).json({ success: true, data: blockChain });
};

export const addBlock = (req, res) => {
  const { data } = req.body;

  const newBlock = blockChain.addBlock({ data });

  saveChainToDisk(blockChain.chain);

  pubNubNetwork.syncChain();

  res.status(201).json({
    success: true,
    message: "Block added and synced with network",
    data: newBlock,
  });
};

export const getBlockByIndex = (req, res) => {
  const { index } = req.params;
  const block = blockChain.chain[index];

  if (!block)
    return res.status(404).json({
      success: false,
      message: "Block not found",
    });

  res.status(200).json({ success: true, message: "Block found", data: block });
};

// export const syncWithNetwork = (req, res) => {
//   pubNubNetwork.syncChain();
//   res.status(200).json({
//     success: true,
//     message: "Chain synced with network",
//   });
// };

// export const getNetworkStatus = (req, res) => {
//   res.status(200).json({
//     success: true,
//     data: {
//       nodeId: pubNubNetwork.pubnub.getUserId(),
//       chainLength: blockChain.chain.length,
//       latestBlock: blockChain.chain[blockChain.chain.length - 1],
//     },
//   });
// };
