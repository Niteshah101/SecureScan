import { NvdCve, Severity } from "../types.js";

const NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";

function mapSeverity(raw?: string): Severity {
  if (!raw) return "Unknown";

  const value = raw.toLowerCase();

  if (value === "critical") return "Critical";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";

  return "Unknown";
}

function extractCvss(cve: any): { severity: Severity; score: number | null } {
  const metrics = cve.metrics;

  const cvss =
    metrics?.cvssMetricV31?.[0] ||
    metrics?.cvssMetricV30?.[0] ||
    metrics?.cvssMetricV2?.[0];

  return {
    severity: mapSeverity(cvss?.cvssData?.baseSeverity || cvss?.baseSeverity),
    score: cvss?.cvssData?.baseScore ?? null
  };
}

export async function searchNvdCves(
  software: string,
  version: string
): Promise<NvdCve[]> {
  const keyword = `${software} ${version}`;

  const url = new URL(NVD_BASE_URL);
  url.searchParams.set("keywordSearch", keyword);
  url.searchParams.set("resultsPerPage", "20");

  const headers: Record<string, string> = {
    "User-Agent": "Sentinel-CVE-Intelligence/1.0"
  };

  if (process.env.NVD_API_KEY) {
    headers.apiKey = process.env.NVD_API_KEY;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`NVD API failed with status ${response.status}`);
  }

  const data = await response.json();

  const vulnerabilities = data.vulnerabilities || [];

  return vulnerabilities.map((item: any): NvdCve => {
    const cve = item.cve;
    const { severity, score } = extractCvss(cve);

    return {
      id: cve.id,
      description:
        cve.descriptions?.find((d: any) => d.lang === "en")?.value ||
        "No description available.",
      severity,
      cvssScore: score,
      published: cve.published,
      lastModified: cve.lastModified,
      references:
        cve.references?.referenceData?.map((ref: any) => ref.url) ||
        cve.references?.map((ref: any) => ref.url) ||
        []
    };
  });
}
