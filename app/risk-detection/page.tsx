"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type RiskResult = {
  level: "Low" | "Medium" | "High" | "Emergency";
  score: number;
  reasoning: string;
  urgentFlags: string[];
  nextSteps: string[];
};

const levelColors: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-amber-400",
  High: "text-orange-400",
  Emergency: "text-rose-400",
};

const levelBg: Record<string, string> = {
  Low: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  Medium: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  High: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  Emergency: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
};

export default function RiskDetectionPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [symptoms, setSymptoms] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [sugar, setSugar] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleAssess = async () => {
    if (!symptoms.trim() && !systolic && !sugar) {
      setStatusMessage(
        localize(
          "Please enter symptoms or at least one health reading.",
          "कृपया लक्षण या कम से कम एक हेल्थ रीडिंग दर्ज करें।"
        )
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setStatusMessage("");

    try {
      const response = await fetch("/api/gemini-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          systolic: systolic ? Number(systolic) : null,
          diastolic: diastolic ? Number(diastolic) : null,
          sugar: sugar ? Number(sugar) : null,
          heartRate: heartRate ? Number(heartRate) : null,
          age: age ? Number(age) : null,
          language,
        }),
      });

      const data = (await response.json()) as {
        risk?: RiskResult;
        error?: string;
      };

      if (data.error) {
        setStatusMessage(data.error);
      } else if (data.risk) {
        setResult(data.risk);
      }
    } catch {
      setStatusMessage(
        localize("Assessment failed. Please try again.", "मूल्यांकन विफल। कृपया फिर कोशिश करें।")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-orange-400">
              {localize("Gemini AI", "जेमिनी एआई")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("AI Risk & Urgency Detection", "AI जोखिम और तात्कालिकता पहचान")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Enter your symptoms and health readings to get an AI-powered risk classification: Low, Medium, High, or Emergency.",
                "अपने लक्षण और हेल्थ रीडिंग दर्ज करें और AI-संचालित जोखिम वर्गीकरण पाएं: Low, Medium, High, या Emergency।"
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

        {/* Form */}
        <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize("Symptoms", "लक्षण")}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={localize(
                "Describe symptoms e.g. fever, headache, chest pain, breathlessness...",
                "लक्षण बताएं जैसे बुखार, सिरदर्द, सीने में दर्द, सांस फूलना..."
              )}
              rows={3}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Systolic BP", "सिस्टोलिक BP")}
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="e.g. 140"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Diastolic BP", "डायस्टोलिक BP")}
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="e.g. 90"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Blood Sugar (mg/dL)", "ब्लड शुगर (mg/dL)")}
              </label>
              <input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="e.g. 120"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Heart Rate (bpm)", "हार्ट रेट (bpm)")}
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="e.g. 85"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize("Age (years)", "उम्र (वर्ष)")}
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 45"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
            />
          </div>

          {statusMessage && (
            <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {statusMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAssess}
              disabled={loading}
              className="rounded-full bg-orange-500 px-8 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? localize("Assessing...", "मूल्यांकन हो रहा है...")
                : localize("Assess Risk with Gemini", "Gemini से जोखिम का मूल्यांकन करें")}
            </button>
            {result && (
              <button
                onClick={() => { setResult(null); setStatusMessage(""); }}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3"
              >
                {localize("Reset", "रीसेट")}
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Risk level card */}
            <div className={`rounded-[32px] border bg-gradient-to-br p-8 text-center ${levelBg[result.level] ?? levelBg.Low}`}>
              <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
                {localize("Risk Level", "जोखिम स्तर")}
              </p>
              <p className={`mt-2 text-6xl font-black ${levelColors[result.level] ?? levelColors.Low}`}>
                {result.level}
              </p>
              <p className="mt-2 text-lg text-[var(--muted)]">
                {localize("Score", "स्कोर")}: {result.score}/100
              </p>
            </div>

            <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-5">
              {/* Reasoning */}
              <div>
                <h3 className="mb-2 text-lg font-bold text-orange-400">
                  {localize("Analysis", "विश्लेषण")}
                </h3>
                <p className="text-sm">{result.reasoning}</p>
              </div>

              {/* Urgent flags */}
              {result.urgentFlags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-bold text-rose-400">
                    {localize("Urgent Flags", "तत्काल संकेत")}
                  </h3>
                  <ul className="space-y-2">
                    {result.urgentFlags.map((flag, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="mt-1 text-rose-400">⚑</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next steps */}
              {result.nextSteps.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-bold text-emerald-400">
                    {localize("Recommended Next Steps", "अनुशंसित अगले कदम")}
                  </h3>
                  <ul className="space-y-2">
                    {result.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="mt-1 text-emerald-400">→</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {localize(
            "Powered by Google Gemini · Not a medical diagnosis · Always consult a doctor",
            "Google Gemini द्वारा संचालित · चिकित्सीय निदान नहीं · हमेशा डॉक्टर से मिलें"
          )}
        </p>
      </div>
    </div>
  );
}
