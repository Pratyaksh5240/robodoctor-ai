# Gemini AI Features — Setup Guide

## New Features Added

Five new AI-powered features have been added to RoboDoctor AI using the Google Gemini API.  
**No existing files were modified.**

---

## Environment Variable Required

Add the following to your `.env.local` file (create it if it doesn't exist):

```bash
# Google Gemini API Key
# Get yours free at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

> If `GEMINI_API_KEY` is not set, all five features automatically fall back to
> built-in responses — no crash, no broken UI.

---

## How to Run Locally

```bash
npm install
npm run dev
```

Then open: **http://localhost:3000/ai-features**

---

## New Pages (accessible via URL)

| URL | Feature |
|-----|---------|
| `/ai-features` | Hub page — links to all five new features |
| `/gemini-chat` | Conversational AI Chat (Gemini) |
| `/report-analysis` | Report & Image Understanding |
| `/risk-detection` | Risk & Urgency Detection |
| `/personalized-care` | Personalized Health Suggestions |
| `/smart-reminders` | Smart AI Reminders |

---

## New API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/gemini-chat` | Multi-turn conversational chat |
| `POST /api/gemini-report` | Report / image analysis |
| `POST /api/gemini-risk` | Risk & urgency classification |
| `POST /api/gemini-suggestions` | Personalized diet & lifestyle suggestions |
| `POST /api/gemini-reminders` | Smart daily reminder generation |

---

## New Files Created

```
lib/
  geminiService.ts              # Shared Gemini REST API helper

app/
  ai-features/page.tsx          # Hub page for all new features
  gemini-chat/page.tsx          # Conversational AI chat UI
  report-analysis/page.tsx      # Report / image upload & analysis UI
  risk-detection/page.tsx       # Risk & urgency detection UI
  personalized-care/page.tsx    # Personalized suggestions UI
  smart-reminders/page.tsx      # Smart reminders UI

  api/
    gemini-chat/route.ts        # Chat API endpoint
    gemini-report/route.ts      # Report analysis API endpoint
    gemini-risk/route.ts        # Risk detection API endpoint
    gemini-suggestions/route.ts # Suggestions API endpoint
    gemini-reminders/route.ts   # Reminders API endpoint
```

---

## Safety

- Zero existing files were modified
- All new features have fallback responses when `GEMINI_API_KEY` is absent
- API keys are read from environment variables only — never hardcoded
- All responses include disclaimers that they are not medical diagnoses
