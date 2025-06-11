import fs from "fs";
import path from "path";

export const saveChainToDisk = (chain, filename = "blockchain.json") => {
  const filePath = path.join("./data", filename);
  fs.writeFileSync(filePath, JSON.stringify(chain, null, 2));
};
