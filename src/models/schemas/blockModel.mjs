// models/schemas/blockModel.mjs
import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    prevHash: {
      type: String,
      required: true,
    },
    data: [
      {
        id: String,
        input: {
          timestamp: Number,
          amount: Number,
          address: String,
          signature: mongoose.Schema.Types.Mixed,
        },
        outputMap: mongoose.Schema.Types.Mixed,
      },
    ],
    nonce: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Block", blockSchema);
