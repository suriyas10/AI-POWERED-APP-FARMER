# Student Daily Planner

## What the App Does
Student Daily Planner is an AI-powered web app that helps students manage their daily academic tasks. Enter any subject you're studying and Claude (Anthropic's AI) will suggest 3 relevant tasks instantly.

## Live Demo
> Deploy to Vercel and add your link here:
> https://your-app.vercel.app

## Core Screens
1. **Login** — Email-based login, no password needed
2. **Home / Tasks** — View, add, complete, and delete tasks
3. **AI Suggester** — Type a subject → Claude returns 3 study tasks
4. **About** — App description

## Tech Stack
- Next.js 14 (App Router)
- React 18
- Anthropic Claude API (`claude-haiku-4-5-20251001`)
- Vercel deployment

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set your API key
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 3. Start dev server
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — get one at console.anthropic.com |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at vercel.com/new
3. Add `ANTHROPIC_API_KEY` under Settings → Environment Variables
4. Click Deploy

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Email login, returns user object |
| GET | `/api/tasks` | Fetch all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/[id]` | Update task (toggle complete) |
| DELETE | `/api/tasks/[id]` | Delete a task |
| POST | `/api/ai` | Get 3 AI task suggestions for a subject |

## AI Feature — How It Works
1. User types a subject (e.g. "calculus exam prep")
2. App sends a POST to `/api/ai` with the subject
3. Claude returns a JSON array of 3 tasks with priorities
4. User clicks "Add" or "Add all 3 tasks" to add them to their list

## Error Handling & Guardrails
- Empty or invalid prompts are rejected (400)
- AI route wrapped in try/catch — returns friendly error on failure (500)
- Prompt capped at 500 characters to prevent abuse
- Login validates email format before calling API
