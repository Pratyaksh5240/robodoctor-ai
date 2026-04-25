import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/ai/gemini-client";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 503 }
      );
    }

    const { message } = (await req.json()) as { message?: string };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "message is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a cautious AI Health Assistant integrated into RoboDoctor AI.
A user says: "${message}"
Ask relevant follow-up questions to better understand their symptoms.
Keep your response concise (2–3 sentences).
Always end with a reminder that you are an AI, not a licensed doctor, and users should seek professional medical advice for serious concerns.`;

    const result = await model.generateContent(prompt);

    return NextResponse.json({ reply: result.response.text() });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat message." },
      { status: 500 }
    );
  }
}
