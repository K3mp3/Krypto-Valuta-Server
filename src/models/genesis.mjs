import { INITIAL_DIFFICULTY } from "../utilities/config.mjs";

export const GENESIS = {
  timestamp: 1000,
  prevHash: "---",
  hash: "genesis-hash",
  data: [],
  nonce: 0,
  difficulty: INITIAL_DIFFICULTY,
};
