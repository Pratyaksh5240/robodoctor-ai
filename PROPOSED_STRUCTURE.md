# RoboDoctor AI — Proposed Structure for AI Health Assistant Features

> **Important:** This document is a proposal only. No existing files have been
> modified, deleted, or refactored. All new items described here are **additive**
> — they will live in new files/folders so that zero existing functionality is
> broken.

---

## 1. Current Repository Structure

```
robodoctor-ai/
├── app/
│   ├── ai-chatbot/          # Rule-based symptom chatbot (existing)
│   ├── api/
│   │   └── skin-analysis/   # OpenAI-backed skin-triage API route (existing)
│   ├── basic-medicines/     # Static medicine info page (existing)
│   ├── context/
│   │   └── LanguageContext.tsx
│   ├── dashboard/           # User dashboard (existing)
│   ├── diet-planner/        # Static diet-planner page (existing)
│   ├── emergency-contacts/  # Emergency contacts page (existing)
│   ├── emergency-guide/     # First-aid / emergency guide (existing)
│   ├── first-aid/           # First-aid steps (existing)
│   ├── health-check/        # Vitals form + voice input (existing)
│   ├── lab-report/          # Rule-based lab-value interpreter (existing)
│   ├── login/               # Firebase auth login page (existing)
│   ├── medicine-reminder/   # localStorage-based reminder list (existing)
│   ├── nearby-care/         # Nearby clinic finder (existing)
│   ├── reports/             # Cloud + local report history (existing)
│   ├── signup/              # Firebase auth signup page (existing)
│   ├── skin-check/          # Skin-triage UI (existing)
│   ├── yoga-videos/         # Yoga video library (existing)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Home / landing page (existing)
│
├── components/
│   ├── AuthGate.tsx
│   ├── AuthProvider.tsx
│   ├── Background3D.tsx
│   ├── LanguageSwitcher.tsx
│   ├── ReportsCharts.tsx
│   └── ThemeToggle.tsx
│
├── lib/
│   ├── firebase.ts
│   ├── healthAnalysis.ts
│   ├── healthAnalysisI18n.ts
│   ├── reportHistory.ts
│   ├── skinAnalysis.ts
│   └── uiI18n.ts
│
├── firestore.rules
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. Proposed New Files & Folders (5 Features)

```
robodoctor-ai/
│
├── app/
│   ├── api/                              ← EXISTING folder — add new sub-routes only
│   │   ├── skin-analysis/               (existing — untouched)
│   │   │
│   │   ├── gemini-chat/                 ← NEW  Feature 1
│   │   │   └── route.ts                 #  Gemini-powered chat endpoint
│   │   │
│   │   ├── report-analysis/             ← NEW  Feature 2
│   │   │   └── route.ts                 #  Gemini-powered medical report / X-ray endpoint
│   │   │
│   │   ├── risk-detection/              ← NEW  Feature 3
│   │   │   └── route.ts                 #  Risk & urgency classification endpoint
│   │   │
│   │   ├── personalized-suggestions/    ← NEW  Feature 4
│   │   │   └── route.ts                 #  Gemini-powered diet / precaution suggestions endpoint
│   │   │
│   │   └── smart-reminders/             ← NEW  Feature 5
│   │       └── route.ts                 #  Smart reminder scheduling / notification endpoint
│   │
│   ├── gemini-chat/                     ← NEW  Feature 1 (UI page)
│   │   └── page.tsx                     #  Chat interface using Gemini
│   │
│   ├── report-analysis/                 ← NEW  Feature 2 (UI page)
│   │   └── page.tsx                     #  Upload medical report / X-ray + Gemini explanation UI
│   │
│   ├── risk-detection/                  ← NEW  Feature 3 (UI page)
│   │   └── page.tsx                     #  Displays risk level badge around existing outputs
│   │
│   ├── personalized-suggestions/        ← NEW  Feature 4 (UI page)
│   │   └── page.tsx                     #  Shows AI-generated diet, precautions & next steps
│   │
│   └── smart-reminders/                 ← NEW  Feature 5 (UI page)
│       └── page.tsx                     #  Smart reminder manager (browser notifications + schedules)
│
├── lib/
│   ├── firebase.ts                      (existing — untouched)
│   ├── healthAnalysis.ts                (existing — untouched)
│   ├── healthAnalysisI18n.ts            (existing — untouched)
│   ├── reportHistory.ts                 (existing — untouched)
│   ├── skinAnalysis.ts                  (existing — untouched)
│   ├── uiI18n.ts                        (existing — untouched)
│   │
│   ├── geminiService.ts                 ← NEW  shared Gemini API helper (Features 1, 3, 4)
│   ├── reportAnalysis.ts                ← NEW  report / image analysis helpers (Feature 2)
│   ├── riskDetection.ts                 ← NEW  risk-level classification logic (Feature 3)
│   ├── personalizedSuggestions.ts       ← NEW  suggestion generation helpers (Feature 4)
│   └── smartReminders.ts               ← NEW  reminder scheduling helpers (Feature 5)
│
└── .env.local  (update with new keys — NOT committed to git)
    # GEMINI_API_KEY=your_gemini_api_key_here
    # (existing) OPENAI_API_KEY=your_openai_api_key_here
```

---

## 3. Feature-by-Feature Breakdown

### Feature 1 — Conversational AI (Gemini)

| Item | Path | Purpose |
|------|------|---------|
| Gemini helper | `lib/geminiService.ts` | Shared wrapper around `@google/generative-ai` SDK. Reads `GEMINI_API_KEY` from env. |
| API route | `app/api/gemini-chat/route.ts` | Accepts `{ messages, systemPrompt }` JSON body → streams/returns Gemini response. |
| UI page | `app/gemini-chat/page.tsx` | Chat interface: user types symptoms → Gemini asks follow-ups → structured reply shown. Mirrors the style of the existing `app/ai-chatbot/page.tsx`. |

**Integration:** Add a card/link on `app/page.tsx` pointing to `/gemini-chat` — no existing code changed; the new card is appended.

---

### Feature 2 — Report / Image Understanding

| Item | Path | Purpose |
|------|------|---------|
| Report helpers | `lib/reportAnalysis.ts` | Utility types and parsing helpers for lab/X-ray reports. |
| API route | `app/api/report-analysis/route.ts` | Accepts a base-64 image or PDF text + context → calls Gemini Vision → returns plain-language explanation. |
| UI page | `app/report-analysis/page.tsx` | Upload widget (image or PDF) + explanation card. Styled like `app/skin-check/page.tsx`. |

**Integration:** Completely independent of `app/api/skin-analysis`. No shared code paths.

---

### Feature 3 — Risk & Urgency Detection

| Item | Path | Purpose |
|------|------|---------|
| Risk logic | `lib/riskDetection.ts` | Pure function `classifyRisk(analysisOutput) → "low" | "medium" | "high"`. Can wrap any analysis result without modifying the producers. |
| API route | `app/api/risk-detection/route.ts` | Thin wrapper that calls `classifyRisk` (and optionally Gemini for narrative). |
| UI page | `app/risk-detection/page.tsx` | Displays a risk badge + narrative for any pasted/uploaded analysis text. |

**Integration:** `riskDetection.ts` is a standalone pure function; existing pages can optionally import it in a future phase — no existing code touched now.

---

### Feature 4 — Personalized Suggestions

| Item | Path | Purpose |
|------|------|---------|
| Suggestion helpers | `lib/personalizedSuggestions.ts` | Types and helper stubs for suggestion categories (diet, precautions, next steps). |
| API route | `app/api/personalized-suggestions/route.ts` | Accepts user profile + findings → Gemini generates a personalised plan. |
| UI page | `app/personalized-suggestions/page.tsx` | Form for user profile + conditions → renders Gemini-generated cards for diet, precautions, and next steps. Mirrors style of `app/diet-planner/page.tsx`. |

**Integration:** Completely separate from the existing `app/diet-planner` page.

---

### Feature 5 — Smart Reminders (Optional)

| Item | Path | Purpose |
|------|------|---------|
| Reminder helpers | `lib/smartReminders.ts` | Utility functions for scheduling, notification-permission requests, and localStorage persistence. |
| API route | `app/api/smart-reminders/route.ts` | Optional server-side route for future push-notification or cloud-schedule support. |
| UI page | `app/smart-reminders/page.tsx` | Enhanced reminder manager with AI-suggested schedules. Extends the UX of `app/medicine-reminder` without modifying it. |

**Integration:** The existing `app/medicine-reminder/page.tsx` is untouched. The new page is a standalone module.

---

## 4. Environment Variables (`.env.local` additions)

```bash
# NEW — Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# EXISTING — keep as-is
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_SKIN_MODEL=gpt-4.1-mini
```

---

## 5. Safety Checklist

- [x] Zero existing files modified
- [x] Zero existing API routes changed
- [x] Zero existing UI pages changed
- [x] All new code lives in new files / new folders
- [x] API keys loaded from environment variables — no hardcoded secrets
- [x] New pages follow the same Next.js App-Router pattern (`"use client"` + `page.tsx`)
- [x] New API routes follow the same pattern as `app/api/skin-analysis/route.ts`
- [x] New lib helpers follow the same pattern as `lib/skinAnalysis.ts`
