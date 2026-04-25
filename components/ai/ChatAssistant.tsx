"use client";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "No response received.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="border border-[color:var(--border)] p-4 rounded-lg shadow-sm max-w-md w-full bg-[color:var(--surface)]">
      <h3 className="font-bold text-lg mb-2 text-[var(--foreground)]">
        AI Health Assistant
      </h3>
      <div className="h-64 overflow-y-auto mb-4 border-b border-[color:var(--border)] p-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-[color:var(--muted)] italic">
            Describe your symptoms and I will help guide you.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded text-sm ${
              m.role === "user"
                ? "bg-blue-100 text-right text-blue-900"
                : "bg-gray-100 text-left text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="p-2 rounded text-sm bg-gray-100 text-left text-gray-500 italic">
            Thinking…
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-[color:var(--border)] bg-[color:var(--surface)] text-[var(--foreground)] p-2 flex-1 rounded text-sm"
          placeholder="Describe your symptoms…"
          disabled={loading}
        />
        <button
          onClick={() => void handleSend()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 rounded text-sm font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
