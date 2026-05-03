import { genAI } from "./gemini-client";

// Call this AFTER your existing prediction logic runs
export async function assessRiskLevel(
  existingPredictionData: string
): Promise<"Low" | "Medium" | "High"> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on this medical diagnosis data: "${existingPredictionData}", classify the risk/urgency strictly as one of these three words: Low, Medium, or High. No extra text.`;

    const result = await model.generateContent(prompt);
    const risk = result.response.text().trim();

    return (["Low", "Medium", "High"].includes(risk)
      ? risk
      : "Medium") as "Low" | "Medium" | "High";
  } catch {
    return "Medium"; // Safe fallback
  }
}
