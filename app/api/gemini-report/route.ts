/**
 * POST /api/gemini-report
 * Report / Image Understanding endpoint powered by Google Gemini.
 *
 * Body shape:
 *   { imageDataUrl?: string, reportText?: string, reportType?: string, language?: string }
 *
 * Response shape:
 *   { analysis: { summary, findings, recommendations, urgency, disclaimer }, source: "gemini"|"fallback" }
 */

import { NextRequest, NextResponse } from "next/server";
import { callGemini, type GeminiMessage, type GeminiPart } from "@/lib/geminiService";

type ReportPayload = {
  imageDataUrl?: string | null;
  reportText?: string | null;
  reportType?: string;
  language?: string;
};

type ReportAnalysis = {
  summary: string;
  findings: string[];
  recommendations: string[];
  urgency: "low" | "moderate" | "high" | "emergency";
  disclaimer: string;
};

function fallbackAnalysis(language: string): ReportAnalysis {
  const isHindi = language === "hi";
  return {
    summary: isHindi
      ? "AI विश्लेषण अभी उपलब्ध नहीं है।"
      : "AI analysis is currently unavailable.",
    findings: [],
    recommendations: isHindi
      ? ["एक योग्य डॉक्टर से रिपोर्ट की समीक्षा करवाएं।"]
      : ["Please have your report reviewed by a qualified doctor."],
    urgency: "low",
    disclaimer: isHindi
      ? "यह विश्लेषण चिकित्सीय निदान नहीं है।"
      : "This analysis is not a medical diagnosis.",
  };
}

function buildReportPrompt(payload: ReportPayload): string {
  const { reportType = "medical report", reportText, language } = payload;
  const isHindi = language === "hi";

  const languageInstruction = isHindi
    ? "Please respond in Hindi (Devanagari script)."
    : "Please respond in English.";

  const textSection = reportText?.trim()
    ? `\n\nReport text / values provided by the user:\n"""\n${reportText.trim()}\n"""`
    : "";

  return `You are a careful medical AI assistant reviewing a ${reportType}.
${languageInstruction}

Analyze the provided information and return ONLY valid JSON with this exact structure:
{
  "summary": "brief plain-language overview",
  "findings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "urgency": "low|moderate|high|emergency",
  "disclaimer": "always include: this is not a medical diagnosis"
}

Be conservative. Do not make definitive diagnoses. Flag anything requiring urgent medical attention.
${textSection}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ReportPayload;
    const { imageDataUrl, language = "en" } = payload;

    const hasImage = Boolean(imageDataUrl?.trim());
    const hasText = Boolean(payload.reportText?.trim());

    if (!hasImage && !hasText) {
      return NextResponse.json(
        { error: "Please provide either an image or report text for analysis." },
        { status: 400 }
      );
    }

    const promptText = buildReportPrompt(payload);

    const parts: GeminiPart[] = [{ text: promptText }];

    if (hasImage) {
      const dataUrl = imageDataUrl!.trim();
      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }

    const messages: GeminiMessage[] = [{ role: "user", parts }];

    const result = await callGemini(messages, "gemini-1.5-flash");

    if (result.error || !result.text) {
      return NextResponse.json({
        analysis: fallbackAnalysis(language),
        source: "fallback",
      });
    }

    try {
      const jsonText = result.text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed = JSON.parse(jsonText) as ReportAnalysis;
      return NextResponse.json({ analysis: parsed, source: "gemini" });
    } catch {
      return NextResponse.json({
        analysis: {
          summary: result.text,
          findings: [],
          recommendations: [],
          urgency: "low" as const,
          disclaimer: "This is not a medical diagnosis. Please consult a doctor.",
        },
        source: "gemini",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process report analysis." },
      { status: 500 }
    );
  }
}
