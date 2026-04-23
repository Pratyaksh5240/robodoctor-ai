"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type Reminder = {
  id: number;
  title: string;
  time: string;
  done: boolean;
};

export default function MedicineReminderPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem("robodoctor-reminders");
    return saved ? (JSON.parse(saved) as Reminder[]) : [];
  });

  useEffect(() => {
    localStorage.setItem("robodoctor-reminders", JSON.stringify(reminders));
  }, [reminders]);

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-emerald-400">
              {localize("Reminders", "रिमाइंडर")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize(
                "Medicine and health task reminders",
                "मेडिसिन और हेल्थ टास्क रिमाइंडर"
              )}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Save medicines, water, walks, BP checks, or sugar checks and track them like a mini health planner.",
                "दवा, पानी, वॉक, BP चेक या शुगर चेक जैसे काम सेव करें और एक छोटे हेल्थ प्लानर की तरह ट्रैक करें।"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm hover:opacity-90"
            >
              {localize("Back Home", "होम पर वापस जाएं")}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <h2 className="text-2xl font-bold">{localize("New reminder", "नया रिमाइंडर")}</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--muted)]">
                  {localize("Task or medicine name", "काम या दवा का नाम")}
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
                  placeholder={localize("Example: Morning BP medicine", "जैसे: सुबह BP दवा")}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--muted)]">
                  {localize("Time", "समय")}
                </span>
                <input
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  type="time"
                  className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || !time) {
                    return;
                  }

                  setReminders((current) => [
                    { id: Date.now(), title: title.trim(), time, done: false },
                    ...current,
                  ]);
                  setTitle("");
                  setTime("");
                }}
                className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
              >
                {localize("Add reminder", "रिमाइंडर जोड़ें")}
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <h2 className="text-2xl font-bold">
              {localize("Your reminders", "आपके रिमाइंडर")}
            </h2>
            <div className="mt-5 space-y-4">
              {reminders.length === 0 ? (
                <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 text-[var(--muted)]">
                  {localize(
                    "No reminders yet. Start with medicine, water, walking, BP checks, or sugar checks.",
                    "अभी कोई रिमाइंडर नहीं है। दवा, पानी, वॉक, BP चेक, या शुगर चेक से शुरू करें।"
                  )}
                </div>
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{reminder.title}</h3>
                        <p className="text-sm text-[var(--muted)]">{reminder.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setReminders((current) =>
                              current.map((item) =>
                                item.id === reminder.id
                                  ? { ...item, done: !item.done }
                                  : item
                              )
                            )
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            reminder.done
                              ? "bg-emerald-400 text-slate-950"
                              : "border border-[color:var(--border)] bg-[color:var(--surface)]"
                          }`}
                        >
                          {reminder.done
                            ? localize("Done", "पूरा")
                            : localize("Mark done", "मार्क करें")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReminders((current) =>
                              current.filter((item) => item.id !== reminder.id)
                            )
                          }
                          className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200"
                        >
                          {localize("Delete", "हटाएं")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
