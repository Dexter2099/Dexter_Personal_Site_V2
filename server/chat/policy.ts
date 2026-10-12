import type { Answer } from './types';

export const EMAIL = 'dexter.mehta01@gmail.com';
export const POLICY_VERSION = '2026-10-12.2';
export const MAX_MESSAGE = 2000;
export const MAX_BODY = 12000;
export const CONTACT: Answer = {
  kind: 'answer', text: `Email is Dexter’s preferred way to get in touch: ${EMAIL}. You can also explore his GitHub and LinkedIn profiles.`,
  sources: [
    { id: 'email', label: 'Email Dexter', url: `mailto:${EMAIL}` },
    { id: 'github', label: 'GitHub', url: 'https://github.com/Dexter2099' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/dexter-developer/' }
  ]
};
export const UNKNOWN: Answer = { kind: 'unknown', text: `I don’t have a reviewed answer to that—I’m just Dexter’s portfolio bot 😊 You can ask him at ${EMAIL}.`, sources: [CONTACT.sources[0]] };
export const PRIVATE: Answer = { kind: 'boundary', text: `I can share Dexter’s experience and project skills, but I don’t provide private contact details, personal records, source code or credentials. Email him at ${EMAIL}.`, sources: [CONTACT.sources[0]] };
export const OFF_TOPIC: Answer = { kind: 'boundary', text: 'I’m here to help you learn about Dexter’s experience, projects and interests. Try asking about his SafeTrase work or open-source contributions.', sources: [] };

export function normalise(value: string): string {
  return value.normalize('NFKC').replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069]/g, '').toLowerCase().replace(/[’‘]/g, "'");
}
export function redact(value: string): string {
  return value
    .replace(/\b(?:sk|ghp|github_pat|xox[baprs])[-_][a-zA-Z0-9_\-]{12,}\b/g, '[credential removed]')
    .replace(/\bBearer\s+[\w.\-+/=]{10,}/gi, '[credential removed]')
    .replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, '[credential removed]')
    .replace(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, email => email.toLowerCase() === EMAIL ? EMAIL : '[email removed]')
    .replace(/(?:\+?\d[\d ()-]{7,}\d)/g, '[number removed]');
}
export function fixedReply(message: string): Answer | null {
  const q = normalise(message);
  // Keep recognizable sensitive disclosures out of the provider request too.
  if (/\b(?:confidential|proprietary|social security|passport|credit card|medical|diagnosis|patient|my child|my son|my daughter|under 13)\b/.test(q)) return PRIVATE;
  if (/\b(phone|mobile numbers?|home address|street address|where.*live|postcode|date of birth|birthday|salary|bank|passwords?|api keys?|credentials?|referee.*(?:names?|numbers?|contacts?)|medical records?|private (?:email|message|code|file)|raw source|source code|hidden prompt|system prompt)\b/.test(q)) return PRIVATE;
  if (/\b(ignore|override|disregard)\b.{0,70}\b(instruction|policy|rule|prompt)\b|\b(?:system|developer)\s*:|\b(?:base64|rot13|hexadecimal|encode|decode)\b|\bi am dexter\b|\b(?:send|write|compose)\b.{0,25}\b(?:email|letter|essay)\b/.test(q)) return OFF_TOPIC;
  if (/\b(coastal courier|third person action)\b/.test(q)) return UNKNOWN;
  if (/\b(?:favou?rite|favourite)\b.{0,25}\b(colou?r|food|animal|song|team)\b/.test(q)) return UNKNOWN;
  if (/^(hi|hello|hey|good (morning|afternoon|evening))[!.\s]*$/.test(q)) return { kind: 'answer', text: 'Hi! I can help with Dexter’s experience, projects, open-source contributions and interests. What would you like to know?', sources: [] };
  if (/^(thanks?|thank you|cheers)[!.\s]*$/.test(q)) return { kind: 'answer', text: 'You’re welcome 😊 If you’d like to speak with Dexter, email is the best way to reach him.', sources: [CONTACT.sources[0]] };
  if (/\b(?:idiot|stupid|useless|hate you)\b/.test(q)) return { kind: 'boundary', text: 'I can help with questions about Dexter’s work and projects. You’re welcome to ask about a particular example.', sources: [] };
  const socialLink = /\b(?:github|linkedin)\b/.test(q) && /\b(?:link|url|profile|account|find|visit)\b/.test(q);
  if ((/\b(?:contact|email|references?|referees?)\b/.test(q) || socialLink) && !/\b(project|contribut|repo|work|skill|experience|activ|often|frequen|coding|code|commit|pull|patch)\w*\b/.test(q)) {
    if (/\b(reference|referee)s?\b/.test(q)) return { kind: 'answer', text: `Dexter has professional references for SafeTrase and Delvify. Please arrange an introduction directly with him at ${EMAIL}.`, sources: [CONTACT.sources[0]] };
    return CONTACT;
  }
  if (/\bsolve\b.{0,40}\b(?:equation|math|puzzle)\b/.test(q)) return OFF_TOPIC;
  if (/\b(?:weather|recipe|capital of|calculate|stock price|bitcoin|write (?:(?:me )?(?:a )?)?(?:poem|code|function)|debug (?:this|my)|translate|who (?:is|was) the president)\b/.test(q)) return OFF_TOPIC;
  return null;
}

export async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function safeAnswer(answer: Answer): boolean {
  const text = normalise(answer.text);
  return answer.text.length <= 3000 && redact(answer.text) === answer.text &&
    !/coastal courier|c:\\|\/users\/|sk-proj-|<script|javascript:|dexter@example\.com/.test(text) &&
    !/\b(?:phone number|home address|password|api key)\s*(?:is|:|=)/.test(text);
}
