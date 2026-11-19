# RoleReady

RoleReady is an AI-powered mock interview simulator. Pick a role, choose an interview type and difficulty, and practice a realistic interview with a streaming AI interviewer — then get a structured scorecard so you can track your improvement over time.

## Features

- **Role setup** — enter a target role, optionally add a company and job description to tailor the interview.
- **Interview types** — behavioral, technical, or mixed; difficulty from junior to senior.
- **Realistic interviewer** — a conversational AI interviewer asks 5–8 questions with follow-ups, streaming word by word.
- **AI scorecard** — when the session ends, you get 0–100 scores across communication, technical accuracy, STAR method, and confidence, plus strengths, improvement areas, and a rewritten "best answer".
- **Session history** — completed interviews are saved so you can review scorecards and see progress.
- **Auth** — sign in with Google OAuth or email/password.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Vercel AI SDK](https://sdk.vercel.ai) with Google Gemini (`@ai-sdk/google`) and Groq fallback (`@ai-sdk/groq`)
- [NextAuth v5](https://authjs.dev) (Google OAuth + credentials)
- [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL on [Neon](https://neon.tech)
- Tailwind CSS, Zod

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database ([Neon](https://neon.tech) free tier works well)
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini
- A [Groq](https://console.groq.com/keys) API key for AI fallback
- (Optional) Google OAuth credentials if you want Google sign-in

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (see `.env.example`):

```bash
# PostgreSQL connection string (Neon)
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=       # generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional — for Google sign-in)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google AI Studio (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=

# Groq fallback
GROQ_API_KEY=
```

### 3. Set up the database

Push the Drizzle schema to your database:

```bash
npm run db:push
```

Other useful commands:

```bash
npm run db:generate   # generate migration files
npm run db:migrate    # run migrations
npm run db:studio     # browse data in Drizzle Studio
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start your first interview.

Gemini is the primary AI provider. Temporary 429, 502, 503, and 504 errors are retried with backoff before the request is attempted with Groq. API keys are used only by server-side routes.

For a production build:

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/
    page.tsx                        # Landing page
    (auth)/                         # Login & register pages
    (dashboard)/                    # Authed app shell
      dashboard/                    # Home after sign-in
      interview/new/                # Interview setup form
      interview/[sessionId]/        # Live interview room (chat UI)
      sessions/                     # Session history + scorecard view
      profile/                      # Profile / sign out
    api/
      auth/[...nextauth]/           # NextAuth handlers
      chat/                         # Streaming interview chat (streamText)
      register/                     # Email/password signup
      scorecard/                    # Scorecard generation (generateObject)
      sessions/                     # Session create / detail
  actions/                          # Server actions
  components/                       # UI components (sidebar, brand, forms)
  lib/
    ai/                             # Provider selection, retry/fallback, prompts, scorecard schema
    auth.ts                         # NextAuth config
    db/                             # Drizzle client, schema, queries
  middleware.ts                     # Protects /dashboard, /interview, /sessions
```

## Deployment

RoleReady is designed to deploy on [Vercel](https://vercel.com) with a Neon PostgreSQL database:

1. Create a Neon database and copy the connection string.
2. Import the repo into Vercel and add all environment variables from the list above (set `NEXTAUTH_URL` to your production URL).
3. Run `npm run db:push` against the production database once (or use migrations).
4. Deploy — Vercel will detect Next.js automatically.
