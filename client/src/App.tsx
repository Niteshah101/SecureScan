import { useState } from "react";
import {
  Shield,
  Search,
  Upload,
  AlertTriangle,
  CheckCircle,
  Server
} from "lucide-react";
import { motion } from "motion/react";
import { batchScan, scanSoftware } from "./api";
import { PackageInput, ScanResult, Severity } from "./types";

function severityClass(severity: Severity): string {
  switch (severity) {
    case "Critical":
      return "sev critical";
    case "High":
      return "sev high";
    case "Medium":
      return "sev medium";
    case "Low":
      return "sev low";
    default:
      return "sev unknown";
  }
}

function riskStatus(results: ScanResult[]): string {
  const all = results.flatMap((r) => r.vulnerabilities);

  if (all.some((v) => v.severity === "Critical")) return "Critical Exposure";
  if (all.some((v) => v.severity === "High")) return "High Risk";
  if (all.length > 0) return "Moderate Risk";

  return "Clean Report";
}

export default function App() {
  const [software, setSoftware] = useState("");
  const [version, setVersion] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSingleScan(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const result = await scanSoftware(software, version);
      setResults([result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let packages: PackageInput[] = [];

      if (Array.isArray(parsed)) {
        packages = parsed;
      } else if (Array.isArray(parsed.packages)) {
        packages = parsed.packages;
      } else {
        throw new Error("JSON must be an array or contain a packages array.");
      }

      const cleanPackages = packages.map((pkg) => ({
        software: String(pkg.software || pkg.name || "").trim(),
        version: String(pkg.version || "").trim()
      }));

      const result = await batchScan(cleanPackages);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON file.");
    } finally {
      setLoading(false);
    }
  }

  const totalCves = results.reduce(
    (sum, r) => sum + r.vulnerabilities.length,
    0
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Shield size={28} />
          <div>
            <h1>Sentinel</h1>
            <p>CVE Intelligence</p>
          </div>
        </div>

        <form onSubmit={handleSingleScan} className="scan-card">
          <label>Software Name</label>
          <input
            value={software}
            onChange={(e) => setSoftware(e.target.value)}
            placeholder="Example: nginx"
          />

          <label>Version</label>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Example: 1.18.0"
          />

          <button disabled={loading}>
            <Search size={16} />
            {loading ? "Scanning..." : "Scan Software"}
          </button>
        </form>

        <div className="upload-card">
          <label htmlFor="json-upload">
            <Upload size={16} />
            Upload JSON / SBOM
          </label>
          <input
            id="json-upload"
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
          />
          <p>
            Format: <code>{'[{ "software": "nginx", "version": "1.18.0" }]'}</code>
          </p>
        </div>
      </aside>

      <section className="content">
        <div className="topbar">
          <div>
            <p className="eyebrow">SOC Vulnerability Research Dashboard</p>
            <h2>{results.length ? riskStatus(results) : "Awaiting Scan"}</h2>
          </div>

          <div className="metrics">
            <div>
              <span>{results.length}</span>
              <p>Assets</p>
            </div>
            <div>
              <span>{totalCves}</span>
              <p>CVEs</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-box">
            <Server size={20} />
            Querying NVD and generating Gemini analyst summary...
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="empty-state">
            <Shield size={48} />
            <h3>No scan launched yet</h3>
            <p>Enter software/version or upload a JSON package list.</p>
          </div>
        )}

        <div className="results-grid">
          {results.map((result, index) => (
            <motion.div
              className="result-card"
              key={`${result.software}-${result.version}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="result-header">
                <div>
                  <h3>{result.software}</h3>
                  <p>Version: {result.version}</p>
                </div>

                {result.vulnerabilities.length === 0 ? (
                  <span className="clean">
                    <CheckCircle size={14} />
                    Clean
                  </span>
                ) : (
                  <span className="dirty">
                    <AlertTriangle size={14} />
                    {result.vulnerabilities.length} CVE(s)
                  </span>
                )}
              </div>

              <div className="analysis-box">
                <h4>AI Analyst Summary</h4>
                <p>{result.analysis.executiveSummary}</p>
                <p>{result.analysis.riskExplanation}</p>
              </div>

              {result.vulnerabilities.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>CVE</th>
                        <th>Severity</th>
                        <th>CVSS</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.vulnerabilities.map((vuln) => (
                        <tr key={vuln.id}>
                          <td>{vuln.id}</td>
                          <td>
                            <span className={severityClass(vuln.severity)}>
                              {vuln.severity}
                            </span>
                          </td>
                          <td>{vuln.cvssScore ?? "N/A"}</td>
                          <td>{vuln.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="recommendations">
                <h4>Remediation Steps</h4>
                <ul>
                  {result.analysis.remediationSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>

                <h4>Hardening Recommendations</h4>
                <ul>
                  {result.analysis.hardeningRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
