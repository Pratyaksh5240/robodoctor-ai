import { NextRequest, NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai/suggestions";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 503 }
      );
    }

    const { symptoms } = (await req.json()) as { symptoms?: string };

    if (!symptoms?.trim()) {
      return NextResponse.json(
        { error: "symptoms is required." },
        { status: 400 }
      );
    }

    const suggestions = await generateSuggestions(symptoms);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestions." },
      { status: 500 }
    );
  }
}
