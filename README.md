# RoboDoctor AI

RoboDoctor AI is a Next.js health-screening app with:

- vital risk screening for BP, sugar, pulse, BMI, and symptoms
- skin-check triage with image upload and backend AI analysis
- emergency guidance
- recent report history with local storage and Firestore cloud save for signed-in users

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Environment

Create `.env.local` from `.env.example` and add:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_SKIN_MODEL=gpt-4.1-mini
```

If no OpenAI key is set, skin analysis automatically falls back to the built-in rule engine.

## Firebase

This app already includes Firebase Auth config. To use cloud history:

1. Enable Firestore in the `robodoctor-ai` Firebase project.
2. Apply the rules from `firestore.rules` so users can access only their own report data.
3. Sign in through the app before saving reports.

Suggested Firestore structure:

- `users/{uid}/healthReports`
- `users/{uid}/skinReports`

## Reports dashboard

Signed-in users can open:

- `http://127.0.0.1:3000/reports`

This page loads cloud-backed health and skin reports from Firestore.

## Current backend AI flow

The skin screening API route is:

- `app/api/skin-analysis/route.ts`

It sends the uploaded image plus symptom details to the OpenAI Responses API when `OPENAI_API_KEY` is available, and otherwise uses local screening rules.
