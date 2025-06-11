import { blockChain } from "../server.mjs";
import { saveChainToDisk } from "../utilities/save.mjs";

export const listAllBlocks = (req, res) => {
  res.status(200).json({ success: true, data: blockChain });
};

export const addBlock = (req, res) => {
  const { data } = req.body;

  blockChain.addBlock({ data });

  saveChainToDisk(blockChain.chain);

  res
    .status(201)
    .json({ success: true, message: "Block is added", data: blockChain.chain });
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
