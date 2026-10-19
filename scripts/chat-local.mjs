import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

const args=process.argv.slice(2), real=args.includes('--openai');
const model=args.find(x=>x.startsWith('gpt-')) ?? 'gpt-5.4';
if(!['gpt-5.4','gpt-5.4-mini','gpt-5.4-nano','gpt-6-luna','gpt-6.1-sol'].includes(model)) throw new Error('Unpriced model refused.');
const wrangler=resolve('node_modules/wrangler/bin/wrangler.js');
// Astro 7 moved its CLI; follow the installed package's declared executable.
const astroBin=resolve('node_modules/astro',JSON.parse(readFileSync('node_modules/astro/package.json','utf8')).bin.astro);
const build=()=>{
  run(resolve('scripts/chat-knowledge.mjs'),[]);
  run(astroBin,['build'],{...process.env,PUBLIC_PORTFOLIO_CHAT:'true'});
};
function run(file,params,env=process.env) {
  const child=spawnSync(process.execPath,[file,...params],{env,stdio:'inherit'});
  if(child.status!==0) process.exit(child.status??1);
}
function refreshPublic() {
  const result=spawnSync(process.execPath,[resolve('scripts/chat-public-sync.mjs')],{stdio:'inherit',windowsHide:true});
  if(result.status!==0)console.warn('Public GitHub refresh incomplete; continuing with the last-good cache.');
}
if(args.includes('build')) { build();process.exit(0); }
if(args.includes('migrate')) { run(wrangler,['d1','migrations','apply','portfolio-chat-local','--local','--config','wrangler.local.jsonc']);process.exit(0); }
mkdirSync('.chat-private',{recursive:true});
const secretFile=resolve('.dev.vars');
// This script only owns .dev.vars it creates. Never overwrite existing secrets.
if(existsSync(secretFile)) throw new Error('Existing .dev.vars preserved. Stop the previous server, then use npm run chat:clear-local-secrets for a stale managed file.');
const runtimeConfig=resolve('wrangler.jsonc');
if(existsSync(runtimeConfig))throw new Error('Existing wrangler.jsonc preserved. Stop the previous local server or remove its managed copy first.');
let key='';
if(real) {
  const result=spawnSync('powershell.exe',['-NoProfile','-File',resolve('scripts/read-openai-key.ps1'),'-ForLocalLauncher'],{encoding:'utf8',windowsHide:true});
  if(result.status!==0 || !result.stdout.trim().startsWith('sk-')) throw new Error('Encrypted project key unavailable. Run the masked setup script first.');
  key=result.stdout.trim();
}
writeFileSync(secretFile,'',{mode:0o600});
if(process.platform==='win32') {
  const identity=spawnSync('whoami.exe',['/user','/fo','csv','/nh'],{encoding:'utf8',windowsHide:true}).stdout.match(/S-1-[0-9-]+/);
  if(!identity) throw new Error('Could not find the current Windows user.');
  const acl=spawnSync('icacls.exe',[secretFile,'/inheritance:r','/grant:r',`*${identity[0]}:F`,'*S-1-5-18:F'],{windowsHide:true,stdio:'ignore'});
  if(acl.status!==0) {unlinkSync(secretFile);throw new Error('Could not restrict temporary development secrets.');}
}
writeFileSync(secretFile,`# Managed by Dexter portfolio local launcher\nCHAT_ENABLED=true\nCHAT_ID_SECRET=${randomBytes(32).toString('hex')}\nCHAT_PROVIDER=${real?'openai':'preview'}\nCHAT_MODEL=${real?model:''}\n${key?`OPENAI_API_KEY=${key}\n`:''}`,{mode:0o600});key='';
writeFileSync(runtimeConfig,'// Managed by Dexter portfolio local launcher\n'+readFileSync('wrangler.local.jsonc','utf8'));
let child;
function cleanup() { if(existsSync(secretFile))unlinkSync(secretFile); if(existsSync(runtimeConfig))unlinkSync(runtimeConfig); }
process.on('exit',cleanup);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child?.kill();cleanup();process.exit(0);});
try {
  if(!args.includes('--no-build'))build();
  run(wrangler,['d1','migrations','apply','portfolio-chat-local','--local','--config','wrangler.local.jsonc']);
  refreshPublic();
  run(resolve('scripts/chat-cleanup.mjs'),['--apply']);
  if(existsSync('.chat-private/source-register.json'))run(resolve('scripts/chat-knowledge.mjs'),['--refresh']);
  const retentionTimer=setInterval(()=>{run(resolve('scripts/chat-cleanup.mjs'),['--apply']);refreshPublic();},86400000);
  retentionTimer.unref();
  child=spawn(process.execPath,[wrangler,'pages','dev','dist','--ip','127.0.0.1','--port',process.env.CHAT_PORT??'8788'],{stdio:'inherit',windowsHide:true});
  child.on('exit',code=>{cleanup();process.exit(code??1);});
} catch(error) {cleanup();throw error;}
