export type Severity = "Critical" | "High" | "Medium" | "Low" | "Unknown";

export interface ScanRequest {
  software: string;
  version: string;
}

export interface BatchScanRequest {
  packages: ScanRequest[];
}

export interface NvdCve {
  id: string;
  description: string;
  severity: Severity;
  cvssScore: number | null;
  published: string;
  lastModified: string;
  references: string[];
}

export interface GeminiAnalysis {
  executiveSummary: string;
  riskExplanation: string;
  remediationSteps: string[];
  hardeningRecommendations: string[];
}

export interface ScanResult {
  software: string;
  version: string;
  vulnerabilities: NvdCve[];
  analysis: GeminiAnalysis;
}
