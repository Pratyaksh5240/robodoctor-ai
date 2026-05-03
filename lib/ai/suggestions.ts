import { genAI } from "./gemini-client";

type Suggestions = {
  diet: string[];
  precautions: string[];
  next_steps: string[];
};

// Call this to generate personalized advice without touching core logic
export async function generateSuggestions(symptoms: string): Promise<Suggestions> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `A user has these symptoms/results: "${symptoms}". Provide a JSON response with exactly these keys: "diet", "precautions", "next_steps". Keep each value a brief array of string suggestions.`;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "");

    return JSON.parse(text) as Suggestions;
  } catch {
    return { diet: [], precautions: [], next_steps: [] };
  }
}
