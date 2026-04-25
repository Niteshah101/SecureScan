import { ScanRequest } from "../types.js";

export function validateScanInput(body: unknown): ScanRequest {
  const data = body as Partial<ScanRequest>;

  if (!data.software || typeof data.software !== "string") {
    throw new Error("Software name is required.");
  }

  if (!data.version || typeof data.version !== "string") {
    throw new Error("Version is required.");
  }

  const software = data.software.trim();
  const version = data.version.trim();

  if (software.length < 2 || software.length > 80) {
    throw new Error("Software name must be between 2 and 80 characters.");
  }

  if (version.length < 1 || version.length > 40) {
    throw new Error("Version must be between 1 and 40 characters.");
  }

  return { software, version };
}
