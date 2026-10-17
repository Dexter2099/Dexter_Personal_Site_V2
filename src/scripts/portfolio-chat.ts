import { contactEmailHref } from '../data/links';
export type Source = { label: string; url?: string; reviewed?: string };
export type Reply = { text?: string; kind?: string; error?: string; sources?: Source[] };
export type Config = { enabled: boolean; mode: string; siteKey?: string };

// React escapes all message text. Links still need a protocol boundary.
export function sourceLinks(sources: Source[]) {
  const seen = new Set<string>();
  return sources.flatMap(source => {
    if (!source.url || seen.has(source.url)) return [];
    let url: URL;
    try { url = new URL(source.url); } catch { return []; }
    if (url.protocol !== 'https:' && source.url !== contactEmailHref) return [];
    seen.add(source.url);
    return [{ label: source.label, href: url.href, external: url.protocol === 'https:' }];
  });
}
