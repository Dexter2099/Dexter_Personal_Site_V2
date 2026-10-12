import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const exportMessages=process.argv.includes('--export');
const sql=exportMessages ? 'SELECT created_at,status,message,answer,source_ids,knowledge_version,model,reserved_micros FROM chat_requests ORDER BY created_at DESC LIMIT 1000' : "SELECT month,model,status,COUNT(*) AS messages,SUM(reserved_micros)/1000000.0 AS conservative_usd FROM chat_requests GROUP BY month,model,status ORDER BY month DESC";
const result=spawnSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','portfolio-chat-local','--local','--config','wrangler.local.jsonc','--command',sql,'--json'],{encoding:'utf8',windowsHide:true});
if(result.status!==0)throw new Error('Local report failed. Initialise the local database first.');
if(exportMessages) {mkdirSync('.chat-private',{recursive:true});writeFileSync('.chat-private/messages.json',result.stdout,{mode:0o600});console.log('Saved redacted submitted messages to .chat-private/messages.json (ignored by Git).');}
else {
  const usage=JSON.parse(result.stdout).flatMap(item=>item.results??[]);
  const month=new Date().toISOString().slice(0,7);
  const usedMicros=Math.round(usage.filter(item=>item.month===month).reduce((sum,item)=>sum+item.conservative_usd,0)*1e6);
  const vars=JSON.parse(readFileSync('wrangler.local.jsonc','utf8')).vars;
  const capMicros=Math.round(Math.min(Number(vars.CHAT_MONTHLY_USD),5)*1e6);
  console.log(JSON.stringify({developmentBudget:{month,capUsd:capMicros/1e6,conservativeUsedUsd:usedMicros/1e6,remainingUsd:Math.max(0,capMicros-usedMicros)/1e6,dailyCapUsd:vars.CHAT_DEVELOPMENT_MODE==='true'?null:Number(vars.CHAT_DAILY_USD),reservedForLiveUsd:5},usage},null,2));
}
