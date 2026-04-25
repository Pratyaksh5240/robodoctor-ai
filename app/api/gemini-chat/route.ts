/**
 * POST /api/gemini-chat
 * Conversational AI endpoint powered by Google Gemini.
 *
 * Body shape:
 *   { messages: { role: "user"|"model", text: string }[], language?: string }
 *
 * Response shape:
 *   { reply: string, source: "gemini"|"fallback" }
 */

import { NextRequest, NextResponse } from "next/server";
import { callGemini, type GeminiMessage } from "@/lib/geminiService";

const SYSTEM_CONTEXT = `You are a cautious, empathetic AI health assistant called RoboDoctor AI.
Your role is to:
- Listen to the user's symptoms or health concerns
- Ask helpful follow-up questions to understand their situation better
- Provide clear, actionable general health guidance
- Highlight red flags that need urgent or emergency care
- Always remind the user that your responses are NOT a medical diagnosis
- Be supportive and avoid causing unnecessary alarm

When the user shares numeric readings (BP, blood sugar, heart rate), interpret them and offer practical context.
Keep responses concise (3-5 sentences max unless asking follow-up questions).`;

type IncomingMessage = { role: "user" | "model"; text: string };

function buildGeminiMessages(messages: IncomingMessage[]): GeminiMessage[] {
  const systemTurn: GeminiMessage = {
    role: "user",
    parts: [{ text: SYSTEM_CONTEXT }],
  };
  const ackTurn: GeminiMessage = {
    role: "model",
    parts: [{ text: "Understood. I am ready to assist as your RoboDoctor AI health assistant." }],
  };

  const conversationTurns: GeminiMessage[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  return [systemTurn, ackTurn, ...conversationTurns];
}

function fallbackReply(language: string): string {
  if (language === "hi") {
    return "मुझे खेद है, मैं अभी आपकी मदद नहीं कर पा रहा। कृपया थोड़ी देर बाद दोबारा कोशिश करें।";
  }
  return "I'm sorry, I'm unable to respond right now. Please try again in a moment.";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: IncomingMessage[];
      language?: string;
    };

    const { messages, language = "en" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required." },
        { status: 400 }
      );
    }

    const geminiMessages = buildGeminiMessages(messages);
    const result = await callGemini(geminiMessages);

    if (result.error || !result.text) {
      return NextResponse.json({
        reply: fallbackReply(language),
        source: "fallback",
      });
    }

    return NextResponse.json({ reply: result.text, source: "gemini" });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}
