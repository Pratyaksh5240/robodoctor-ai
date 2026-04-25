"use client";

import Link from "next/link";
import { useState, useRef, FormEvent } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ChatAssistant from "@/components/ai/ChatAssistant";

type RiskLevel = "Low" | "Medium" | "High";

type Suggestions = {
  diet: string[];
  precautions: string[];
  next_steps: string[];
};

export default function AssistantPage() {
  // ── Report Analysis state ──────────────────────────────────────────────────
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [reportAnalysis, setReportAnalysis] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Risk & Suggestions state ───────────────────────────────────────────────
  const [riskInput, setRiskInput] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setReportAnalysis(null);
      setReportError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeReport = async () => {
    if (!imagePreview) return;
    setReportLoading(true);
    setReportError(null);
    setReportAnalysis(null);

    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imagePreview, mimeType: imageMime }),
      });
      const data = (await res.json()) as { analysis?: string; error?: string };
      if (data.error) setReportError(data.error);
      else setReportAnalysis(data.analysis ?? null);
    } catch {
      setReportError("Network error. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleRiskAssess = async (e: FormEvent) => {
    e.preventDefault();
    if (!riskInput.trim()) return;
    setRiskLoading(true);
    setRiskLevel(null);
    setSuggestions(null);

    try {
      const [riskRes, suggestRes] = await Promise.all([
        fetch("/api/risk-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: riskInput }),
        }),
        fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: riskInput }),
        }),
      ]);

      const riskData = (await riskRes.json()) as { riskLevel?: RiskLevel; error?: string };
      const suggestData = (await suggestRes.json()) as Suggestions & { error?: string };

      setRiskLevel(riskData.riskLevel ?? null);
      if (!suggestData.error) setSuggestions(suggestData);
    } catch {
      // silently fail – UI already shows null state
    } finally {
      setRiskLoading(false);
    }
  };

  const riskColor: Record<RiskLevel, string> = {
    Low: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    High: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
        <h1 className="text-xl font-bold">🤖 AI Health Assistant</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/"
            className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-2 text-sm hover:opacity-90"
          >
            Back Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* ── Section 1: Conversational AI ─────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold mb-1">💬 Conversational AI</h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Chat with Gemini to describe symptoms and get guided health information.
          </p>
          <div className="flex justify-center">
            <ChatAssistant />
          </div>
        </section>

        {/* ── Section 2: Report / Image Analysis ───────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold mb-1">🩻 Report &amp; Image Analysis</h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Upload an X-ray or medical report image and get a plain-language explanation.
          </p>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-blue-400 px-6 py-4 w-full text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {imagePreview ? "Change image" : "📁 Click to upload X-ray / report image"}
            </button>

            {imagePreview && (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Uploaded report preview"
                  className="max-h-48 rounded-xl border border-[color:var(--border)] object-contain"
                />
                <button
                  onClick={handleAnalyzeReport}
                  disabled={reportLoading}
                  className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {reportLoading ? "Analysing…" : "Analyse with Gemini"}
                </button>
              </div>
            )}

            {reportError && (
              <p className="text-red-600 text-sm">{reportError}</p>
            )}

            {reportAnalysis && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-[color:var(--border)] p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {reportAnalysis}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 3: Risk Assessment + Suggestions ─────────────────── */}
        <section>
          <h2 className="text-2xl font-bold mb-1">⚠️ Risk Assessment &amp; Suggestions</h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Paste a diagnosis summary or symptom description to get a risk level and personalised suggestions.
          </p>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-4">
            <form onSubmit={handleRiskAssess} className="flex gap-3">
              <textarea
                value={riskInput}
                onChange={(e) => setRiskInput(e.target.value)}
                rows={3}
                className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="e.g. Patient has high BP (160/100), mild chest discomfort, and diabetes…"
              />
              <button
                type="submit"
                disabled={riskLoading || !riskInput.trim()}
                className="self-start rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {riskLoading ? "…" : "Assess"}
              </button>
            </form>

            {riskLevel && (
              <div className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 font-semibold text-sm ${riskColor[riskLevel]}`}>
                Risk Level: {riskLevel}
              </div>
            )}

            {suggestions && (
              <div className="grid gap-4 sm:grid-cols-3 mt-2">
                {(["diet", "precautions", "next_steps"] as const).map((key) => (
                  <div
                    key={key}
                    className="rounded-xl border border-[color:var(--border)] bg-gray-50 dark:bg-gray-900 p-4"
                  >
                    <h3 className="font-semibold text-sm capitalize mb-2">
                      {key === "next_steps" ? "Next Steps" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {suggestions[key].map((item, i) => (
                        <li key={i} className="text-xs text-[var(--muted)] leading-snug">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[var(--muted)] pb-4">
          ⚠️ All AI-generated content is for informational purposes only. Always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
