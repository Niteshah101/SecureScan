import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysis, NvdCve } from "../types.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is missing. Using fallback analysis.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || ""
});

export async function analyzeWithGemini(
  software: string,
  version: string,
  vulnerabilities: NvdCve[]
): Promise<GeminiAnalysis> {
  if (!apiKey) {
    return fallbackAnalysis(software, version, vulnerabilities);
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `
You are a SOC vulnerability analyst.

Analyze this software:
Software: ${software}
Version: ${version}

Here is verified CVE data from NVD:
${JSON.stringify(vulnerabilities, null, 2)}

Rules:
- Do not invent CVEs.
- Only summarize the provided CVEs.
- If no CVEs are provided, give hardening recommendations.
- Keep the wording useful for a SOC analyst.
- Focus on risk, remediation, patching, monitoring, and mitigation.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.STRING
          },
          riskExplanation: {
            type: Type.STRING
          },
          remediationSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          },
          hardeningRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        },
        required: [
          "executiveSummary",
          "riskExplanation",
          "remediationSteps",
          "hardeningRecommendations"
        ]
      }
    }
  });

  const text = response.text;

  if (!text) {
    return fallbackAnalysis(software, version, vulnerabilities);
  }

  return JSON.parse(text) as GeminiAnalysis;
}

function fallbackAnalysis(
  software: string,
  version: string,
  vulnerabilities: NvdCve[]
): GeminiAnalysis {
  if (vulnerabilities.length > 0) {
    return {
      executiveSummary: `${software} ${version} has ${vulnerabilities.length} potential CVE match(es) from NVD.`,
      riskExplanation:
        "Review the CVSS score, affected version range, exploitability, and asset exposure before prioritizing remediation.",
      remediationSteps: [
        "Verify whether the detected version is actually affected.",
        "Upgrade to the latest stable patched version.",
        "Review vendor advisories and NVD references.",
        "Prioritize internet-facing and business-critical assets first."
      ],
      hardeningRecommendations: [
        "Limit unnecessary network exposure.",
        "Enable logging and monitoring.",
        "Apply least privilege.",
        "Maintain an asset and software inventory."
      ]
    };
  }

  return {
    executiveSummary: `No matching CVEs were found for ${software} ${version} in the NVD keyword search.`,
    riskExplanation:
      "No CVE match does not mean the software is risk-free. Continue monitoring advisories and apply secure configuration baselines.",
    remediationSteps: [
      "Confirm the software version is still supported.",
      "Subscribe to vendor security advisories.",
      "Keep the software updated.",
      "Monitor logs for suspicious activity."
    ],
    hardeningRecommendations: [
      "Disable unused modules and services.",
      "Use strong authentication.",
      "Restrict administrative access.",
      "Apply network segmentation."
    ]
  };
}
