import corpus from '../../knowledge/approved/portfolio.json';
import { experienceEntries, type ExperienceEntry } from '../../src/data/experience';
import type { Entry } from './types';
import { projectPages, projects, type Project } from '../../src/data/projects';
import { siteCopy } from '../../src/data/site-copy';
import { socialLinks } from '../../src/data/links';
import { authorLinks } from '../../src/data/author';
import { techStack } from '../../src/data/tech';
import { redact } from './policy';

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
      summary: redact([`${role.title} at ${role.meta}.`, ...(id === 'safetrase-app' && role.summary ? [role.summary] : []), ...bullets].join(' ')) +
        (existing?.summary ? ` ${existing.summary}` : ''),
      limits: existing?.limits ?? 'Stage 1 prototype contributions. Do not infer production scale, all-device acceptance or current uptime. Privacy rules apply.',
      links: [{label: 'SafeTrase experience', url: 'https://dexter-developer.dev/experience#safetrase'}]
    };
  });
  const replacements = new Map(derived.map(entry => [entry.id, entry]));
  return [...base.map(entry => replacements.get(entry.id) ?? entry),
    ...derived.filter(entry => !base.some(original => original.id === entry.id))];
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const bulletText = (bullet: import('../../src/data/experience').ExperienceBullet) =>
  typeof bullet === 'string' ? bullet : `${bullet.before}${bullet.link.label}${bullet.after}`;
const contributionLimits = 'Published portfolio description, not proof of current uptime, commercial scale or independent authorship of every line. No private records, credentials or infrastructure identifiers. Do not infer dates or employment from project descriptions.';

export function withWebsiteContent(base: Entry[], website = experienceEntries, cards: Project[] = projects, copy = siteCopy) {
  const result = withWebsiteExperience(base, website);
  const publicParts = new Map<string, {title: string; summaries: string[]; links: Entry['links']; reviewed: string; tags: string[]}>();
  const add = (id: string, title: string, summary: string, url: string, reviewed: string, tags: string[], links: Entry['links'] = []) => {
    const previous = publicParts.get(id);
    publicParts.set(id, {title: redact(title), summaries: [...(previous?.summaries ?? []), redact(summary)],
      links: [...(previous?.links ?? []), {label: title, url}, ...links], reviewed,
      tags: [...(previous?.tags ?? []), ...tags]});
  };
  for (const role of website.filter(entry => entry.id !== 'safetrase')) {
    const id = role.id ?? `experience-${slug(role.title)}`;
    add(id, role.title, `${role.title}. ${role.meta}. ${role.date}. ${role.summary ?? ''} ${
      (role.groups ?? [{title: '', bullets: role.bullets ?? []}]).map(group => `${group.title} ${group.bullets.map(bulletText).join(' ')}`).join(' ')
    }`.trim(), `https://dexter-developer.dev/experience${role.id ? `#${role.id}` : ''}`, role.reviewed ?? copy.reviewed, ['experience', ...role.title.toLowerCase().split(/[^a-z0-9]+/)]);
  }
  for (const [category, page] of Object.entries(projectPages)) {
    const members = cards.filter(project => (project.category ?? 'personal') === category);
    add(`website-${slug(page.title)}`, page.title,
      `${page.description} Exactly ${members.length} cards appear on this page, in this order: ${members.map(project => project.title).join('; ')}.`,
      `https://dexter-developer.dev${page.path}`, page.reviewed, ['projects', page.title]);
  }
  for (const project of cards) {
    const id = project.id ?? `project-${slug(project.title)}`;
    const page = projectPages[project.category ?? 'personal'];
    add(id, project.title, `${project.title}: ${project.description} ${project.emphasis} Technologies: ${project.techStack.join(', ')}. Video: ${project.videoLabel}. Collection: ${page.title}.`,
      `https://dexter-developer.dev${page.path}#${slug(project.title)}-title`, project.reviewed ?? copy.reviewed,
      ['project', ...project.techStack, project.title],
      [...(project.githubUrl ? [{label: 'GitHub repository', url: project.githubUrl}] : []), ...(project.demoUrl ? [{label: 'Try demo', url: project.demoUrl}] : []), ...(project.websiteUrl ? [{label: 'Visit website', url: project.websiteUrl}] : []), ...(project.xUrl ? [{label: 'Game development updates on X', url: project.xUrl}] : [])]);
  }
  add('website-about', 'About Dexter', Object.values(copy.about).join(' '), 'https://dexter-developer.dev/about', copy.reviewed, ['about', 'background', 'interests', 'education', 'goals'], authorLinks.map(link => ({label: link.label, url: new URL(link.href).origin + new URL(link.href).pathname})));
  add('website-home', 'Dexter’s public profile and technology stack', `${copy.name}: ${copy.role}. Technology stack displayed on his home page: ${techStack.map(tech => tech.name).join(', ')}. A displayed technology is not evidence of employment tenure. The shared site footer displays: Last updated ${copy.footer.lastUpdatedLabel}. This is the site update month, not a separate review date for every project or claim.`, 'https://dexter-developer.dev/', copy.reviewed, ['profile', 'technology', 'skills', 'footer', 'updated']);
  add('website-contact', 'Contact and stated availability', `${copy.contact.heading}. ${copy.contact.introduction} Email is the preferred contact method.`, 'https://dexter-developer.dev/contact', copy.reviewed, ['contact', 'availability', 'freelance', 'consulting'], socialLinks.filter(link => /^https:/.test(link.href)).map(link => ({label: link.label, url: link.href})));
  const supplementIds = new Set(['kap', 'job-tracker', 'gspacechat', 'ml', 'mallet']);
  for (const [id, published] of publicParts) {
    const index = result.findIndex(entry => entry.id === id);
    const previous = index < 0 ? undefined : result[index];
    const supplement = previous && supplementIds.has(id) ? ` Additional evidence reviewed on ${previous.reviewed}: ${previous.summary}` : '';
    const entry: Entry = {id, title: published.title, tags: [...new Set([...(previous?.tags ?? []), ...published.tags])],
      priority: previous?.priority ?? 50, reviewed: published.reviewed, reviewDays: previous?.reviewDays ?? 90,
      summary: published.summaries.join(' ') + supplement, limits: previous?.limits ?? contributionLimits,
      links: [...new Map(published.links.map(link => [link.url, link])).values()]};
    if (index < 0) result.push(entry); else result[index] = entry;
  }
  return result;
}

export const approvedEntries = withWebsiteContent(corpus.entries);
