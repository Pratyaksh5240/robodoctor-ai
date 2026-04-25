"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

const aiFeatures = [
  {
    key: "gemini-chat",
    titleEn: "Conversational AI Chat",
    titleHi: "वार्तालाप AI चैट",
    descriptionEn:
      "Chat with Google Gemini about your symptoms, readings, and health concerns. Get intelligent, context-aware follow-up guidance.",
    descriptionHi:
      "अपने लक्षण, रीडिंग और स्वास्थ्य चिंताओं के बारे में Google Gemini से चैट करें।",
    href: "/gemini-chat",
    accent: "from-violet-400/30 to-indigo-500/30",
    color: "text-violet-400",
    icon: "💬",
  },
  {
    key: "report-analysis",
    titleEn: "Report & Image Analysis",
    titleHi: "रिपोर्ट और इमेज विश्लेषण",
    descriptionEn:
      "Upload an X-ray, MRI, blood test, or any medical report image. Gemini explains findings in plain language.",
    descriptionHi:
      "X-ray, MRI, ब्लड टेस्ट या कोई मेडिकल रिपोर्ट इमेज अपलोड करें। Gemini आसान भाषा में समझाता है।",
    href: "/report-analysis",
    accent: "from-sky-400/30 to-cyan-500/30",
    color: "text-sky-400",
    icon: "🔬",
  },
  {
    key: "risk-detection",
    titleEn: "AI Risk & Urgency Detection",
    titleHi: "AI जोखिम और तात्कालिकता पहचान",
    descriptionEn:
      "Enter symptoms and vitals to get an AI-powered risk classification: Low, Medium, High, or Emergency.",
    descriptionHi:
      "लक्षण और वाइटल्स दर्ज करें और AI-संचालित जोखिम वर्गीकरण पाएं: Low, Medium, High, या Emergency।",
    href: "/risk-detection",
    accent: "from-orange-400/30 to-rose-500/30",
    color: "text-orange-400",
    icon: "⚡",
  },
  {
    key: "personalized-care",
    titleEn: "Personalized Health Suggestions",
    titleHi: "व्यक्तिगत स्वास्थ्य सुझाव",
    descriptionEn:
      "Get Gemini-powered diet, lifestyle, precautions, and next steps tailored to your health condition.",
    descriptionHi:
      "अपनी स्वास्थ्य स्थिति के अनुसार Gemini-संचालित आहार, जीवनशैली, सावधानी और अगले कदम पाएं।",
    href: "/personalized-care",
    accent: "from-emerald-400/30 to-lime-500/30",
    color: "text-emerald-400",
    icon: "🌱",
  },
  {
    key: "smart-reminders",
    titleEn: "Smart AI Reminders",
    titleHi: "स्मार्ट AI रिमाइंडर",
    descriptionEn:
      "Let Gemini create a personalized daily health reminder schedule based on your conditions and medications.",
    descriptionHi:
      "Gemini को आपकी स्थितियों और दवाओं के आधार पर एक व्यक्तिगत दैनिक स्वास्थ्य रिमाइंडर शेड्यूल बनाने दें।",
    href: "/smart-reminders",
    accent: "from-indigo-400/30 to-purple-500/30",
    color: "text-indigo-400",
    icon: "⏰",
  },
];

export default function AiFeaturesPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const localize = (english: string, hindi: string) =>
    isHindi ? hindi : translateUi(english, language);

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-400">
              {localize("New", "नया")} · Google Gemini
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              {localize("AI Health Features", "AI स्वास्थ्य फीचर्स")}
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--muted)]">
              {localize(
                "Powered by Google Gemini — five new intelligent health tools built on top of RoboDoctor AI.",
                "Google Gemini द्वारा संचालित — RoboDoctor AI पर बनाए गए पांच नए बुद्धिमान स्वास्थ्य उपकरण।"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm hover:opacity-90"
            >
              {localize("Back Home", "होम पर वापस")}
            </Link>
          </div>
        </div>

        {/* Gemini API key notice */}
        <div className="mb-8 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-6 py-4">
          <p className="text-sm text-amber-300">
            <span className="font-bold">
              {localize("Setup required:", "सेटअप आवश्यक:")}
            </span>{" "}
            {localize(
              "Add your Google Gemini API key as GEMINI_API_KEY in your .env.local file to enable AI responses. Without it, built-in fallback responses are used.",
              "AI प्रतिक्रियाएं सक्षम करने के लिए अपनी .env.local फ़ाइल में GEMINI_API_KEY जोड़ें। इसके बिना, बिल्ट-इन फ़ॉलबैक प्रतिक्रियाएं उपयोग की जाती हैं।"
            )}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature) => (
            <Link
              key={feature.key}
              href={feature.href}
              className={`group relative overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-gradient-to-br p-6 transition-all hover:scale-[1.02] hover:border-[color:var(--border)] ${feature.accent}`}
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <p className={`mb-1 text-sm font-semibold uppercase tracking-wider ${feature.color}`}>
                Gemini AI
              </p>
              <h2 className="mb-2 text-xl font-black">
                {isHindi ? feature.titleHi : feature.titleEn}
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {isHindi ? feature.descriptionHi : feature.descriptionEn}
              </p>
              <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${feature.color}`}>
                {localize("Open", "खोलें")} →
              </div>
            </Link>
          ))}
        </div>

        {/* Powered by note */}
        <div className="mt-10 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-5">
          <h3 className="mb-2 font-bold">
            {localize("How these features work", "ये फीचर्स कैसे काम करते हैं")}
          </h3>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li>
              {"→ "}
              {localize(
                "Each feature calls a dedicated Next.js API route (/api/gemini-*).",
                "प्रत्येक फीचर एक समर्पित Next.js API रूट (/api/gemini-*) को कॉल करता है।"
              )}
            </li>
            <li>
              {"→ "}
              {localize(
                "API routes use the GEMINI_API_KEY environment variable to call the Gemini REST API.",
                "API रूट्स Gemini REST API को कॉल करने के लिए GEMINI_API_KEY एनवायरनमेंट वेरिएबल का उपयोग करते हैं।"
              )}
            </li>
            <li>
              {"→ "}
              {localize(
                "If the API key is missing, all features gracefully fall back to built-in responses.",
                "यदि API key नहीं है, तो सभी फीचर्स स्वचालित रूप से बिल्ट-इन प्रतिक्रियाओं पर वापस आ जाते हैं।"
              )}
            </li>
            <li>
              {"→ "}
              {localize(
                "No existing code was modified. These are fully independent additions.",
                "कोई मौजूदा कोड नहीं बदला गया। ये पूरी तरह से स्वतंत्र जोड़ हैं।"
              )}
            </li>
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {localize(
            "Powered by Google Gemini · Responses are not medical diagnoses · Always consult a qualified doctor",
            "Google Gemini द्वारा संचालित · प्रतिक्रियाएं चिकित्सीय निदान नहीं हैं · हमेशा योग्य डॉक्टर से मिलें"
          )}
        </p>
      </div>
    </div>
  );
}
