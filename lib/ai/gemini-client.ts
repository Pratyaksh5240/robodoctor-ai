import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[gemini-client] GEMINI_API_KEY is not set – Gemini features will be unavailable."
  );
}

export const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? ""
);
