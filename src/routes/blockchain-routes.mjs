import { Router } from "express";
import {
  addBlock,
  getBlockByIndex,
  listAllBlocks,
} from "../controllers/blockchain-controllers.mjs";
import { protect } from "../middleware/auth.mjs";

const routes = Router();

routes.use(protect);

routes.get("/", listAllBlocks);
routes.get("/:index", getBlockByIndex);
routes.post("/mine", addBlock);

export default routes;
