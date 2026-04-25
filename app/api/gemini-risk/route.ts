/**
 * POST /api/gemini-risk
 * Risk & Urgency Detection endpoint powered by Google Gemini.
 *
 * Body shape:
 *   {
 *     symptoms: string,
 *     systolic?: number, diastolic?: number,
 *     sugar?: number, heartRate?: number,
 *     age?: number, language?: string
 *   }
 *
 * Response shape:
 *   {
 *     risk: { level: "Low"|"Medium"|"High"|"Emergency", score: number,
 *             reasoning: string, urgentFlags: string[], nextSteps: string[] },
 *     source: "gemini"|"fallback"
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/geminiService";

type RiskPayload = {
  symptoms: string;
  systolic?: number | null;
  diastolic?: number | null;
  sugar?: number | null;
  heartRate?: number | null;
  age?: number | null;
  language?: string;
};

type RiskResult = {
  level: "Low" | "Medium" | "High" | "Emergency";
  score: number;
  reasoning: string;
  urgentFlags: string[];
  nextSteps: string[];
};

function fallbackRisk(language: string): RiskResult {
  const isHindi = language === "hi";
  return {
    level: "Low",
    score: 0,
    reasoning: isHindi
      ? "AI जोखिम मूल्यांकन अभी उपलब्ध नहीं है।"
      : "AI risk assessment is currently unavailable.",
    urgentFlags: [],
    nextSteps: isHindi
      ? ["एक डॉक्टर से परामर्श करें।"]
      : ["Please consult a doctor for a proper evaluation."],
  };
}

function buildRiskPrompt(payload: RiskPayload): string {
  const { symptoms, systolic, diastolic, sugar, heartRate, age, language } = payload;
  const isHindi = language === "hi";
  const languageInstruction = isHindi
    ? "Please respond in Hindi (Devanagari script)."
    : "Please respond in English.";

  const vitals = [
    systolic && diastolic ? `Blood Pressure: ${systolic}/${diastolic} mmHg` : null,
    sugar ? `Blood Sugar: ${sugar} mg/dL` : null,
    heartRate ? `Heart Rate: ${heartRate} bpm` : null,
    age ? `Age: ${age} years` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are a medical triage AI. Assess the risk level based on the user's data.
${languageInstruction}

Classify into one of: Low / Medium / High / Emergency.
Return ONLY valid JSON with this exact structure:
{
  "level": "Low|Medium|High|Emergency",
  "score": <0-100 integer>,
  "reasoning": "brief explanation",
  "urgentFlags": ["flag 1", "flag 2"],
  "nextSteps": ["step 1", "step 2"]
}

User data:
Symptoms: ${symptoms || "None provided"}
${vitals}

Be conservative. Err toward higher urgency when uncertain.`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RiskPayload;
    const language = payload.language ?? "en";

    if (!payload.symptoms?.trim() && !payload.systolic && !payload.sugar) {
      return NextResponse.json(
        { error: "Please provide symptoms or health readings for risk assessment." },
        { status: 400 }
      );
    }

    const prompt = buildRiskPrompt(payload);
    const result = await askGemini(prompt);

    if (result.error || !result.text) {
      return NextResponse.json({ risk: fallbackRisk(language), source: "fallback" });
    }

    try {
      const jsonText = result.text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed = JSON.parse(jsonText) as RiskResult;
      return NextResponse.json({ risk: parsed, source: "gemini" });
    } catch {
      return NextResponse.json({ risk: fallbackRisk(language), source: "fallback" });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process risk assessment." },
      { status: 500 }
    );
  }
}
