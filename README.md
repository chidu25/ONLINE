# Uncensored OpenRouter Chat

A Vercel-ready Next.js app that routes every prompt through uncensored OpenRouter models and stores the entire
conversation history on the server in SQLite.

## Features

- ⚡ **OpenRouter-powered** — Defaults to `nousresearch/nous-hermes-llama2-13b`, but you can swap to any
  uncensored model exposed by OpenRouter.
- 🧠 **Persistent memory** — Messages are stored on disk using SQLite so conversations survive reloads and new
  deployments.
- 🔒 **Server-only secrets** — The browser never sees your `OPENROUTER_API_KEY`; requests are routed through
  secure Next.js Route Handlers.
- 🚀 **Vercel ready** — Works locally with `next dev` and deploys cleanly to Vercel. Just add your environment
  variables and a persistent storage option (Vercel KV, Turso, etc.) if you want production-grade durability.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the example file and set your secrets:

   ```bash
   cp .env.example .env.local
   # fill in OPENROUTER_API_KEY and optionally OPENROUTER_MODEL, APP_BASE_URL
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000 to start chatting.

## Deployment

- Set the same environment variables in Vercel (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `APP_BASE_URL`).
- Provision a persistent database. For Vercel you can point `lib/db.ts` at Vercel KV, Turso, Neon, or another
  managed SQLite/Postgres service by replacing the helper functions.
- `npm run build && npm run start` is the production command sequence.

## Storage format

SQLite lives at `data/chat.sqlite` and keeps a `messages` table with columns:

| column      | type    | notes                     |
| ----------- | ------- | ------------------------- |
| id          | integer | autoincrement primary key |
| session_id  | text    | identifies the chat room  |
| role        | text    | `user` or `assistant`     |
| content     | text    | raw message body          |
| created_at  | text    | ISO timestamp             |

Use the session selector at the top of the UI to jump between conversations instantly.
