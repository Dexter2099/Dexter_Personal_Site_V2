# Dexter Personal Site V2

Dark editorial software developer portfolio built with Astro, TypeScript, and plain CSS.

## Setup

Use Node.js 22.12 or newer (the checked-in `.node-version` selects 24.19.0 for Cloudflare Pages). Install the locked dependencies:

```bash
npm ci
```

Run locally:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `24.19.0` via `.node-version` and the production environment
- Production widget: `PUBLIC_PORTFOLIO_CHAT=true`; runtime configuration and secrets are managed in the existing Pages project.

## Portfolio chatbot

Use `npm run chat:openai` for local OpenAI testing, or `npm run chat:local` for a preview without API calls. Open http://127.0.0.1:8788. See [local testing and API setup](docs/chatbot-local-testing.md) and [production operation](docs/chatbot-production.md) for spending controls, logs, knowledge updates and deployment. Ordinary builds require the production widget environment flag; `npm run chat:build` explicitly enables it for testing.
