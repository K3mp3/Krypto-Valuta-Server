import { Router } from "express";
import {
  addBlock,
  getBlockByIndex,
  listAllBlocks,
} from "../controllers/blockchain-controllers.mjs";

const routes = Router();

routes.get("/", listAllBlocks);
routes.get("/:index", getBlockByIndex);
routes.post("/mine", addBlock);

export default routes;
