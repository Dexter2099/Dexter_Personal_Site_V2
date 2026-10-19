import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {tsImport} from 'tsx/esm/api';
const {refreshGithub}=await tsImport('../server/chat/github.ts',import.meta.url);
const {refreshReadmes}=await tsImport('../server/chat/readmes.ts',import.meta.url);
const remote=process.argv.includes('--remote'), force=process.argv.includes('--force');
if(process.argv.slice(2).some(arg=>!['--remote','--force'].includes(arg)))throw new Error('Unsupported sync argument.');
const wrangler=resolve('node_modules/wrangler/bin/wrangler.js');
let remoteQuery;
if(remote){
 const config=JSON.parse(readFileSync('wrangler.production.jsonc','utf8').replace(/^\s*\/\/.*$/gm,''));
 const database=config.d1_databases.find(db=>db.binding==='CHAT_DB'&&db.database_name==='dexter-portfolio-chat-production');
 if(config.name!=='dexter-developer'||!database?.database_id||!config.account_id)throw new Error('Explicit production database configuration required.');
 const auth=spawnSync(process.execPath,[wrangler,'auth','token','--json'],{encoding:'utf8',windowsHide:true,env:{...process.env,WRANGLER_WRITE_LOGS:'false'}});
 if(auth.status!==0)throw new Error('Cloudflare authentication unavailable.');
 const {token}=JSON.parse(auth.stdout);
 if(!token)throw new Error('Cloudflare authentication unavailable.');
 remoteQuery=async(sql,params)=>{
  const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${database.database_id}/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(30000)});
  const data=await r.json();
  if(!r.ok||data.success!==true||!data.result?.[0]?.success)throw new Error(`Production database query failed (${r.status}).`);
  return data.result[0];
 };
}
async function execute(sql,params){
 if(remoteQuery)return remoteQuery(sql,params);
 let i=0;const bound=sql.replace(/\?/g,()=>{const value=params[i++];if(value===null)return 'NULL';if(typeof value==='number'&&Number.isSafeInteger(value))return String(value);if(typeof value==='string')return `'${value.replaceAll("'","''")}'`;throw new Error('Invalid local parameter.');});
 if(i!==params.length)throw new Error('Parameter mismatch.');
 const r=spawnSync(process.execPath,[wrangler,'d1','execute','portfolio-chat-local','--local','--config','wrangler.local.jsonc','--command',bound,'--json'],{encoding:'utf8',windowsHide:true});
 if(r.status!==0)throw new Error('Local database unavailable; apply local migrations first.');
 const packet=JSON.parse(r.stdout)[0];if(!packet?.success)throw new Error('Local database query failed.');return packet;
}
const db={prepare(sql){return {bind(...params){return {async first(){return (await execute(sql,params)).results[0]??null;},async run(){return execute(sql,params);}};}};}};
const now=Date.now();
const activity=await refreshGithub(db,fetch,now,{force});
const readmes=await refreshReadmes(db,fetch,now,{force});
console.log(JSON.stringify({target:remote?'production':'local',activity,readmes},null,2));
if(activity.status==='unavailable'||readmes.some(row=>row.status==='unavailable'))process.exitCode=1;
