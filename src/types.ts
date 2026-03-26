import { Type } from "@google/genai";

export interface LegalRisk {
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  recommendation: string;
  citation: string;
}

export interface LegalAnalysisResult {
  summary: string;
  risks: LegalRisk[];
}

export const LEGAL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A high-level executive summary of the document.",
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the risk or finding." },
          severity: { 
            type: Type.STRING, 
            enum: ["Low", "Medium", "High", "Critical"],
            description: "The severity level of the risk." 
          },
          description: { type: Type.STRING, description: "Detailed description of the risk." },
          recommendation: { type: Type.STRING, description: "Actionable recommendation to mitigate the risk." },
          citation: { type: Type.STRING, description: "Direct quote or section reference from the document." },
        },
        required: ["title", "severity", "description", "recommendation", "citation"],
      },
    },
  },
  required: ["summary", "risks"],
};
