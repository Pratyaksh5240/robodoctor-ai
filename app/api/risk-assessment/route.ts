import { NextRequest, NextResponse } from "next/server";
import { assessRiskLevel } from "@/lib/ai/risk-assessment";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 503 }
      );
    }

    const { summary } = (await req.json()) as { summary?: string };

    if (!summary?.trim()) {
      return NextResponse.json(
        { error: "summary is required." },
        { status: 400 }
      );
    }

    const riskLevel = await assessRiskLevel(summary);
    return NextResponse.json({ riskLevel });
  } catch {
    return NextResponse.json(
      { error: "Failed to assess risk level." },
      { status: 500 }
    );
  }
}
