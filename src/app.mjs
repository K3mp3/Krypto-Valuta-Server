import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(cors());
app.use(express.json());

export { app };
