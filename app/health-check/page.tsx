"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Language,
  supportedLanguages,
  useLanguage,
} from "../context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<
    ArrayLike<{
      transcript: string;
    }>
  >;
};

const voicePatterns = {
  age: /(age|umr|उम्र)\s*(\d+)/,
  sugar: /(sugar|shugar|शुगर)\s*(\d+)/,
  heartRate: /(heart rate|pulse|हार्ट रेट|नाड़ी)\s*(\d+)/,
  weight: /(weight|wazan|वजन)\s*(\d+)/,
  height: /(height|lambai|लंबाई)\s*(\d+)/,
  bp: /(\d+)\s*(over|\/|बाय|पर)\s*(\d+)/,
};

const speechLocales: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  zh: "zh-CN",
  ko: "ko-KR",
};

export default function HealthCheck() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    bp: "",
    sugar: "",
    heartRate: "",
    symptoms: "",
  });

  const [isListening, setIsListening] = useState(false);
  const [knowsReadings, setKnowsReadings] = useState(true);

  const measurementGuide = [
    {
      key: "bp",
      title: localize("How to check blood pressure", "ब्लड प्रेशर कैसे लें"),
      detail: isHindi
        ? "डिजिटल BP मशीन का उपयोग करें। बैठकर 5 मिनट आराम करें, हाथ को सीधा रखें, फिर रीडिंग लें।"
        : translateUi(
            "Use a digital BP machine. Sit calmly for 5 minutes, keep your arm supported, then take the reading.",
            language
          ),
    },
    {
      key: "heartRate",
      title: localize("How to check heart rate", "हार्ट रेट कैसे देखें"),
      detail: isHindi
        ? "कलाई या गर्दन की नाड़ी 60 सेकंड तक गिनें, या smartwatch/oximeter का उपयोग करें।"
        : translateUi(
            "Count your pulse at the wrist or neck for 60 seconds, or use a smartwatch or oximeter.",
            language
          ),
    },
    {
      key: "sugar",
      title: localize("How to check blood sugar", "ब्लड शुगर कैसे जांचें"),
      detail: isHindi
        ? "ग्लूकोमीटर से जांच करें। सुबह खाली पेट की रीडिंग फास्टिंग शुगर मानी जाती है।"
        : translateUi(
            "Use a glucometer. A morning reading before food is usually considered fasting sugar.",
            language
          ),
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const startVoiceInput = () => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(translateUi("Voice recognition not supported in this browser.", language));
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = speechLocales[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0].transcript.toLowerCase();

      const ageMatch = transcript.match(voicePatterns.age);
      const sugarMatch = transcript.match(voicePatterns.sugar);
      const heartMatch = transcript.match(voicePatterns.heartRate);
      const weightMatch = transcript.match(voicePatterns.weight);
      const heightMatch = transcript.match(voicePatterns.height);
      const bpMatch = transcript.match(voicePatterns.bp);

      setFormData((prev) => ({
        ...prev,
        age: ageMatch ? ageMatch[2] : prev.age,
        sugar: sugarMatch ? sugarMatch[2] : prev.sugar,
        heartRate: heartMatch ? heartMatch[2] : prev.heartRate,
        weight: weightMatch ? weightMatch[2] : prev.weight,
        height: heightMatch ? heightMatch[2] : prev.height,
        bp: bpMatch ? `${bpMatch[1]}/${bpMatch[3]}` : prev.bp,
        symptoms: transcript,
      }));

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const age = Number(formData.age);
    const height = Number(formData.height);
    const weight = Number(formData.weight);
    const sugar = formData.sugar ? Number(formData.sugar) : null;
    const heartRate = formData.heartRate ? Number(formData.heartRate) : null;

    if ([age, height, weight, sugar, heartRate].some((value) => value !== null && value < 0)) {
      alert(t.negativeAlert);
      return;
    }

    if (
      age > 120 ||
      height > 250 ||
      weight > 300 ||
      (sugar !== null && sugar > 500) ||
      (heartRate !== null && heartRate > 220)
    ) {
      alert(t.unrealisticAlert);
      return;
    }

    if (height < 80 || height > 250) {
      alert(t.heightAlert);
      return;
    }

    if (formData.bp && !/^\d{2,3}\s*\/\s*\d{2,3}$/.test(formData.bp.trim())) {
      alert(t.bpAlert);
      return;
    }

    const query = new URLSearchParams({
      ...formData,
      language,
    }).toString();
    router.push(`/dashboard?${query}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)] md:p-16">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-4xl font-bold"
      >
        {t.healthCheck}
      </motion.h1>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="mb-6 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2"
      >
        {supportedLanguages.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <motion.button
        onClick={startVoiceInput}
        whileHover={{ scale: 1.02 }}
        className="mb-4 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
      >
        {t.speak}
      </motion.button>

      {isListening && (
        <div className="mb-8 rounded-xl border border-cyan-500 bg-[color:var(--surface-strong)] p-6">
          <p className="mb-2 font-semibold text-cyan-400">{t.listening}</p>
          <p className="mt-2 italic text-[var(--muted)]">{t.example}</p>
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {localize("How to take your readings", "रीडिंग कैसे लें")}
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              {localize(
                "If you do not know your BP, heart rate, or sugar yet, here is the quickest way to measure them.",
                "अगर आपको BP, हार्ट रेट या शुगर नहीं पता, तो पहले ऐसे नाप सकते हैं।"
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setKnowsReadings((current) => !current)}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-400/20"
          >
            {knowsReadings
              ? isHindi
                ? "मुझे ये रीडिंग नहीं पता"
                : translateUi("I don't know these readings", language)
              : isHindi
                ? "मुझे रीडिंग पता है"
                : translateUi("I know my readings", language)}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {measurementGuide.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.detail}</p>
            </div>
          ))}
        </div>

        {!knowsReadings && (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {localize(
              "You can still continue now. Enter age, height, weight, and symptoms, and leave BP, sugar, and heart rate blank.",
              "आप अभी भी फॉर्म भर सकते हैं। उम्र, लंबाई, वजन और लक्षण दर्ज करें, और BP / शुगर / हार्ट रेट खाली छोड़ दें।"
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.age}</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min={0}
            max={120}
            placeholder="25"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.weight}</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            min={0}
            max={300}
            placeholder="70"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.height}</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
            min={80}
            max={250}
            placeholder="170"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.bloodPressure}</label>
          <input
            type="text"
            name="bp"
            value={formData.bp}
            onChange={handleChange}
            placeholder="120/80"
            disabled={!knowsReadings}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
          {!knowsReadings && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              {localize("Leave this blank if you do not know your BP yet.", "BP न पता हो तो यह फील्ड खाली रह सकती है।")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.bloodSugar}</label>
          <input
            type="number"
            name="sugar"
            value={formData.sugar}
            onChange={handleChange}
            min={0}
            max={500}
            placeholder="95"
            disabled={!knowsReadings}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
          {!knowsReadings && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              {localize("Leave this blank if you do not know your sugar reading yet.", "शुगर न पता हो तो यह फील्ड खाली रह सकती है।")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[var(--muted)]">{t.heartRate}</label>
          <input
            type="number"
            name="heartRate"
            value={formData.heartRate}
            onChange={handleChange}
            min={0}
            max={220}
            placeholder="72"
            disabled={!knowsReadings}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
          {!knowsReadings && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              {localize("Leave this blank if you do not know your heart rate yet.", "हार्ट रेट न पता हो तो यह फील्ड खाली रह सकती है।")}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-[var(--muted)]">{t.symptoms}</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows={4}
            placeholder="fever, cough, cold"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
          />
        </div>

        <div className="mt-4 md:col-span-2">
          <p className="mb-4 text-sm text-[var(--muted)]">{t.disclaimer}</p>
          <button
            type="submit"
            className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-black hover:bg-cyan-400"
          >
            {t.analyze}
          </button>
        </div>
      </form>
    </div>
  );
}
