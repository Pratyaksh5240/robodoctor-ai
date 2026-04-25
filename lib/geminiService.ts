/**
 * geminiService.ts
 * Shared helper for calling the Google Gemini REST API.
 * Uses fetch directly — no extra npm package required.
 *
 * Requires environment variable:  GEMINI_API_KEY
 */

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export type GeminiMessage = {
  role: "user" | "model";
  parts: GeminiPart[];
};

export type GeminiResponse = {
  text: string;
  error?: string;
};

/**
 * Send a multi-turn conversation to Gemini and return the assistant text.
 * @param messages  Array of conversation turns (user / model).
 * @param model     Gemini model name (default: gemini-1.5-flash).
 */
export async function callGemini(
  messages: GeminiMessage[],
  model = "gemini-1.5-flash"
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { text: "", error: "GEMINI_API_KEY is not configured." };
  }

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: messages,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { text: "", error: `Gemini API error ${res.status}: ${errText}` };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      "";

    return { text };
  } catch (err) {
    return { text: "", error: String(err) };
  }
}

/**
 * Convenience wrapper for a single user prompt (no conversation history).
 */
export async function askGemini(
  prompt: string,
  model = "gemini-1.5-flash"
): Promise<GeminiResponse> {
  return callGemini([{ role: "user", parts: [{ text: prompt }] }], model);
}
