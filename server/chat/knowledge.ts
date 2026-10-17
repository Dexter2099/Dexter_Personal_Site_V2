import { approvedEntries } from './public-experience';
import type { Entry } from './types';
import { normalise } from './policy';
import type { D1Database } from '@cloudflare/workers-types';
import { githubSnapshot, withGithubActivity } from './github';

export const entries: Entry[] = approvedEntries;
const stop = new Set('dexter dexters mehta what how why who does did has have his him her their the a an and or for with from about can could should would tell me more please give know work working used use is are was in on of to he they this that experience examples skills project projects'.split(' '));
const aliases: Record<string, string> = { recently:'recent', hobbies:'hobby', contributions:'contributed', contribute:'contributed', contributing:'contributed', developer:'backend', databases:'postgresql', database:'postgresql', testing:'testing', tests:'testing', test:'testing', typescript:'typescript', 'csharp':'c#', 'dotnet':'net', updates:'progress' };
const currentWorkWords = new Set('latest recent current currently newest new ongoing lately now right moment at present these days most been doing building developing up getting active professional internship internships job jobs progress'.split(' '));
export function terms(query: string): string[] {
  return [...new Set(normalise(query).replace(/\bopen[ -]source\b/g,'opensource').match(/[a-z0-9+#]+/g) ?? [])]
    .filter(word => word.length > 1 && !stop.has(word))
    .map(word => aliases[word] ?? word);
}
export function retrieve(query: string, limit = 4): Entry[] {
  const words = terms(query);
  const q=normalise(query);
  const focused=new Set<string>();
  if(/\b(?:coding agents?|ai-assisted|ai workflow|ai coding)\b/.test(q))focused.add('ai-workflow');
  if(/\b(?:mallet|air[ -]hockey|game dev(?:elopment)?)\b/.test(q))focused.add('mallet');
  if(/\b(?:kap|superquiz)\b/.test(q))focused.add('kap');
  if(/\bdelvify\b/.test(q))focused.add('delvify');
  if(/\b(?:open[ -]source|sqladmin|learnhouse|flagsmith|meltano|hey api)\b/.test(q))focused.add('oss');
  if(/\b(?:safetrase|safetrace)\b/.test(q)){
    focused.add('safetrase-source');
    if(!/\b(?:ingest(?:er|ion)?|source)\b/.test(q))focused.add('safetrase-app');
  }
  // Broad current-work questions use a dated, reviewed overview. Keep named
  // projects and skill questions on their own evidence rather than guessing recency.
  const currentWork = /\b(?:latest|recent(?:ly)?|current(?:ly)?|new(?:est)?|ongoing|lately|now|at the moment|these days|working on|building|developing|up to|doing)\b/.test(q);
  if (!focused.size && currentWork && words.every(word=>currentWorkWords.has(word))) {
    return ['current-work','safetrase-source','mallet'].slice(0,limit).map(id=>entries.find(entry=>entry.id===id)!);
  }
  if (!words.length) return [];
  return entries.filter(entry=>entry.id!=='current-work'&&(!focused.size||focused.has(entry.id))).map(entry => {
    const tags = new Set(entry.tags.flatMap(terms));
    const title = new Set(terms(entry.title));
    const summary = new Set(terms(entry.summary));
    let score = 0;
    for (const word of words) score += tags.has(word) ? 8 : title.has(word) ? 5 : summary.has(word) ? 1 : 0;
    return { entry, score };
  }).filter(x => x.score >= 5).sort((a,b) => b.score-a.score || b.entry.priority-a.entry.priority)
    .slice(0,limit).map(x => x.entry);
}
let version: Promise<string> | undefined;
export function versionForEntries(records: Entry[]) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(records)))
    .then(bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2,'0')).join('').slice(0,16));
}
export function knowledgeVersion() {
  return version ??= versionForEntries(entries);
}
export async function chatKnowledge(db?:D1Database,now=Date.now()) {
  const snapshot=await githubSnapshot(db), active=withGithubActivity(entries,snapshot,now);
  if(!snapshot)return {entries:active,version:await knowledgeVersion()};
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({base:await knowledgeVersion(),checkedAt:snapshot.checkedAt,entries:active})));
  return {entries:active,version:Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('').slice(0,16)};
}
export function sourceRefs(selected: Entry[], now = Date.now()) {
  return selected.flatMap(entry => [
    { id: entry.id, label: `Reviewed contribution: ${entry.title}`, reviewed: entry.reviewed },
    ...entry.links.slice(0,2).map(link => ({ id: entry.id, label: link.label, url: link.url, reviewed: entry.reviewed }))
  ]);
}
export function datedSummary(entry: Entry, now = Date.now()) {
  const stale = now - Date.parse(entry.reviewed+'T00:00:00Z') > entry.reviewDays*86400000;
  return { ...entry, currentStatus: stale ? 'Historical reviewed snapshot. Do not call this current; date all status statements.' : 'Reviewed milestone; not a live feed.' };
}
