import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/ai/gemini-client";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64: string;
      mimeType: string;
    };
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt =
      "Explain this medical report or X-ray in simple terms. Highlight any areas of concern. Disclaimer: Remind the user to consult a doctor.";

    const imageParts = [
      {
        inlineData: {
          data: imageBase64.split(",")[1], // Remove the data:image/...;base64, prefix
          mimeType,
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    return NextResponse.json({ analysis: result.response.text() });
  } catch (error) {
    console.error("Report Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze report" },
      { status: 500 }
    );
  }
}
