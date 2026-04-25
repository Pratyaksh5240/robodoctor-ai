"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

type ReportAnalysis = {
  summary: string;
  findings: string[];
  recommendations: string[];
  urgency: "low" | "moderate" | "high" | "emergency";
  disclaimer: string;
};

const urgencyColors: Record<string, string> = {
  low: "text-emerald-400",
  moderate: "text-amber-400",
  high: "text-orange-400",
  emergency: "text-rose-400",
};

const urgencyBg: Record<string, string> = {
  low: "bg-emerald-500/10 border-emerald-500/30",
  moderate: "bg-amber-500/10 border-amber-500/30",
  high: "bg-orange-500/10 border-orange-500/30",
  emergency: "bg-rose-500/10 border-rose-500/30",
};

export default function ReportAnalysisPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("medical report");
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageDataUrl && !reportText.trim()) {
      setStatusMessage(
        localize(
          "Please upload an image or enter report text.",
          "कृपया एक इमेज अपलोड करें या रिपोर्ट टेक्स्ट दर्ज करें।"
        )
      );
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setStatusMessage("");

    try {
      const response = await fetch("/api/gemini-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, reportText, reportType, language }),
      });

      const data = (await response.json()) as {
        analysis?: ReportAnalysis;
        error?: string;
      };

      if (data.error) {
        setStatusMessage(data.error);
      } else if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch {
      setStatusMessage(
        localize(
          "Analysis failed. Please try again.",
          "विश्लेषण विफल। कृपया फिर कोशिश करें।"
        )
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
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-sky-400">
              {localize("Gemini AI", "जेमिनी एआई")}
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("Report & Image Analysis", "रिपोर्ट और इमेज विश्लेषण")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Upload an X-ray, scan, or lab report image for a plain-language AI explanation.",
                "X-ray, स्कैन, या लैब रिपोर्ट इमेज अपलोड करें और AI द्वारा आसान भाषा में समझाएं।"
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

        {/* Input form */}
        <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-6">
          {/* Report type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize("Report / Scan Type", "रिपोर्ट / स्कैन प्रकार")}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
            >
              <option value="medical report">{localize("Medical Report", "मेडिकल रिपोर्ट")}</option>
              <option value="X-ray">{localize("X-Ray", "एक्स-रे")}</option>
              <option value="MRI scan">{localize("MRI Scan", "MRI स्कैन")}</option>
              <option value="CT scan">{localize("CT Scan", "CT स्कैन")}</option>
              <option value="blood test report">{localize("Blood Test Report", "ब्लड टेस्ट रिपोर्ट")}</option>
              <option value="ultrasound report">{localize("Ultrasound Report", "अल्ट्रासाउंड रिपोर्ट")}</option>
              <option value="ECG report">{localize("ECG Report", "ECG रिपोर्ट")}</option>
            </select>
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize("Upload Report Image (optional)", "रिपोर्ट इमेज अपलोड करें (वैकल्पिक)")}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm"
            />
            {imageDataUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Uploaded report"
                  className="max-h-48 rounded-2xl object-contain border border-[color:var(--border)]"
                />
              </div>
            )}
          </div>

          {/* Report text */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {localize(
                "Or paste report values / text (optional)",
                "या रिपोर्ट वैल्यू / टेक्स्ट पेस्ट करें (वैकल्पिक)"
              )}
            </label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={localize(
                "E.g. Hemoglobin: 10.2 g/dL, WBC: 11000, Platelets: 150000...",
                "जैसे: हीमोग्लोबिन: 10.2 g/dL, WBC: 11000, प्लेटलेट्स: 150000..."
              )}
              rows={4}
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
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-sky-500 px-8 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? localize("Analyzing...", "विश्लेषण हो रहा है...")
                : localize("Analyze with Gemini", "Gemini से विश्लेषण करें")}
            </button>
            {(imageDataUrl || reportText || analysis) && (
              <button
                onClick={() => {
                  setImageDataUrl(null);
                  setReportText("");
                  setAnalysis(null);
                  setStatusMessage("");
                }}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3"
              >
                {localize("Reset", "रीसेट")}
              </button>
            )}
          </div>
        </div>

        {/* Analysis results */}
        {analysis && (
          <div className="mt-8 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-6">
            <h2 className="text-2xl font-black">
              {localize("Analysis Result", "विश्लेषण परिणाम")}
            </h2>

            {/* Urgency badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${urgencyBg[analysis.urgency] ?? urgencyBg.low}`}>
              <span className={urgencyColors[analysis.urgency] ?? urgencyColors.low}>
                ●
              </span>
              {localize("Urgency", "तात्कालिकता")}:{" "}
              <span className={urgencyColors[analysis.urgency] ?? urgencyColors.low}>
                {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)}
              </span>
            </div>

            {/* Summary */}
            <div>
              <h3 className="mb-2 text-lg font-bold text-sky-400">
                {localize("Summary", "सारांश")}
              </h3>
              <p className="text-[var(--foreground)]">{analysis.summary}</p>
            </div>

            {/* Findings */}
            {analysis.findings.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-bold text-amber-400">
                  {localize("Key Findings", "मुख्य निष्कर्ष")}
                </h3>
                <ul className="space-y-2">
                  {analysis.findings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-amber-400">▸</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-bold text-emerald-400">
                  {localize("Recommendations", "सुझाव")}
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 text-emerald-400">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <p className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3 text-xs text-[var(--muted)]">
              ⚠ {analysis.disclaimer}
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {localize(
            "Powered by Google Gemini · Not a medical diagnosis · Always consult a qualified doctor",
            "Google Gemini द्वारा संचालित · चिकित्सीय निदान नहीं · हमेशा योग्य डॉक्टर से मिलें"
          )}
        </p>
      </div>
    </div>
  );
}
