import { GoogleGenAI } from "@google/genai";

// Initialize API Client
// Note: In a real production build, ensure process.env.API_KEY is set.
// For this demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot perform AI analysis.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a triage nurse assistant. Analyze these symptoms and suggest a triage level (Green, Yellow, Red, Black) with a brief 1-sentence justification and potential ICD-10 codes. Symptoms: ${symptoms}`,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Analysis unavailable currently.";
  }
};

export const summarizeMedicalHistory = async (notes: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following clinical notes into a concise bulleted list for a doctor's quick review. Highlight critical vitals and diagnosis. Notes: ${notes}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Summary unavailable.";
  }
};
