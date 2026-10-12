# Portfolio chatbot: production operation

Release date: 12 October 2026. Site: https://dexter-developer.dev (also served on www.dexter-developer.dev). Cloudflare Pages project: `dexter-developer`; production branch: `main` in `Dexter2099/Dexter_Personal_Site_V2`.

## Pages configuration

The existing Git integration builds with `npm run build`, output `dist`. Production environment variables include `PUBLIC_PORTFOLIO_CHAT=true` and `NODE_VERSION=24.19.0`. Compatibility date is 2026-10-12. Production D1 binding `CHAT_DB` points to `dexter-portfolio-chat-production`; migration identifiers are in `wrangler.production.jsonc`.

Pages runtime settings remain in the existing Cloudflare project rather than changing its source of truth to a root Wrangler file. `wrangler.production.jsonc` is explicitly used for database operations only; do not use it to overwrite Pages environment settings. The three existing Spotify secrets are preserved. Preview deployments have no chatbot key/database/enable configuration.

| Variable | Production value |
| --- | --- |
| CHAT_ENABLED | true |
| CHAT_PROVIDER | openai |
| CHAT_MODEL | gpt-5.4 |
| CHAT_LOCAL_ONLY | false |
| CHAT_DEVELOPMENT_MODE | false |
| CHAT_ALLOWED_ORIGINS | https://dexter-developer.dev,https://www.dexter-developer.dev |
| CHAT_MONTHLY_USD | 5 |
| CHAT_DAILY_USD | 0.75 |
| TURNSTILE_SITE_KEY | Public widget key in Cloudflare |

`OPENAI_API_KEY`, `CHAT_ID_SECRET` and `TURNSTILE_SECRET_KEY` are encrypted Pages secrets. They never enter client bundles. Local recovery copies use Windows DPAPI; Wrangler OAuth credentials use Windows Credential Manager. The managed Turnstile widget is restricted to dexter-developer.dev (including its subdomains); the API independently verifies the exact hostname and `portfolio-chat` action. The API also requires an exact same-origin request, valid consent and bounded JSON input. Pages preview domains remain disabled.

The US$5 live cap preserves half of the US$10 overall monthly allowance for development. It stays US$5 in subsequent months until deliberately changed. Do not raise both independent databases to US$10 or discard their accounting. Charges are conservatively tracked at standard token rates, including uncertain reservations, regardless of promotional credits.

## Public limits and privacy

Atomic D1 admission enforces one pending generation per session, 6 questions/minute and 30/hour per session, 12/minute and 60/hour per network, and 60/minute and 300/hour globally. Network hashes rotate daily; raw IP addresses are not stored. Duplicate question IDs never trigger another provider call. Monthly/daily/active-reply/request-rate failures are distinguished. Only temporary limits advise a retry delay.

Turnstile and Cloudflare's network protections complement these application controls. No custom zone WAF rate-limit rule was added. The API's token budget is enforced independently of the edge.

Only redacted, admitted submissions/replies are stored privately in D1. The unchecked consent control and expandable notice disclose retention and OpenAI model-improvement sharing before sending. Fixed privacy and obvious unrelated-task replies avoid API spending. The approved knowledge bundle is server-side, with no access to private source files at runtime.

## Maintenance and release

`dexter-portfolio-chat-maintenance` runs daily at 02:15 UTC (12:15 Brisbane). It shares production `CHAT_DB`, applies 90/365-day retention and refreshes the bounded public GitHub metric. Worker preview URLs and workers.dev are disabled; there is no public maintenance endpoint. Source/config: `workers/chat-maintenance.ts` and `workers/wrangler.maintenance.jsonc`.

```powershell
node node_modules/wrangler/bin/wrangler.js d1 migrations apply dexter-portfolio-chat-production --remote --config wrangler.production.jsonc
node node_modules/wrangler/bin/wrangler.js deploy --config workers/wrangler.maintenance.jsonc
npm run chat:check
npm run chat:test
npm test
npm run chat:build
npm audit --audit-level=low
```

After reviewing the staged diff and publishing `main`, wait for the Cloudflare Pages check to complete successfully. Verify the live home page, `On Rotation`, the correct email link, `/api/chat` configuration, Turnstile, an employer answer, a private-info refusal, an unrelated-task refusal, D1 accounting/log redaction and mobile layout. Inspect D1 through authenticated tools only; do not publish logs or create an unauthenticated admin endpoint.

For an urgent shutdown, set production `CHAT_ENABLED=false` and redeploy the current successful Pages commit. The email contact remains available. The widget can be removed at build time with `PUBLIC_PORTFOLIO_CHAT=false` and a rebuild. Keep the database/accounting when rolling back so usage does not regain allowance.
