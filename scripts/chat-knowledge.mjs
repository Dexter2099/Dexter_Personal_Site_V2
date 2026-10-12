import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, extname } from 'node:path';
const path='knowledge/approved/portfolio.json', raw=readFileSync(path,'utf8'), corpus=JSON.parse(raw);
const allowed=new Set(['dexter-developer.dev','github.com','safetrase.com','thrivabilitymatters.org','x.com','www.amazon.com.au','www.goodreads.com']);
const ids=new Set();
for(const e of corpus.entries) {
  if(!e.id||ids.has(e.id)||!e.summary||e.summary.length>2500||!e.limits||!e.reviewed||!e.tags.length||e.reviewDays<1)throw new Error('Invalid knowledge entry.');
  ids.add(e.id);
  if(/coastal courier|third person action|c:\\|sk-[a-zA-Z0-9-]{15,}|dexter@example\.com/i.test(JSON.stringify(e)))throw new Error(`Disallowed content in ${e.id}`);
  for(const link of e.links) {const u=new URL(link.url);if(u.protocol!=='https:'||!allowed.has(u.hostname))throw new Error(`Unapproved public link in ${e.id}`);}
}
const version=createHash('sha256').update(JSON.stringify(corpus)).digest('hex').slice(0,16);
console.log(`Validated ${ids.size} approved records. Knowledge version ${version}.`);
if(process.argv.includes('--refresh')) {
  mkdirSync('.chat-private',{recursive:true});
  const registerPath='.chat-private/source-register.json';
  if(!existsSync(registerPath))throw new Error('Create .chat-private/source-register.json from the owner-only evidence register first. No broad disk scan is performed.');
  const register=JSON.parse(readFileSync(registerPath,'utf8'));
  const changes=[];
  for(const source of register) {
    const full=resolve(source.path);
    if(/(?:^|[\\/])(?:\.env[^\\/]*|node_modules|\.git|dist|backups?|secrets?)(?:[\\/]|$)/i.test(full)||!['.md','.ts','.tsx','.js','.py','.cpp','.h','.json'].includes(extname(full)))continue;
    try {const hash=createHash('sha256').update(readFileSync(full)).digest('hex');if(hash!==source.sha256)changes.push({id:source.id,path:full,previous:source.sha256,current:hash,status:'owner review required'});}
    catch {changes.push({id:source.id,path:full,status:'missing or inaccessible; owner review required'});}
  }
  writeFileSync('.chat-private/refresh-draft.json',JSON.stringify({checked:new Date().toISOString(),changes,note:'Hash changes are evidence candidates. Approved knowledge was not modified.'},null,2),{mode:0o600});
  console.log(`${changes.length} changes need review. Private report: .chat-private/refresh-draft.json. No content was published.`);
}
