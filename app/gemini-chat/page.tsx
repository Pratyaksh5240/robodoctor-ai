"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type Message = {
  role: "user" | "model";
  text: string;
};

const quickRepliesEn = [
  "I have fever and headache",
  "My BP is 150/95",
  "I feel dizzy and weak",
  "I have chest pain",
];

const quickRepliesHi = [
  "मुझे बुखार और सिरदर्द है",
  "मेरा BP 150/95 है",
  "मुझे चक्कर और कमजोरी है",
  "मेरे सीने में दर्द है",
];

export default function GeminiChatPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const initialMessage: Message = {
    role: "model",
    text: isHindi
      ? "नमस्ते! मैं आपका Gemini AI स्वास्थ्य सहायक हूं। अपने लक्षण, BP, शुगर, या कोई स्वास्थ्य चिंता बताएं — मैं मार्गदर्शन देने की कोशिश करूंगा।"
      : "Hello! I am your Gemini AI health assistant. Share your symptoms, BP, sugar readings, or any health concern and I will try to guide you.",
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user" as const, text: trimmed },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          language,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages((prev) => [
        ...prev,
        {
          role: "model" as const,
          text:
            data.reply ??
            (isHindi
              ? "कोई त्रुटि हुई। कृपया फिर कोशिश करें।"
              : "Something went wrong. Please try again."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model" as const,
          text: isHindi
            ? "नेटवर्क त्रुटि। कृपया फिर कोशिश करें।"
            : "Network error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-400">
              {localize("Gemini AI", "जेमिनी एआई")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("Conversational AI Health Chat", "एआई स्वास्थ्य चैट")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Powered by Google Gemini. Share symptoms or readings for intelligent, context-aware health guidance.",
                "Google Gemini द्वारा संचालित। लक्षण या रीडिंग शेयर करें और बुद्धिमान स्वास्थ्य मार्गदर्शन पाएं।"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/ai-features"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm hover:opacity-90"
            >
              {localize("AI Features", "एआई फीचर्स")}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm hover:opacity-90"
            >
              {localize("Back Home", "होम पर वापस")}
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          {/* Quick replies */}
          <div className="mb-4 flex flex-wrap gap-3">
            {(isHindi ? quickRepliesHi : quickRepliesEn).map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => sendMessage(reply)}
                disabled={loading}
                className="rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm text-violet-100 disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="max-h-[420px] overflow-y-auto space-y-4 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-4 ${
                  message.role === "model"
                    ? "bg-violet-500/10 text-[var(--foreground)]"
                    : "ml-auto bg-emerald-500/10 text-[var(--foreground)]"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-3xl bg-violet-500/10 px-5 py-4">
                <span className="animate-pulse text-violet-300">
                  {localize("Gemini is thinking...", "Gemini सोच रहा है...")}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="mt-5 flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={localize(
                "Type symptoms, readings, or a health question...",
                "लक्षण, रीडिंग या स्वास्थ्य प्रश्न लिखें..."
              )}
              className="flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {localize("Send", "भेजें")}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            {localize(
              "Powered by Google Gemini · Not a medical diagnosis · Always consult a doctor",
              "Google Gemini द्वारा संचालित · चिकित्सीय निदान नहीं · हमेशा डॉक्टर से मिलें"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
