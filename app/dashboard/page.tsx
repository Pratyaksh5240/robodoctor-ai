"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { analyzeHealth, parseBloodPressure } from "@/lib/healthAnalysis";
import {
  getDashboardCopy,
  localizeHealthAnalysis,
} from "@/lib/healthAnalysisI18n";
import { auth } from "@/lib/firebase";
import { loadHealthReports, saveHealthReport } from "@/lib/reportHistory";
import { Language, parseLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

const severityStyles = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  watch: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
  urgent: "border-orange-500/30 bg-orange-500/10 text-orange-100",
  emergency: "border-red-500/40 bg-red-500/10 text-red-100",
};

function DashboardContent() {
  const params = useSearchParams();
  const language: Language = parseLanguage(params.get("language"));
  const copy = getDashboardCopy(language);
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [history, setHistory] = useState<
    Array<{
      createdAt: number;
      riskLevel: string;
      riskScore: number;
      summary: string;
      bp: string;
      sugar: string;
      heartRate: string;
    }>
  >(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem("robodoctor-health-history");
    return saved
      ? (JSON.parse(saved) as Array<{
          createdAt: number;
          riskLevel: string;
          riskScore: number;
          summary: string;
          bp: string;
          sugar: string;
          heartRate: string;
        }>)
      : [];
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("");

  const age = Number(params.get("age") || 0);
  const heightCm = Number(params.get("height") || 0);
  const weightKg = Number(params.get("weight") || 0);
  const sugarValue = params.get("sugar");
  const heartRateValue = params.get("heartRate");
  const bp = params.get("bp") || "";
  const symptoms = params.get("symptoms") || "";

  const { systolic, diastolic } = parseBloodPressure(bp);

  const analysis = localizeHealthAnalysis(
    analyzeHealth({
      age,
      heightCm,
      weightKg,
      systolic,
      diastolic,
      sugar: sugarValue ? Number(sugarValue) : null,
      heartRate: heartRateValue ? Number(heartRateValue) : null,
      symptoms,
    }),
    language
  );

  const localizedRiskLevel =
    analysis.riskLevel === "Low"
      ? copy.lowRisk
      : analysis.riskLevel === "Moderate"
        ? copy.moderateRisk
        : analysis.riskLevel === "High"
          ? copy.highRisk
          : copy.emergencyRisk;
  const riskSuffix = localize("Risk", "जोखिम");

  const historyEntry = useMemo(
    () => ({
      riskLevel: `${localizedRiskLevel} ${riskSuffix}`,
      riskScore: analysis.riskScore,
      summary: analysis.summary,
      bp: bp || "-",
      sugar: sugarValue || "-",
      heartRate: heartRateValue || "-",
    }),
    [
      analysis.riskScore,
      analysis.summary,
      bp,
      sugarValue,
      heartRateValue,
      localizedRiskLevel,
      riskSuffix,
    ]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null);
        return;
      }

      setUserId(user.uid);

      try {
        const cloudHistory = await loadHealthReports(user.uid);
        if (cloudHistory.length > 0) {
          setHistory(cloudHistory);
        }
      } catch {
        setSaveStatus(copy.saveLocal);
      }
    });

    return () => unsubscribe();
  }, [copy.saveLocal]);

  const alreadySaved = history.some(
    (item) =>
      item.summary === historyEntry.summary &&
      item.bp === historyEntry.bp &&
      item.sugar === historyEntry.sugar &&
      item.heartRate === historyEntry.heartRate
  );

  const saveReport = () => {
    if (alreadySaved) {
      return;
    }

    const reportToSave = {
      ...historyEntry,
      createdAt: Date.now(),
    };

    const nextHistory = [reportToSave, ...history].slice(0, 6);
    setHistory(nextHistory);
    localStorage.setItem("robodoctor-health-history", JSON.stringify(nextHistory));
    setSaveStatus(copy.saveLocal);

    if (userId) {
      saveHealthReport(userId, reportToSave)
        .then(() => {
          setSaveStatus(
            localize(
              "Report saved to your cloud history.",
              "रिपोर्ट आपकी क्लाउड हिस्ट्री में सेव हो गई।"
            )
          );
        })
        .catch(() => {
          setSaveStatus(
            localize(
              "Cloud save failed, but the report is still saved locally.",
              "क्लाउड सेव नहीं हो पाया, लेकिन रिपोर्ट लोकल में सेव है।"
            )
          );
        });
    }
  };

  const barData = [
    { name: copy.sugar, value: sugarValue ? Number(sugarValue) : 0 },
    { name: copy.heartRate, value: heartRateValue ? Number(heartRateValue) : 0 },
    { name: localize("Systolic BP", "सिस्टोलिक बीपी"), value: systolic ?? 0 },
    {
      name: localize("BMI x10", "बीएमआई x10"),
      value: analysis.bmi ? Number((analysis.bmi * 10).toFixed(1)) : 0,
    },
  ];

  const lineData = [
    { day: localize("Baseline", "पहले"), risk: 20 },
    { day: localize("Current", "अभी"), risk: analysis.riskScore || 15 },
  ];

  const allFindings = [...analysis.urgentFlags, ...analysis.possibleConcerns];

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)] md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm hover:opacity-90"
          >
            {copy.backHome}
          </Link>
        </div>
        <h1 className="mb-3 text-4xl font-bold">{copy.title}</h1>
        <p className="mb-8 text-[var(--muted)]">{copy.subtitle}</p>

        <div className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 shadow-xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              {copy.riskSummary}
            </p>
            <h2 className="mb-3 text-4xl font-bold" style={{ color: analysis.riskColor }}>
              {localizedRiskLevel} {riskSuffix}
            </h2>
            <p className="mb-6">{analysis.summary}</p>

            <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(analysis.riskScore, 8)}%`,
                  backgroundColor: analysis.riskColor,
                }}
              />
            </div>
            <p className="text-sm text-[var(--muted)]">
              {copy.riskScore}: {analysis.riskScore}/100
            </p>
            <button
              onClick={saveReport}
              disabled={alreadySaved}
              className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {alreadySaved ? copy.reportSaved : copy.saveReport}
            </button>
            {saveStatus && <p className="mt-3 text-sm text-[var(--muted)]">{saveStatus}</p>}

            {analysis.emergencyAdvice && (
              <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
                <p className="mb-1 font-semibold">{copy.emergencyAction}</p>
                <p>{analysis.emergencyAdvice}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 shadow-xl">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              {copy.inputSnapshot}
            </p>
            <div className="space-y-3">
              <p>
                {copy.age}: {age || "-"}
              </p>
              <p>
                {copy.weight}: {weightKg || "-"} kg
              </p>
              <p>
                {copy.height}: {heightCm || "-"} cm
              </p>
              <p>
                {copy.bp}: {bp || "-"}
              </p>
              <p>
                {copy.sugar}: {sugarValue || "-"} mg/dL
              </p>
              <p>
                {copy.heartRate}: {heartRateValue || "-"} bpm
              </p>
              <p>
                {copy.symptoms}: {symptoms || copy.noneProvided}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-lg">
            <h3 className="mb-6 text-xl font-semibold text-cyan-400">
              {copy.currentMetrics}
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-lg">
            <h3 className="mb-6 text-xl font-semibold text-cyan-400">
              {copy.riskTrend}
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke={analysis.riskColor}
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-green-400">
              {copy.measurements}
            </h3>
            <div className="space-y-3">
              {analysis.measurements.map((item) => (
                <div
                  key={`${item.label}-${item.detail}`}
                  className={`rounded-xl border p-3 ${severityStyles[item.severity]}`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-yellow-300">
              {copy.concerns}
            </h3>
            <div className="space-y-3">
              {analysis.possibleConcerns.length === 0 && (
                <p className="text-[var(--muted)]">{copy.noConcerns}</p>
              )}
              {analysis.possibleConcerns.map((item) => (
                <div
                  key={`${item.label}-${item.detail}`}
                  className={`rounded-xl border p-3 ${severityStyles[item.severity]}`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-[color:var(--surface-strong)] p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-red-400">
              {copy.urgentFlags}
            </h3>
            <div className="space-y-3">
              {analysis.urgentFlags.length === 0 && (
                <p className="text-[var(--muted)]">{copy.noUrgent}</p>
              )}
              {analysis.urgentFlags.map((item) => (
                <div
                  key={`${item.label}-${item.detail}`}
                  className={`rounded-xl border p-3 ${severityStyles[item.severity]}`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-cyan-500/20 bg-[color:var(--surface-strong)] p-8">
            <h2 className="mb-6 text-2xl font-semibold text-cyan-400">
              {copy.recommendations}
            </h2>
            <ul className="space-y-3">
              {analysis.recommendations.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span className="text-cyan-300">•</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8">
            <h2 className="mb-6 text-2xl font-semibold text-cyan-400">
              {copy.interpretation}
            </h2>
            {allFindings.length === 0 ? (
              <p className="text-[var(--muted)]">{copy.noSymptoms}</p>
            ) : (
              <ul className="space-y-3">
                {allFindings.map((item) => (
                  <li key={`${item.label}-${item.detail}`} className="flex gap-3">
                    <span style={{ color: analysis.riskColor }}>•</span>
                    <span>
                      <strong>{item.label}:</strong> {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8">
          <h2 className="mb-6 text-2xl font-semibold text-cyan-400">
            {copy.reports}
          </h2>
          {history.length === 0 ? (
            <p className="text-[var(--muted)]">{copy.noReports}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {history.map((item) => (
                <div
                  key={`${item.createdAt}-${item.summary}`}
                  className="rounded-2xl border border-[color:var(--border)] bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.riskLevel}</p>
                    <span className="text-sm text-[var(--muted)]">{item.riskScore}/100</span>
                  </div>
                  <p className="mt-2 text-sm">{item.summary}</p>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    BP {item.bp} | {copy.sugar} {item.sugar} | {copy.heartRate}{" "}
                    {item.heartRate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)] md:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 text-[var(--muted)]">
              {translateUi("Loading dashboard...", "en")}
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
