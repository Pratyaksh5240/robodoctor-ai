/**
 * POST /api/gemini-suggestions
 * Personalized health suggestions powered by Google Gemini.
 *
 * Body shape:
 *   {
 *     condition: string,
 *     age?: number,
 *     weight?: number,
 *     height?: number,
 *     activityLevel?: string,
 *     language?: string
 *   }
 *
 * Response shape:
 *   {
 *     suggestions: { diet, precautions, nextSteps, lifestyle, disclaimer },
 *     source: "gemini"|"fallback"
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/geminiService";

type SuggestionsPayload = {
  condition: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  activityLevel?: string;
  language?: string;
};

type Suggestions = {
  diet: string[];
  precautions: string[];
  nextSteps: string[];
  lifestyle: string[];
  disclaimer: string;
};

function fallbackSuggestions(language: string): Suggestions {
  const isHindi = language === "hi";
  return {
    diet: isHindi
      ? ["संतुलित आहार लें।", "नमक और चीनी कम करें।"]
      : ["Eat a balanced diet.", "Reduce salt and sugar intake."],
    precautions: isHindi
      ? ["डॉक्टर की सलाह के बिना दवाएं बंद न करें।"]
      : ["Do not stop medications without consulting your doctor."],
    nextSteps: isHindi
      ? ["एक डॉक्टर से परामर्श करें।"]
      : ["Consult a doctor for personalized advice."],
    lifestyle: isHindi
      ? ["नियमित व्यायाम करें।", "पर्याप्त नींद लें।"]
      : ["Exercise regularly.", "Get adequate sleep."],
    disclaimer: isHindi
      ? "ये सुझाव चिकित्सीय सलाह का विकल्प नहीं हैं।"
      : "These suggestions are not a substitute for professional medical advice.",
  };
}

function buildSuggestionsPrompt(payload: SuggestionsPayload): string {
  const { condition, age, weight, height, activityLevel, language } = payload;
  const isHindi = language === "hi";
  const languageInstruction = isHindi
    ? "Please respond in Hindi (Devanagari script)."
    : "Please respond in English.";

  const profile = [
    age ? `Age: ${age} years` : null,
    weight ? `Weight: ${weight} kg` : null,
    height ? `Height: ${height} cm` : null,
    activityLevel ? `Activity Level: ${activityLevel}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return `You are a health educator AI providing personalized wellness guidance.
${languageInstruction}

For a person with the following profile:
Condition / concern: ${condition}
${profile ? `Profile: ${profile}` : ""}

Provide practical, evidence-based suggestions. Return ONLY valid JSON:
{
  "diet": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "precautions": ["precaution 1", "precaution 2"],
  "nextSteps": ["step 1", "step 2"],
  "lifestyle": ["tip 1", "tip 2"],
  "disclaimer": "include a disclaimer that this is not medical advice"
}

Keep each item concise (one sentence). Provide 3-5 items per category.`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SuggestionsPayload;
    const language = payload.language ?? "en";

    if (!payload.condition?.trim()) {
      return NextResponse.json(
        { error: "Please provide a health condition or concern." },
        { status: 400 }
      );
    }

    const prompt = buildSuggestionsPrompt(payload);
    const result = await askGemini(prompt);

    if (result.error || !result.text) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(language),
        source: "fallback",
      });
    }

    try {
      const jsonText = result.text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed = JSON.parse(jsonText) as Suggestions;
      return NextResponse.json({ suggestions: parsed, source: "gemini" });
    } catch {
      return NextResponse.json({
        suggestions: fallbackSuggestions(language),
        source: "fallback",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestions." },
      { status: 500 }
    );
  }
}
