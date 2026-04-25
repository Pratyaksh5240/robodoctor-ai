import { genAI } from "./gemini-client";

export type RiskLevel = "Low" | "Medium" | "High";

/**
 * Classifies an existing prediction / diagnosis summary into a risk level.
 * This is a pure wrapper – it never modifies existing diagnosis logic.
 */
export async function assessRiskLevel(
  predictionSummary: string
): Promise<RiskLevel> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on this medical diagnosis data: "${predictionSummary}", classify the urgency strictly as one of these three words: Low, Medium, or High. No extra text.`;

    const result = await model.generateContent(prompt);
    const risk = result.response.text().trim();

    if (risk === "Low" || risk === "Medium" || risk === "High") {
      return risk;
    }
    return "Medium";
  } catch {
    return "Medium"; // safe fallback
  }
}
