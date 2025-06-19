import { Router } from "express";
import {
  addTransaction,
  getTransactions,
} from "../controllers/transaction-controllers.mjs";
import { protect } from "../middleware/auth.mjs";

const routes = Router();

routes.use(protect);

routes.post("/addTransaction", addTransaction);
routes.get("/", getTransactions);

export default routes;
