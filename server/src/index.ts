import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { scanRouter } from "./routes/scanRoutes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    message: {
      error: "Too many requests. Please slow down."
    }
  })
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Sentinel CVE Intelligence API"
  });
});

app.use("/api", scanRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
