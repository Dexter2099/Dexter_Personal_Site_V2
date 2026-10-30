import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, extname } from 'node:path';
import { tsImport } from 'tsx/esm/api';
const { approvedEntries } = await tsImport('../server/chat/public-experience.ts', import.meta.url);
const { providerBody, reservation } = await tsImport('../server/chat/provider.ts', import.meta.url);
const { publicRepositories, readmeKnowledge } = await tsImport('../server/chat/readmes.ts', import.meta.url);
const { withGithubActivity } = await tsImport('../server/chat/github.ts', import.meta.url);
const allowed=new Set(['dexter-developer.dev','dexter-onboardflow.pages.dev','onboardflow.hostless.app','github.com','safetrase.com','thrivabilitymatters.org','x.com','www.amazon.com.au','www.goodreads.com','www.linkedin.com']);
const ids=new Set();
for(const e of approvedEntries) {
  if(!e.id||ids.has(e.id)||!e.summary||e.summary.length>2500||!e.limits||!/^\d{4}-\d{2}-\d{2}$/.test(e.reviewed)||!e.tags.length||e.reviewDays<1)throw new Error('Invalid knowledge entry.');
  ids.add(e.id);
  if(/coastal courier|third person action|c:\\|sk-[a-zA-Z0-9-]{15,}|dexter@example\.com/i.test(JSON.stringify(e)))throw new Error(`Disallowed content in ${e.id}`);
  for(const link of e.links) {const u=new URL(link.url);if(u.protocol!=='https:'||u.username||u.password||!allowed.has(u.hostname))throw new Error(`Unapproved public link in ${e.id}`);}
}
const version=createHash('sha256').update(JSON.stringify(approvedEntries)).digest('hex').slice(0,16);
// Three UTF-8 bytes per UTF-16 code unit bounds a valid 2,000-unit question.
// Fail the build if new public content would crowd out a maximum-size question.
reservation(providerBody('字'.repeat(2000),approvedEntries,[],'gpt-5.4-mini'));
// Reserve space for the largest cached public excerpts too, including UTF-8.
const maximumReadmes=await readmeKnowledge({prepare(){return {async all(){return {results:publicRepositories().map(source=>({repo:source.repo,commit_sha:'a'.repeat(40),readme_path:'README.md',excerpt:'字'.repeat(source.limit),checked_at:Date.now(),last_status:'ok'}))};}};}});
reservation(providerBody('字'.repeat(2000),[...withGithubActivity(approvedEntries,{contributions:10000000,checkedAt:Date.now()-172800000}),...maximumReadmes],[],'gpt-5.4'));
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
