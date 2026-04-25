import { PackageInput, ScanResult } from "./types";

const API_BASE_URL = "http://localhost:5000/api";

export async function scanSoftware(
  software: string,
  version: string
): Promise<ScanResult> {
  const response = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ software, version })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Scan failed.");
  }

  return data;
}

export async function batchScan(
  packages: PackageInput[]
): Promise<ScanResult[]> {
  const response = await fetch(`${API_BASE_URL}/batch-scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ packages })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch scan failed.");
  }

  return data.results;
}
