import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/ai/gemini-client";

export async function POST(req: NextRequest) {
  try {
    const { message } = (await req.json()) as { message: string };
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI Health Assistant. A user says: "${message}". 
Ask follow-up questions to understand their symptoms, but remind them you are an AI and not a doctor. Keep responses concise.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
