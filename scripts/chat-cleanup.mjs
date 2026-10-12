import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const now=Date.now(),scrub=now-90*86400000,remove=now-365*86400000;
const sql=process.argv.includes('--apply') ? `UPDATE chat_requests SET message=NULL,answer=NULL,session_id='',network_id='' WHERE created_at<${scrub} AND message IS NOT NULL; DELETE FROM chat_requests WHERE created_at<${remove};` : `SELECT SUM(created_at<${scrub} AND message IS NOT NULL) AS content_to_scrub,SUM(created_at<${remove}) AS rows_to_remove FROM chat_requests;`;
const result=spawnSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','portfolio-chat-local','--local','--config','wrangler.local.jsonc','--command',sql,'--json'],{encoding:'utf8',windowsHide:true});
if(result.status!==0)throw new Error('Local retention operation failed.');
console.log(result.stdout);
