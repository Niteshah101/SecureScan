import { GoogleGenAI, Type } from "@google/genai";

// Initialization - Gemini API key is injected by the platform
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. AI features will be limited.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface CveAnalysis {
  summary: string;
  remediation: string[];
  severityReasoning: string;
}

export async function analyzeCve(cveId: string, description: string): Promise<CveAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze the following CVE vulnerability and provide a summary and remediation techniques.
  CVE ID: ${cveId}
  Description: ${description}
  
  Please provide the response in JSON format with the following keys:
  - summary: A concise, plain-English explanation of the vulnerability.
  - remediation: A list of specific steps or techniques to fix or mitigate this vulnerability.
  - severityReasoning: Why this vulnerability is considered a threat.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            remediation: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            severityReasoning: { type: Type.STRING }
          },
          required: ["summary", "remediation", "severityReasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    
    return JSON.parse(text) as CveAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Could not generate summary at this time.",
      remediation: ["Consult official vendor advisories.", "Ensure software is up to date."],
      severityReasoning: "Unable to analyze severity reasoning."
    };
  }
}
