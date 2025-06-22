import { Router } from "express";
import {
  addTransaction,
  getTransactions,
  getWalletInfo,
  listAllTransactions,
} from "../controllers/transaction-controllers.mjs";
import { protect } from "../middleware/auth.mjs";
import TransactionModel from "../models/schemas/transactionModel.mjs";

const routes = Router();

routes.use(protect);

routes.post("/addTransaction", addTransaction);
routes.get("/", getTransactions);
routes.get("/wallet", getWalletInfo);
routes.get("/all", listAllTransactions);

routes.get("/debug", async (req, res) => {
  try {
    const allTransactions = await TransactionModel.find({}).sort({
      createdAt: -1,
    });
    const pendingCount = await TransactionModel.countDocuments({
      status: "pending",
    });
    const confirmedCount = await TransactionModel.countDocuments({
      status: "confirmed",
    });

    res.json({
      success: true,
      data: {
        totalTransactions: allTransactions.length,
        pendingCount,
        confirmedCount,
        transactions: allTransactions.map((tx) => ({
          id: tx.transactionId,
          input: tx.input,
          outputMap: tx.outputMap,
          status: tx.status,
          blockIndex: tx.blockIndex,
          createdAt: tx.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default routes;
