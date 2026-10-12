import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { refreshGithub } from '../server/chat/github.ts';

// Fixed local D1 target; use the same refresh and validation as the scheduled Worker.
function execute(sql,values) {
  let index=0;
  const bound=sql.replace(/\?/g,()=>{
    const value=values[index++];
    if(typeof value==='number'&&Number.isSafeInteger(value))return String(value);
    if(typeof value==='string')return `'${value.replaceAll("'","''")}'`;
    throw new Error('Unsupported local GitHub cache parameter.');
  });
  if(index!==values.length)throw new Error('Local GitHub cache parameter mismatch.');
  const result=spawnSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','portfolio-chat-local','--local','--config','wrangler.local.jsonc','--command',bound,'--json'],{encoding:'utf8',windowsHide:true});
  if(result.status!==0)throw new Error('Local GitHub cache database operation failed.');
  const packet=JSON.parse(result.stdout)[0];
  if(!packet?.success)throw new Error('Local GitHub cache database result unavailable.');
  return packet;
}
const db={prepare(sql){return {bind(...values){return {async first(){return execute(sql,values).results[0]??null;},async run(){return execute(sql,values);}};}};}};
const result=await refreshGithub(db);
console.log(JSON.stringify({githubRefresh:result.status,...result.snapshot}));
