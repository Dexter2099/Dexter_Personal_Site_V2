import type { D1Database } from '@cloudflare/workers-types';

export interface ChatEnv {
  CHAT_DB?: D1Database;
  CHAT_ENABLED?: string;
  CHAT_PROVIDER?: string;
  CHAT_MODEL?: string;
  CHAT_LOCAL_ONLY?: string;
  CHAT_ALLOWED_ORIGIN?: string;
  CHAT_ALLOWED_ORIGINS?: string;
  CHAT_MONTHLY_USD?: string;
  CHAT_DAILY_USD?: string;
  CHAT_DEVELOPMENT_MODE?: string;
  OPENAI_API_KEY?: string;
  CHAT_ID_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}
export interface Entry {
  id: string;
  title: string;
  tags: string[];
  priority: number;
  reviewed: string;
  reviewDays: number;
  summary: string;
  limits: string;
  links: { label: string; url: string }[];
}
export interface Answer {
  kind: 'answer' | 'unknown' | 'boundary';
  text: string;
  sources: { id: string; label: string; url?: string; reviewed?: string }[];
}
export interface ProviderResult {
  answer: Answer;
  inputTokens: number;
  outputTokens: number;
  chargedMicros: number;
}
export type Fetcher = typeof fetch;
