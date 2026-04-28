import { genAI } from "./gemini-client";

export type Suggestions = {
  diet: string[];
  precautions: string[];
  next_steps: string[];
};

/**
 * Generates personalised health suggestions (diet, precautions, next steps)
 * based on the supplied symptoms or diagnosis text.
 * This is a standalone module and does not touch existing diagnosis logic.
 */
export async function generateSuggestions(
  symptomsOrDiagnosis: string
): Promise<Suggestions> {
  const empty: Suggestions = { diet: [], precautions: [], next_steps: [] };
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `A user has these symptoms or diagnosis results: "${symptomsOrDiagnosis}".
Provide a JSON response with exactly these keys: "diet", "precautions", "next_steps".
Each key must map to an array of concise string suggestions (3–5 items each).
Return only valid JSON, no markdown fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text) as Suggestions;
  } catch {
    return empty;
  }
}
