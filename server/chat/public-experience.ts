import corpus from '../../knowledge/approved/portfolio.json';
import { experienceEntries, type ExperienceEntry } from '../../src/data/experience';
import type { Entry } from './types';

const groupIds: Record<string, string> = {
  'Mobile app and backend': 'safetrase-app',
  'Source ingestion and cloud infrastructure': 'safetrase-source',
  'Android testing and software quality': 'safetrase-android',
  'Website, SEO and audience engagement': 'safetrase-web'
};

// Only the owner's published experience data is shared automatically. Private
// evidence stays in the separately reviewed corpus, never in a runtime crawler.
export function withWebsiteExperience(base: Entry[], website: ExperienceEntry[] = experienceEntries): Entry[] {
  const role = website.find(entry => entry.id === 'safetrase');
  if (!role?.groups?.length || !role.reviewed || !/^\d{4}-\d{2}-\d{2}$/.test(role.reviewed)) {
    throw new Error('SafeTrase public experience needs groups and a review date.');
  }
  const derived = role.groups.map(group => {
    const id = groupIds[group.title] ?? `safetrase-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const existing = base.find(entry => entry.id === id);
    const bullets = group.bullets.map(bullet => typeof bullet === 'string'
      ? bullet : `${bullet.before}${bullet.link.label}${bullet.after}`);
    return {
      id, title: `SafeTrase: ${group.title}`,
      tags: existing?.tags ?? ['safetrase', ...group.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)],
      priority: existing?.priority ?? 94,
      reviewed: role.reviewed!, reviewDays: existing?.reviewDays ?? 30,
      summary: [`${role.title} at ${role.meta}.`, ...(id === 'safetrase-app' && role.summary ? [role.summary] : []), ...bullets,
        ...(existing?.summary ? [existing.summary] : [])].join(' '),
      limits: existing?.limits ?? 'Stage 1 prototype contributions. Do not infer production scale, all-device acceptance or current uptime. Privacy rules apply.',
      links: [{label: 'SafeTrase experience', url: 'https://dexter-developer.dev/experience#safetrase'}]
    };
  });
  const replacements = new Map(derived.map(entry => [entry.id, entry]));
  return [...base.map(entry => replacements.get(entry.id) ?? entry),
    ...derived.filter(entry => !base.some(original => original.id === entry.id))];
}

export const approvedEntries = withWebsiteExperience(corpus.entries);
