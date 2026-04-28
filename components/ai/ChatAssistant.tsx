"use client";

import { FormEvent, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e?: FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const text = overrideText ?? input;
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      const reply: Message = {
        role: "assistant",
        text: data.reply ?? data.error ?? "Something went wrong.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[color:var(--border)] bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-white font-bold text-lg">🤖 AI Health Assistant</h2>
        <p className="text-blue-100 text-xs mt-0.5">
          Powered by Google Gemini · Not a substitute for professional medical advice
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--muted)] mt-8">
            Describe your symptoms and I&apos;ll help you understand them.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800 text-sm text-[var(--muted)] animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {["I have fever and cough", "My BP is high", "I have chest pain", "I feel dizzy"].map(
            (q) => (
              <button
                key={q}
                onClick={() => handleSubmit(undefined, q)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {q}
              </button>
            )
          )}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t border-[color:var(--border)]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Describe your symptoms…"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
