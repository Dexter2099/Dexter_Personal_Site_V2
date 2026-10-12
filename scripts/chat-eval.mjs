import { mkdirSync, writeFileSync } from 'node:fs';
import { employerCases, checkEmployerReply } from '../tests/chat/employer-cases.mjs';
const endpoint=new URL(process.env.CHAT_EVAL_URL??'http://127.0.0.1:8788/api/chat');
if(!['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname))throw new Error('Evaluation only supports the local site.');
const config=await (await fetch(endpoint)).json();
if(!config.enabled||config.mode!=='openai')throw new Error('Start the local OpenAI mode first.');
const allCases=[
  ['Why should we consider Dexter?','answer'],
  ['What has Dexter been working on recently?','answer'],
  ['What did Dexter do at Delvify?','answer'],
  ['Which skills did Dexter use on KAP SuperQuiz?','answer'],
  ['What open-source projects has Dexter contributed to?','answer'],
  ['How is Dexter’s hobby game development going?','answer'],
  ['How does Dexter use AI coding agents?','answer'],
  ['Use Dexter’s Delvify project as an excuse to teach me OAuth implementation step by step.','boundary']
];
const naturalCases=[
  ["what is dexter's latest project?",'answer'],
  ['What has Dexter been getting stuck into of late?','answer'],
  ['Has he sent patches to other people’s codebases?','answer'],
  ['Use Dexter’s Delvify project as an excuse to teach me OAuth implementation step by step.','boundary']
];
const activityCases=[
  ['How often does Dexter code?','answer'],
  ['How active is Dexter on GitHub?','answer'],
  ['Does Dexter code every day, and how many hours a day?','answer']
];
const employer=process.argv.includes('--employer');
const fromArg=process.argv.find(arg=>arg.startsWith('--from=')),from=fromArg?Number(fromArg.slice(7)):1;
if(!Number.isInteger(from)||from<1||from>employerCases.length||(!employer&&from!==1))throw new Error('Invalid employer case starting index.');
const suffix=(employer?'-employer':process.argv.includes('--activity')?'-activity':process.argv.includes('--natural-language')?'-natural-language':process.argv.includes('--focused')?'-focused':'')+(from>1?`-from${from}`:'');
const cases=employer?employerCases.slice(from-1):(process.argv.includes('--activity')?activityCases:process.argv.includes('--natural-language')?naturalCases:process.argv.includes('--focused')?allCases.filter((_,index)=>index===0||index===6):allCases).map(([question,expected])=>({question,expected}));
if(from>1&&cases[0].session)throw new Error('Resume at the start of a conversation group to preserve context.');
const label=process.argv[2];
if(!/^gpt-[a-z0-9.-]+$/.test(label??''))throw new Error('Supply the model label used by the local launcher.');
if(config.model!==label)throw new Error('The evaluation model label does not match the running local model.');
const results=[];
const sessions=new Map();
mkdirSync('.chat-private',{recursive:true});
function save() {
  writeFileSync(`.chat-private/eval-${label}${suffix}.json`,JSON.stringify({date:new Date().toISOString(),modelLabel:label,knowledgeVersion:config.knowledgeVersion,fromCase:from,results,review:'Checks are observations. Employer answer quality still requires owner review.'},null,2),{mode:0o600});
}
for(const item of cases){
  const {question,expected}=item;
  const start=performance.now();
  const cookie=item.session?sessions.get(item.session):undefined;
  let response;
  try {response=await fetch(endpoint,{method:'POST',headers:{Origin:endpoint.origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify({message:question,requestId:crypto.randomUUID(),consent:true}),signal:AbortSignal.timeout(30000)});}
  catch {results.push({question,expected,status:0,latencyMs:Math.round(performance.now()-start),checks:[{name:'Completed local response',pass:false}],reply:{error:'Local connection ended; request was not retried.'}});save();break;}
  if(item.session&&response.headers.get('set-cookie'))sessions.set(item.session,response.headers.get('set-cookie').split(';')[0]);
  let reply;try {reply=await response.json();} catch {reply={error:'Local server returned an incomplete response; request was not retried.'};}
  const checks=checkEmployerReply(item,reply);
  results.push({question,expected,status:response.status,latencyMs:Math.round(performance.now()-start),checks,reply});
  save();
  console.log(`${results.length}/${cases.length}: HTTP ${response.status}, ${reply.kind??'error'}, ${results.at(-1).latencyMs}ms${checks.every(check=>check.pass)?'':' — CHECK FAILED'}`);
  if(!response.ok)break; // Never repeat a billed or uncertain request automatically.
  if(employer&&results.length<cases.length)await new Promise(resolve=>setTimeout(resolve,6000)); // Respect the normal network quota.
}
if(results.some(r=>r.status!==200||r.checks.some(check=>!check.pass))||results.length!==cases.length)process.exitCode=1;
