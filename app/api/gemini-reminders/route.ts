/**
 * POST /api/gemini-reminders
 * Smart Reminders AI endpoint powered by Google Gemini.
 * Generates an intelligent daily reminder schedule based on the user's health profile.
 *
 * Body shape:
 *   {
 *     conditions: string[],
 *     medications: string[],
 *     age?: number,
 *     language?: string
 *   }
 *
 * Response shape:
 *   {
 *     reminders: { time, title, detail, category }[],
 *     source: "gemini"|"fallback"
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/geminiService";

type RemindersPayload = {
  conditions: string[];
  medications: string[];
  age?: number | null;
  language?: string;
};

type Reminder = {
  time: string;
  title: string;
  detail: string;
  category: "medication" | "vitals" | "diet" | "exercise" | "hydration" | "rest";
};

function fallbackReminders(language: string): Reminder[] {
  const isHindi = language === "hi";
  return [
    {
      time: "08:00",
      title: isHindi ? "सुबह की दवा" : "Morning Medication",
      detail: isHindi ? "अपनी सुबह की दवाएं लें।" : "Take your morning medications.",
      category: "medication",
    },
    {
      time: "08:30",
      title: isHindi ? "नाश्ता" : "Breakfast",
      detail: isHindi ? "स्वस्थ नाश्ता करें।" : "Have a healthy breakfast.",
      category: "diet",
    },
    {
      time: "10:00",
      title: isHindi ? "पानी पिएं" : "Drink Water",
      detail: isHindi ? "एक गिलास पानी पिएं।" : "Drink a glass of water.",
      category: "hydration",
    },
    {
      time: "14:00",
      title: isHindi ? "BP जांच" : "BP Check",
      detail: isHindi ? "अपना ब्लड प्रेशर मापें।" : "Measure your blood pressure.",
      category: "vitals",
    },
    {
      time: "20:00",
      title: isHindi ? "शाम की दवा" : "Evening Medication",
      detail: isHindi ? "अपनी शाम की दवाएं लें।" : "Take your evening medications.",
      category: "medication",
    },
  ];
}

function buildRemindersPrompt(payload: RemindersPayload): string {
  const { conditions, medications, age, language } = payload;
  const isHindi = language === "hi";
  const languageInstruction = isHindi
    ? "Please respond in Hindi (Devanagari script)."
    : "Please respond in English.";

  const conditionsList = conditions.length > 0 ? conditions.join(", ") : "None specified";
  const medicationsList = medications.length > 0 ? medications.join("; ") : "None specified";

  return `You are a smart health reminder AI. Generate a practical daily reminder schedule.
${languageInstruction}

Patient profile:
- Age: ${age ?? "Not specified"}
- Health conditions: ${conditionsList}
- Medications: ${medicationsList}

Create 5-8 reminders spread through the day. Return ONLY valid JSON array:
[
  {
    "time": "HH:MM (24-hour)",
    "title": "short reminder title",
    "detail": "one sentence explanation",
    "category": "medication|vitals|diet|exercise|hydration|rest"
  }
]

Prioritize medication timings, vital checks, water intake, and light exercise.`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RemindersPayload;
    const language = payload.language ?? "en";

    const conditions = Array.isArray(payload.conditions) ? payload.conditions : [];
    const medications = Array.isArray(payload.medications) ? payload.medications : [];

    const prompt = buildRemindersPrompt({ ...payload, conditions, medications });
    const result = await askGemini(prompt);

    if (result.error || !result.text) {
      return NextResponse.json({
        reminders: fallbackReminders(language),
        source: "fallback",
      });
    }

    try {
      const jsonText = result.text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed = JSON.parse(jsonText) as Reminder[];
      return NextResponse.json({ reminders: parsed, source: "gemini" });
    } catch {
      return NextResponse.json({
        reminders: fallbackReminders(language),
        source: "fallback",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate reminders." },
      { status: 500 }
    );
  }
}
