"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type Suggestions = {
  diet: string[];
  precautions: string[];
  nextSteps: string[];
  lifestyle: string[];
  disclaimer: string;
};

const commonConditionsEn = [
  "High blood pressure (hypertension)",
  "Type 2 diabetes",
  "High cholesterol",
  "Obesity / weight management",
  "Anxiety / stress",
  "Thyroid disorder",
  "Anaemia",
  "Acid reflux / GERD",
];

const commonConditionsHi = [
  "उच्च रक्तचाप (हाइपरटेंशन)",
  "टाइप 2 डायबिटीज",
  "उच्च कोलेस्ट्रॉल",
  "मोटापा / वजन प्रबंधन",
  "चिंता / तनाव",
  "थायरॉइड विकार",
  "एनीमिया",
  "एसिड रिफ्लक्स / GERD",
];

export default function PersonalizedCarePage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [condition, setCondition] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleGenerate = async () => {
    if (!condition.trim()) {
      setStatusMessage(
        localize(
          "Please enter a health condition or concern.",
          "कृपया एक स्वास्थ्य स्थिति या चिंता दर्ज करें।"
        )
      );
      return;
    }

    setLoading(true);
    setSuggestions(null);
    setStatusMessage("");

    try {
      const response = await fetch("/api/gemini-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition,
          age: age ? Number(age) : null,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          activityLevel,
          language,
        }),
      });

      const data = (await response.json()) as {
        suggestions?: Suggestions;
        error?: string;
      };

      if (data.error) {
        setStatusMessage(data.error);
      } else if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch {
      setStatusMessage(
        localize("Failed to generate suggestions. Please try again.", "सुझाव उत्पन्न करने में विफल। कृपया फिर कोशिश करें।")
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
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-emerald-400">
              {localize("Gemini AI", "जेमिनी एआई")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("Personalized Health Suggestions", "व्यक्तिगत स्वास्थ्य सुझाव")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Get AI-generated diet, lifestyle, and precaution advice tailored to your health condition.",
                "अपनी स्वास्थ्य स्थिति के अनुसार AI-जनित आहार, जीवनशैली और सावधानी सुझाव पाएं।"
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

        {/* Quick-select conditions */}
        <div className="mb-6">
          <p className="mb-3 text-sm text-[var(--muted)]">
            {localize("Quick select:", "जल्दी चुनें:")}
          </p>
          <div className="flex flex-wrap gap-3">
            {(isHindi ? commonConditionsHi : commonConditionsEn).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  condition === c
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                    : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-emerald-400/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize("Health Condition / Concern *", "स्वास्थ्य स्थिति / चिंता *")}
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={localize(
                "e.g. high blood pressure, diabetes, stress...",
                "जैसे उच्च रक्तचाप, डायबिटीज, तनाव..."
              )}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Age", "उम्र")}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="years"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Weight (kg)", "वजन (kg)")}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Height (cm)", "लंबाई (cm)")}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="cm"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize("Activity Level", "गतिविधि स्तर")}
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              >
                <option value="sedentary">{localize("Sedentary", "निष्क्रिय")}</option>
                <option value="light">{localize("Light", "हल्का")}</option>
                <option value="moderate">{localize("Moderate", "मध्यम")}</option>
                <option value="active">{localize("Active", "सक्रिय")}</option>
              </select>
            </div>
          </div>

          {statusMessage && (
            <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {statusMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? localize("Generating...", "उत्पन्न हो रहा है...")
                : localize("Get Personalized Suggestions", "व्यक्तिगत सुझाव पाएं")}
            </button>
            {suggestions && (
              <button
                onClick={() => { setSuggestions(null); setStatusMessage(""); }}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3"
              >
                {localize("Reset", "रीसेट")}
              </button>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions && (
          <div className="mt-8 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-6">
            <h2 className="text-2xl font-black">
              {localize("Your Personalized Plan", "आपकी व्यक्तिगत योजना")}
            </h2>

            {/* Diet */}
            {suggestions.diet.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-lime-400">
                  <span>🥗</span> {localize("Diet Suggestions", "आहार सुझाव")}
                </h3>
                <ul className="space-y-2">
                  {suggestions.diet.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-lime-400">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lifestyle */}
            {suggestions.lifestyle.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-400">
                  <span>🏃</span> {localize("Lifestyle Tips", "जीवनशैली सुझाव")}
                </h3>
                <ul className="space-y-2">
                  {suggestions.lifestyle.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-sky-400">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precautions */}
            {suggestions.precautions.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-400">
                  <span>⚠️</span> {localize("Precautions", "सावधानियां")}
                </h3>
                <ul className="space-y-2">
                  {suggestions.precautions.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-amber-400">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next steps */}
            {suggestions.nextSteps.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-400">
                  <span>✅</span> {localize("Next Steps", "अगले कदम")}
                </h3>
                <ul className="space-y-2">
                  {suggestions.nextSteps.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-emerald-400">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3 text-xs text-[var(--muted)]">
              ⚠ {suggestions.disclaimer}
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {localize(
            "Powered by Google Gemini · Not a substitute for medical advice",
            "Google Gemini द्वारा संचालित · चिकित्सीय सलाह का विकल्प नहीं"
          )}
        </p>
      </div>
    </div>
  );
}
