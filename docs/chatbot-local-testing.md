# Portfolio chatbot: local testing

The chatbot uses the existing Astro site, React controls and Cloudflare Pages API. GPT-5.4 is the selected model following local employer-question testing. The four adapted free Untitled UI controls use React Aria and the site's charcoal/gold palette; see `THIRD_PARTY_NOTICES.md`.

## Start locally

```powershell
npm ci
npm run chat:openai
```

Open http://127.0.0.1:8788 and choose **Ask about Dexter**. This command builds the widget, applies the local D1 migrations, refreshes the public GitHub cache, checks registered source hashes and enforces retention. `npm run dev` runs the static site without the Pages API.

For replies from approved summaries without API calls, use `npm run chat:local`. Compare models with `npm run chat:openai -- gpt-5.4-mini` or `npm run chat:openai -- gpt-5.4-nano`. Stop the previous server first. Avoid editing/reloading the Worker during a billed request: interrupted requests retain their conservative reservation.

## Local key storage

The OpenAI project key is encrypted with Windows user-bound DPAPI under `%LOCALAPPDATA%\DexterPortfolioChat\openai-key.dpapi`. It is restricted to Responses writing. Use `powershell -NoProfile -File scripts/set-openai-key.ps1` to replace it through a masked prompt.

The launcher captures the decrypted key through a pipe and creates a Git-ignored `.dev.vars` with access restricted to the current Windows user and SYSTEM. It also creates a managed local `wrangler.jsonc`. Normal shutdown removes both temporary files. After a forced termination, stop the server and run `npm run chat:clear-local-secrets`; it preserves the encrypted original and refuses to delete unowned files. Never commit or print decrypted keys.

OpenAI data sharing is enabled only for this chatbot's dedicated project, following owner acceptance of the agreement. Visitors must agree to logging and possible model-improvement use before sending. Promotional token eligibility does not replace spending controls: accounting uses standard prices.

## Development budget and controls

The overall API allowance is US$10 per UTC month. Local development can use at most US$5, including previous tests and uncertain reservations, leaving US$5 for live use. Local development has no daily dollar cap or minute/hour visitor quotas. The exemption requires all of loopback, `CHAT_LOCAL_ONLY=true`, `CHAT_DEVELOPMENT_MODE=true` and `CHAT_DAILY_USD=0`; public hosts cannot use it. Duplicate protection, the active-generation lock and monthly spending reservation remain enforced. Never reset/refund the ledger to regain allowance.

```powershell
npm run chat:report
npm run chat:report -- --export
npm run chat:cleanup
npm run chat:cleanup -- --apply
```

Reports/export use the ignored `.chat-private` directory. Only admitted submissions are recorded, after recognizable credentials, visitor emails and phone-like numbers are redacted. Drafts/keystrokes and denied request text are not logged. Raw IP addresses are not stored. Redaction cannot identify every sensitive disclosure, so the visitor notice asks people to avoid sensitive, confidential, proprietary or children's information.

Message/answer text and identifying hashes expire after 90 days; remaining accounting rows expire after 365 days. Removing local records cannot retract content already shared with OpenAI.

## Knowledge updates

The effective knowledge combines reviewed career/project summaries in `knowledge/approved/portfolio.json` with all experience entries and project cards in `src/data/experience.ts` and `src/data/projects.ts`, using `server/chat/public-experience.ts`. Home identity, About and Contact prose are shared through `src/data/site-copy.ts`; public contact/social URLs, author links and home technology labels use their existing shared data modules. Public bullets, descriptions, technology stacks and demo labels flow into model context on each website release; update item or shared `reviewed` dates when reviewing changed facts. New experience/project items are included automatically. Stable IDs preserve identity when titles change. The content hash includes these public details, so older conversation context is excluded after knowledge changes. Build validation checks the combined records and rejects oversized summaries or unapproved links/content. SafeTrase source ingestion and The Advisory Network lead the employer pitch, followed by Delvify and KAP. Private repositories support approved skill summaries; raw code, manuscripts, learner records, referee identities and private provenance are excluded. Coastal Courier is excluded.

All approved summaries reach the real model on every ordinary question. The `current-work` record answers broad latest-work questions and needs owner review when priorities change. The model has no browsing, mailbox, filesystem or repository tools. GitHub's numeric public contributions heading is cached daily, with the last successful check date; it does not establish hours worked or coding every day. Failed refreshes retain the last good snapshot and expose its age.

```powershell
npm run chat:github
npm run chat:sync
npm run chat:sync -- --force
npm run chat:refresh
```

The local owner-only source register lives in `.chat-private/source-register.json`. `chat:refresh` compares selected file hashes and writes review candidates without uploading content or changing approved knowledge. Update private-source summaries and dates deliberately, run checks, then release. All current public career/profile sections share the site's release automatically. Older detailed project evidence remains explicitly dated; public descriptions take precedence for the fields they describe. A new page must use shared content and be registered in the knowledge builder (see AGENTS.md). Live Spotify tracks, X posts, private files and external page contents are not automatically copied. The chatbot never crawls local repositories or arbitrary websites during a visitor question.

## Verification

The launcher refreshes numeric GitHub activity and bounded public README excerpts from project-card GitHub links, with OnboardFlow first. `chat:sync` defaults to the local database; `--force` bypasses only its 23-hour refresh interval. A failed refresh retains the last-good snapshot and does not stop the local site. `public_readmes` stores the checked commit, excerpt, check time and status. Only public owner repositories are fetched anonymously; raw private repositories and arbitrary linked pages are excluded. README text is untrusted evidence with source links and scope qualifiers, not model instructions. Production uses the same importer on its daily maintenance schedule; see the production operation guide for the explicit remote command.

```powershell
npm run chat:check
npm run chat:test
npm test
npm run chat:build
npm audit --audit-level=low
```

The input is bounded to 48,000 UTF-8 bytes including conservative framing, with up to three previous exchanges; output is capped at 600 tokens. Three previous exchanges is a memory window, not a three-question allowance. Fixed privacy/off-topic replies avoid provider calls. Provider timeouts and invalid replies are never retried automatically.

On 12 October 2026, the Astro 7.3.8/React integration 7.0.1 dependency tree had zero reported vulnerabilities. The Node pin is 24.19.0. Browser checks covered desktop/ultrawide and 320px/390px mobile layouts, accessible labels, pointer/keyboard submission and correct contact links. Real mobile soft-keyboard and screen-reader acceptance remain useful device checks.

See [production operation](chatbot-production.md) for the deployed configuration, release commands and public limits.
