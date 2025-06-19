import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    input: {
      timestamp: Number,
      amount: Number,
      address: String,
      signature: mongoose.Schema.Types.Mixed,
    },
    outputMap: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    blockIndex: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", TransactionSchema);
