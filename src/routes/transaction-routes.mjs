import { Router } from "express";
import { addTransaction } from "../controllers/transaction-controllers.mjs";

const routes = Router();

routes.post("/addTransaction", addTransaction);

export default routes;
