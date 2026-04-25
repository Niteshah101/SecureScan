import express from "express";
import { validateScanInput } from "../utils/validate.js";
import { searchNvdCves } from "../services/nvdService.js";
import { analyzeWithGemini } from "../services/geminiService.js";
import { BatchScanRequest, ScanResult } from "../types.js";

export const scanRouter = express.Router();

scanRouter.post("/scan", async (req, res) => {
  try {
    const { software, version } = validateScanInput(req.body);

    const vulnerabilities = await searchNvdCves(software, version);
    const analysis = await analyzeWithGemini(software, version, vulnerabilities);

    const result: ScanResult = {
      software,
      version,
      vulnerabilities,
      analysis
    };

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown scan error"
    });
  }
});

scanRouter.post("/batch-scan", async (req, res) => {
  try {
    const body = req.body as BatchScanRequest;

    if (!Array.isArray(body.packages)) {
      return res.status(400).json({
        error: "Request must include packages array."
      });
    }

    const packages = body.packages.slice(0, 25);

    const results: ScanResult[] = [];

    for (const pkg of packages) {
      const { software, version } = validateScanInput(pkg);
      const vulnerabilities = await searchNvdCves(software, version);
      const analysis = await analyzeWithGemini(
        software,
        version,
        vulnerabilities
      );

      results.push({
        software,
        version,
        vulnerabilities,
        analysis
      });
    }

    res.json({ results });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown batch scan error"
    });
  }
});
