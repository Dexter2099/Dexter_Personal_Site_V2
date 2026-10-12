import type { D1Database } from '@cloudflare/workers-types';
import type { Entry, Fetcher } from './types';

export const GITHUB_ACCOUNT = 'Dexter2099';
export const GITHUB_ACTIVITY_URL = 'https://github.com/users/Dexter2099/contributions';
export const GITHUB_CACHE_TTL = 86400000;
// A daily cron can run a few seconds earlier than its previous invocation.
// A one-hour grace avoids accidentally skipping a whole day's refresh.
export const GITHUB_REFRESH_INTERVAL = 23*60*60*1000;
const MAX_HTML_BYTES = 512000;
export type GithubSnapshot = { contributions:number; checkedAt:number };

// This public HTML fragment needs no token. Only its fixed numeric heading is
// extracted; repository names, page instructions and raw HTML never enter knowledge.
export function parseContributions(html:string):number {
  const heading=html.match(/<h2\b[^>]*\bid=["']js-contribution-activity-description["'][^>]*>([\s\S]*?)<\/h2>/i)?.[1];
  const text=heading?.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const number=text?.match(/^((?:\d{1,3}(?:,\d{3})+|\d+)) contributions? in the last year$/)?.[1];
  if(number===undefined)throw new Error('github_format');
  const count=Number(number.replaceAll(',',''));
  if(!Number.isSafeInteger(count)||count>10000000)throw new Error('github_count');
  return count;
}
async function readHtml(response:Response):Promise<string> {
  if(!response.ok||!response.headers.get('Content-Type')?.toLowerCase().startsWith('text/html')||!response.body)throw new Error('github_response');
  if(Number(response.headers.get('Content-Length'))>MAX_HTML_BYTES){await response.body.cancel();throw new Error('github_size');}
  const reader=response.body.getReader(), chunks:Uint8Array[]=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_HTML_BYTES){await reader.cancel();throw new Error('github_size');}chunks.push(value);}
  } finally {reader.releaseLock();}
  const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder('utf-8',{fatal:true}).decode(buffer);
}
export async function githubSnapshot(db?:D1Database):Promise<GithubSnapshot|null> {
  if(!db)return null;
  const row=await db.prepare('SELECT contributions,checked_at FROM github_activity WHERE account=?').bind(GITHUB_ACCOUNT).first<{contributions:number|null;checked_at:number|null}>();
  if(!row||row.contributions===null||row.checked_at===null)return null;
  return {contributions:row.contributions,checkedAt:row.checked_at};
}
export async function refreshGithub(db:D1Database,fetcher:Fetcher=fetch,now=Date.now()) {
  // Claim before fetching: concurrent schedulers and failed upstream requests
  // cannot turn into repeated traffic. A failure retains the last good snapshot.
  const claim=await db.prepare(`INSERT INTO github_activity(account,attempted_at,last_status) VALUES(?,?,'refreshing')
    ON CONFLICT(account) DO UPDATE SET attempted_at=excluded.attempted_at,last_status='refreshing'
    WHERE github_activity.attempted_at<=? RETURNING account`).bind(GITHUB_ACCOUNT,now,now-GITHUB_REFRESH_INTERVAL).first();
  if(!claim)return {status:'cached' as const,snapshot:await githubSnapshot(db)};
  let count:number;
  try {
    const response=await fetcher(GITHUB_ACTIVITY_URL,{headers:{'User-Agent':'DexterPortfolioChat/1.0','Accept':'text/html'},redirect:'error',signal:AbortSignal.timeout(8000)});
    count=parseContributions(await readHtml(response));
  } catch {
    await db.prepare("UPDATE github_activity SET last_status='unavailable' WHERE account=? AND attempted_at=?").bind(GITHUB_ACCOUNT,now).run();
    return {status:'unavailable' as const,snapshot:await githubSnapshot(db)};
  }
  await db.prepare("UPDATE github_activity SET contributions=?,checked_at=?,last_status='ok' WHERE account=? AND attempted_at=?").bind(count,now,GITHUB_ACCOUNT,now).run();
  return {status:'updated' as const,snapshot:await githubSnapshot(db)};
}
export function withGithubActivity(approved:Entry[],snapshot:GithubSnapshot|null,now=Date.now()):Entry[] {
  if(!snapshot)return approved;
  const day=new Date(snapshot.checkedAt).toISOString().slice(0,10);
  const displayDay=new Date(snapshot.checkedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const stale=now-snapshot.checkedAt>GITHUB_CACHE_TTL;
  return approved.map(entry=>entry.id!=='development-activity'?entry:{...entry,reviewed:day,
    summary:`Dexter works on software regularly across his SafeTrase internship, open-source contributions and personal projects, including Mallet Mayhem ’84. A cached public GitHub profile snapshot checked on ${displayDay} showed ${snapshot.contributions.toLocaleString('en-US')} contributions in the last year.${stale?' This is the last successful snapshot; the daily refresh is overdue.':''}`,
    limits:`For broad coding-frequency questions, give a brief natural answer about regular development and the dated evidence. The count is contributions in the last year as observed on ${displayDay}, not a calendar-year total, commits, coding hours, days worked or a live count. GitHub contributions include commits, pull requests and issues and may include anonymised private activity. Do not infer daily coding, hours, skill level or private repository identities. If asked about exact hours or a daily routine, give the supported part and briefly say that exact detail is not documented.${stale?' The cache is older than 24 hours: explicitly date any numerical claim and do not describe the count as current.':' This is a daily cached snapshot, not a live lookup.'}`
  });
}
