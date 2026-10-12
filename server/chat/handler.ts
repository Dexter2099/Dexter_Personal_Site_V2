import type { ChatEnv, Fetcher } from './types';
import { configuration } from './config';
import { chatKnowledge, retrieve } from './knowledge';
import { CONTACT, fixedReply, hmac, MAX_BODY, MAX_MESSAGE, OFF_TOPIC, redact, UNKNOWN } from './policy';
import { generate, previewAnswer, providerBody, reservation } from './provider';
import { admit, admissionFailure, finish, history } from './store';

const headers = { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' };
const json = (body: unknown, status = 200, extra: Record<string,string> = {}) => new Response(JSON.stringify(body), {status,headers:{...headers,...extra}});
async function limitedBody(request: Request) {
  if (!request.body) throw new Error('body_empty');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read(); if(done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw new Error('body_size'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(size); let offset=0;
  for(const chunk of chunks) { buffer.set(chunk,offset); offset+=chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
}
async function challenge(request: Request, token: string, env: ChatEnv, fetcher: Fetcher) {
  if (!token || token.length > 2048) return false;
  try {
    const result = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token}),
      headers:{'Content-Type':'application/json'}, signal:AbortSignal.timeout(5000)
    });
    if (!result.ok) return false;
    const value = await result.json() as any;
    return value.success === true && value.hostname === new URL(request.url).hostname && value.action === 'portfolio-chat';
  } catch { return false; }
}
export async function handleChat(request: Request, env: ChatEnv, fetcher: Fetcher = fetch): Promise<Response> {
  const url = new URL(request.url), config = configuration(env,url);
  if (request.method === 'GET') return json({enabled:config.enabled,mode:config.preview?'preview':'openai',siteKey:config.siteKey,model:config.local&&!config.preview?config.model:undefined,knowledgeVersion:(await chatKnowledge(env.CHAT_DB)).version});
  if (request.method !== 'POST') return json({error:'Use POST to ask a question.'},405,{Allow:'GET, POST'});
  if (!config.enabled) return json({error:'The assistant is unavailable. Email Dexter to get in touch.',contact:CONTACT.sources[0]},503);
  if (request.headers.get('Origin') !== config.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({error:'Please use the chatbot on this website.'},403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Send a JSON message.'},415);
  let body: any;
  try { body = await limitedBody(request); } catch { return json({error:'Please send a shorter valid message.'},400); }
  if (!body || typeof body.message !== 'string' || !body.message.trim() || body.message.length > MAX_MESSAGE ||
    typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId)) return json({error:'Please enter a question of up to 2,000 characters.'},400);
  if (body.consent !== true) return json({error:'Please agree to the chat privacy notice before sending.'},400);
  if (!config.local && !await challenge(request,body.challengeToken,env,fetcher)) return json({error:'Please complete the verification and try again.'},403);
  const now=Date.now(), start=performance.now(), db=env.CHAT_DB!;
  const cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)portfolio_session=([0-9a-f-]{36})(?:;|$)/i)?.[1];
  const session=cookie ?? crypto.randomUUID();
  const sessionHash=await hmac(env.CHAT_ID_SECRET!,session);
  const network=await hmac(env.CHAT_ID_SECRET!,`${new Date(now).toISOString().slice(0,10)}:${config.local?'local':request.headers.get('CF-Connecting-IP') ?? 'unknown'}`);
  const cookieHeader = { 'Set-Cookie':`portfolio_session=${session}; Path=/api/chat; HttpOnly; SameSite=Strict; Max-Age=86400${config.local?'':'; Secure'}` };
  const message=redact(body.message.trim());
  let admitted=false, reserve=0;
  try {
    const active=await chatKnowledge(db,now),version=active.version;
    const fixed=fixedReply(body.message);
    const previous=await history(db,sessionHash,version,now);
    // The small approved corpus fits in one bounded model request. Keywords are
    // only a local-preview aid; they must not prevent the model understanding a question.
    let selected=fixed ? [] : config.preview ? retrieve(message) : active.entries;
    if (!fixed && !selected.length && /^(tell me more|what (?:about|else)|how (?:so|did he do that)|and (?:that|testing)|can you explain that)[?.!\s]*$/i.test(message) && previous.length) selected=retrieve(previous.at(-1)!.message);
    if(config.preview)selected=selected.map(entry=>active.entries.find(current=>current.id===entry.id)!);
    const fallback=fixed ?? (selected.length ? null : /\bdexter\b/i.test(message)?UNKNOWN:OFF_TOPIC);
    const payload = !fallback && !config.preview ? providerBody(message,selected,previous,config.model) : null;
    reserve=payload?reservation(payload):0;
    const admission={id:body.requestId,session:sessionHash,network,now,message,knowledge:version,model:config.preview?'preview':config.model,
      reserve,monthly:config.monthlyMicros,daily:config.dailyMicros,enforceRequestLimits:!config.development};
    admitted=await admit(db,admission);
    if (!admitted) {
      const failure=await admissionFailure(db,admission);
      console.info('Portfolio assistant request limited:',failure.code);
      const errors={
        duplicate_request:'This question was already submitted. It has not been sent to the AI again.',
        reply_in_progress:'A reply is already in progress in this chat. Please wait a moment before sending another question.',
        monthly_budget:config.development?'There is not enough of this month’s US$5 development allowance left for another reply. The remaining US$5 is reserved for live use.':'The assistant does not have enough monthly allowance left for another reply. Please email Dexter.',
        daily_budget:'The assistant’s daily allowance has been reached. Please return tomorrow, or email Dexter.',
        request_rate:failure.retryAfter===3600?'This chat has received too many questions recently. Please wait up to an hour, or email Dexter.':'Questions are arriving too quickly. Please wait one minute before trying again.'
      };
      return json({error:errors[failure.code],code:failure.code,retryAfter:failure.retryAfter,contact:CONTACT.sources[0]},429,
        {...cookieHeader,...(failure.retryAfter?{'Retry-After':String(failure.retryAfter)}:{})});
    }
    const result = payload ? await generate(payload,env.OPENAI_API_KEY!,selected,fetcher) : null;
    const answer = result?.answer ?? fallback ?? previewAnswer(selected);
    // Await durable logging before returning; failure does not silently open the service.
    await finish(db,body.requestId,answer,answer.kind,result?.chargedMicros??0,result?.inputTokens,result?.outputTokens,Math.round(performance.now()-start));
    return json({...answer,mode:config.preview?'preview':'openai',knowledgeVersion:version},200,cookieHeader);
  } catch (error) {
    const code=error instanceof Error && /^(provider_\d{3}|provider_usage_unknown|provider_incomplete|provider_usage_exceeded_reservation|answer_schema|answer_sources|answer_boundary|input_bound)$/.test(error.message) ? error.message : 'request_failed';
    console.warn('Portfolio assistant request failed:',code);
    // A timeout or invalid provider result can still be billed. Keep the full
    // reservation, and do not retry automatically or return raw provider errors.
    if (admitted) {
      try { await finish(db,body.requestId,{kind:'unknown',text:'The assistant could not finish this reply. Please try later or email Dexter.',sources:[]},'uncertain',reserve,0,0,Math.round(performance.now()-start)); } catch { /* original reservation remains */ }
    }
    return json({error:'The assistant could not finish this reply. Please try later or email Dexter.',contact:CONTACT.sources[0]},503,cookieHeader);
  }
}
