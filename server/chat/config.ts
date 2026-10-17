import type { ChatEnv } from './types';

// Standard, short-context USD per million tokens, checked 12 October 2026.
// Reserve at the higher cache-write rate; reconcile conservatively at that rate.
export const MODEL_RATES = {
  'gpt-5.4': { input: 2.5, output: 15, effort: 'none' },
  'gpt-5.4-mini': { input: 0.75, output: 4.5, effort: 'none' },
  'gpt-5.4-nano': { input: 0.2, output: 1.25, effort: 'none' },
  'gpt-6-luna': { input: 0.125, output: 0.5, effort: 'none' },
  'gpt-6.1-sol': { input: 2.5, output: 10, effort: 'low' }
} as const;
export const MAX_OUTPUT = 600;
// Includes all public experience/project content, reviewed evidence and framing.
// The monthly/daily dollar caps remain independent of this context bound.
export const MAX_INPUT_BYTES = 48000;
export function isLoopback(url: URL): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}
export function configuration(env: ChatEnv, url: URL) {
  const local = isLoopback(url);
  const preview = env.CHAT_PROVIDER === 'preview';
  const model = env.CHAT_MODEL as keyof typeof MODEL_RATES;
  const monthly = Number(env.CHAT_MONTHLY_USD);
  const daily = Number(env.CHAT_DAILY_USD);
  // The local-only development allowance includes prior usage and uncertain
  // reservations in this same monthly ledger. Never infer this mode publicly.
  const development = local && env.CHAT_LOCAL_ONLY === 'true' && env.CHAT_DEVELOPMENT_MODE === 'true';
  const monthlyLimit = development ? Math.min(monthly, 5) : monthly;
  const modelReady = preview || (env.CHAT_PROVIDER === 'openai' && !!MODEL_RATES[model] && !!env.OPENAI_API_KEY);
  const controls = !!env.CHAT_DB && (env.CHAT_ID_SECRET?.length ?? 0) >= 32 && monthly > 0 && monthly <= 10 &&
    (development ? daily === 0 : daily > 0 && daily <= 0.75);
  const challenge = !!env.TURNSTILE_SITE_KEY && !!env.TURNSTILE_SECRET_KEY &&
    !/^[123]x/.test(env.TURNSTILE_SITE_KEY) && !/^[123]x/.test(env.TURNSTILE_SECRET_KEY);
  const allowedOrigins = (env.CHAT_ALLOWED_ORIGINS ?? env.CHAT_ALLOWED_ORIGIN ?? '').split(',').map(value => value.trim());
  const origin = local ? url.origin : allowedOrigins.includes(url.origin) ? url.origin : undefined;
  const enabled = env.CHAT_ENABLED === 'true' && controls && modelReady &&
    (local || (env.CHAT_LOCAL_ONLY === 'false' && !preview && challenge && origin === url.origin && url.protocol === 'https:'));
  return { enabled, preview, local, development, model, origin, monthlyMicros: Math.floor(monthlyLimit * 1e6), dailyMicros: development ? null : Math.floor(daily * 1e6), siteKey: local ? undefined : env.TURNSTILE_SITE_KEY };
}
