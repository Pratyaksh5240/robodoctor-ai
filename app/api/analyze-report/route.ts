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

    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt =
      "Explain this medical report or X-ray image in simple, clear terms a non-medical person can understand. Highlight any visible areas of concern. Always remind the user that this is an AI-generated explanation and they must consult a qualified doctor for diagnosis and treatment.";

    // Strip the data-URL prefix if present (e.g. "data:image/png;base64,...")
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);

    return NextResponse.json({ analysis: result.response.text() });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze the report." },
      { status: 500 }
    );
  }
}
