"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type Reminder = {
  time: string;
  title: string;
  detail: string;
  category: "medication" | "vitals" | "diet" | "exercise" | "hydration" | "rest";
};

type SavedReminder = Reminder & { id: number; done: boolean };

const categoryColors: Record<string, string> = {
  medication: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  vitals: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  diet: "text-lime-400 bg-lime-400/10 border-lime-400/30",
  exercise: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  hydration: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  rest: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
};

const categoryIcons: Record<string, string> = {
  medication: "💊",
  vitals: "📊",
  diet: "🥗",
  exercise: "🏃",
  hydration: "💧",
  rest: "😴",
};

export default function SmartRemindersPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [age, setAge] = useState("");
  const [aiReminders, setAiReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [savedReminders, setSavedReminders] = useState<SavedReminder[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("robodoctor-smart-reminders");
    return saved ? (JSON.parse(saved) as SavedReminder[]) : [];
  });

  useEffect(() => {
    localStorage.setItem("robodoctor-smart-reminders", JSON.stringify(savedReminders));
  }, [savedReminders]);

  const handleGenerate = async () => {
    setLoading(true);
    setAiReminders([]);
    setStatusMessage("");

    const conditionList = conditions
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const medicationList = medications
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/gemini-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditions: conditionList,
          medications: medicationList,
          age: age ? Number(age) : null,
          language,
        }),
      });

      const data = (await response.json()) as {
        reminders?: Reminder[];
        error?: string;
      };

      if (data.error) {
        setStatusMessage(data.error);
      } else if (data.reminders) {
        setAiReminders(data.reminders);
      }
    } catch {
      setStatusMessage(
        localize("Failed to generate reminders. Please try again.", "रिमाइंडर उत्पन्न करने में विफल। कृपया फिर कोशिश करें।")
      );
    } finally {
      setLoading(false);
    }
  };

  const saveReminder = (reminder: Reminder) => {
    setSavedReminders((prev) => [
      ...prev,
      { ...reminder, id: Date.now(), done: false },
    ]);
  };

  const toggleDone = (id: number) => {
    setSavedReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const deleteReminder = (id: number) => {
    setSavedReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-indigo-400">
              {localize("Gemini AI", "जेमिनी एआई")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("Smart AI Reminders", "स्मार्ट AI रिमाइंडर")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Let Gemini AI build a personalized daily reminder schedule based on your conditions and medications.",
                "Gemini AI को अपनी स्थितियों और दवाओं के आधार पर एक व्यक्तिगत दैनिक रिमाइंडर शेड्यूल बनाने दें।"
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

        {/* Generate form */}
        <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-5">
          <h2 className="text-xl font-bold">
            {localize("Generate AI Schedule", "AI शेड्यूल बनाएं")}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize(
                  "Health Conditions (comma-separated)",
                  "स्वास्थ्य स्थितियां (कॉमा से अलग)"
                )}
              </label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder={localize("e.g. diabetes, hypertension", "जैसे डायबिटीज, हाइपरटेंशन")}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {localize(
                  "Medications (comma-separated)",
                  "दवाएं (कॉमा से अलग)"
                )}
              </label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder={localize(
                  "e.g. Metformin 500mg morning, Amlodipine 5mg night",
                  "जैसे Metformin 500mg सुबह, Amlodipine 5mg रात"
                )}
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
              placeholder="e.g. 55"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
            />
          </div>

          {statusMessage && (
            <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {statusMessage}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-full bg-indigo-500 px-8 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? localize("Generating schedule...", "शेड्यूल बन रहा है...")
              : localize("Generate Smart Schedule", "स्मार्ट शेड्यूल बनाएं")}
          </button>
        </div>

        {/* AI-generated reminders */}
        {aiReminders.length > 0 && (
          <div className="mt-8 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {localize("AI-Generated Schedule", "AI-जनित शेड्यूल")}
              </h2>
              <button
                onClick={() => {
                  aiReminders.forEach(saveReminder);
                  setAiReminders([]);
                }}
                className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/30"
              >
                {localize("Save All", "सभी सेव करें")}
              </button>
            </div>
            <div className="space-y-3">
              {aiReminders.sort((a, b) => a.time.localeCompare(b.time)).map((reminder, i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between rounded-2xl border p-4 ${categoryColors[reminder.category] ?? categoryColors.medication}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{categoryIcons[reminder.category] ?? "🔔"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{reminder.time}</span>
                        <span className="font-semibold">{reminder.title}</span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{reminder.detail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => saveReminder(reminder)}
                    className="ml-4 shrink-0 rounded-full border border-current px-3 py-1 text-xs hover:opacity-80"
                  >
                    {localize("Save", "सेव")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved reminders */}
        {savedReminders.length > 0 && (
          <div className="mt-8 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-4">
            <h2 className="text-xl font-bold">
              {localize("My Saved Reminders", "मेरे सेव्ड रिमाइंडर")}
            </h2>
            <div className="space-y-3">
              {savedReminders
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-start justify-between rounded-2xl border p-4 transition-opacity ${
                      reminder.done ? "opacity-50" : ""
                    } ${categoryColors[reminder.category] ?? categoryColors.medication}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleDone(reminder.id)}
                        className="mt-0.5 text-xl"
                        aria-label={reminder.done ? "Mark as pending" : "Mark as done"}
                      >
                        {reminder.done ? "✅" : categoryIcons[reminder.category] ?? "🔔"}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{reminder.time}</span>
                          <span className={`font-semibold ${reminder.done ? "line-through" : ""}`}>
                            {reminder.title}
                          </span>
                        </div>
                        <p className="mt-1 text-sm opacity-80">{reminder.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="ml-4 shrink-0 rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-400 hover:bg-rose-400/10"
                    >
                      {localize("Delete", "हटाएं")}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {localize(
            "Powered by Google Gemini · Reminders saved locally in your browser",
            "Google Gemini द्वारा संचालित · रिमाइंडर ब्राउज़र में स्थानीय रूप से सेव"
          )}
        </p>
      </div>
    </div>
  );
}
