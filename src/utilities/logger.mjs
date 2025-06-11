import { existsSync, mkdirSync } from "fs";
import { appendFile } from "fs/promises";
import path from "path";

const logDir = "logs";
const logPath = path.join(logDir, "error.log");

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

export async function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}${
    error ? ` - ${error.message}` : ""
  }\n`;

  try {
    await appendFile(logPath, fullMessage);
  } catch (err) {
    console.error("Could not write to logfile:", err);
  }
}
