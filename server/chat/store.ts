import type { D1Database } from '@cloudflare/workers-types';
import type { Answer } from './types';
import { POLICY_VERSION } from './policy';

export interface Admission {
  id: string; session: string; network: string; now: number; message: string;
  knowledge: string; model: string; reserve: number; monthly: number; daily: number | null;
  enforceRequestLimits?: boolean;
}
export async function admit(db: D1Database, a: Admission): Promise<boolean> {
  const date = new Date(a.now).toISOString();
  // One conditional write is the authority. Concurrent requests cannot both
  // observe an old balance or bypass the per-session generation lock.
  const result = await db.prepare(`INSERT OR IGNORE INTO chat_requests
    (id,session_id,network_id,created_at,day,month,status,message,knowledge_version,policy_version,model,reserved_micros)
    SELECT ?,?,?,?,?,?,'pending',?,?,?,?,?
    WHERE NOT EXISTS (SELECT 1 FROM chat_requests WHERE session_id=? AND status='pending' AND created_at>?)
    AND (? = 0 OR ((SELECT COUNT(*) FROM chat_requests WHERE session_id=? AND created_at>?) < 6
    AND (SELECT COUNT(*) FROM chat_requests WHERE session_id=? AND created_at>?) < 30
    AND (SELECT COUNT(*) FROM chat_requests WHERE network_id=? AND created_at>?) < 12
    AND (SELECT COUNT(*) FROM chat_requests WHERE network_id=? AND created_at>?) < 60
    AND (SELECT COUNT(*) FROM chat_requests WHERE created_at>?) < 60
    AND (SELECT COUNT(*) FROM chat_requests WHERE created_at>?) < 300))
    AND COALESCE((SELECT SUM(reserved_micros) FROM chat_requests WHERE month=?),0)+? <= ?
    AND (? IS NULL OR COALESCE((SELECT SUM(reserved_micros) FROM chat_requests WHERE day=?),0)+? <= ?)`)
    .bind(a.id, a.session, a.network, a.now, date.slice(0,10), date.slice(0,7), a.message, a.knowledge, POLICY_VERSION, a.model, a.reserve,
      a.session, a.now-25000, a.enforceRequestLimits === false ? 0 : 1, a.session, a.now-60000, a.session, a.now-3600000,
      a.network, a.now-60000, a.network, a.now-3600000, a.now-60000, a.now-3600000,
      date.slice(0,7), a.reserve, a.monthly, a.daily, date.slice(0,10), a.reserve, a.daily).run();
  return result.meta.changes === 1;
}

export type AdmissionFailure = { code: 'duplicate_request' | 'reply_in_progress' | 'monthly_budget' | 'daily_budget' | 'request_rate'; retryAfter?: number };
// This read explains a refused write; it never authorises a provider call.
// The conditional INSERT above remains the only admission authority.
export async function admissionFailure(db: D1Database, a: Admission): Promise<AdmissionFailure> {
  const date = new Date(a.now).toISOString();
  const row = await db.prepare(`SELECT
    EXISTS(SELECT 1 FROM chat_requests WHERE id=?) AS duplicate,
    MAX(CASE WHEN session_id=? AND status='pending' AND created_at>? THEN created_at END) AS pending_at,
    COALESCE(SUM(CASE WHEN month=? THEN reserved_micros ELSE 0 END),0) AS monthly,
    COALESCE(SUM(CASE WHEN day=? THEN reserved_micros ELSE 0 END),0) AS daily,
    COUNT(CASE WHEN session_id=? AND created_at>? THEN 1 END) AS session_minute,
    COUNT(CASE WHEN session_id=? AND created_at>? THEN 1 END) AS session_hour,
    COUNT(CASE WHEN network_id=? AND created_at>? THEN 1 END) AS network_minute,
    COUNT(CASE WHEN network_id=? AND created_at>? THEN 1 END) AS network_hour,
    COUNT(CASE WHEN created_at>? THEN 1 END) AS global_minute,
    COUNT(CASE WHEN created_at>? THEN 1 END) AS global_hour
    FROM chat_requests`)
    .bind(a.id,a.session,a.now-25000,date.slice(0,7),date.slice(0,10),
      a.session,a.now-60000,a.session,a.now-3600000,
      a.network,a.now-60000,a.network,a.now-3600000,a.now-60000,a.now-3600000)
    .first<{duplicate:number;pending_at:number|null;monthly:number;daily:number;session_minute:number;session_hour:number;network_minute:number;network_hour:number;global_minute:number;global_hour:number}>();
  if (row?.duplicate) return {code:'duplicate_request'};
  if (row?.pending_at != null) return {code:'reply_in_progress',retryAfter:Math.max(1,Math.ceil((row.pending_at+25000-a.now)/1000))};
  if (row && row.monthly+a.reserve>a.monthly) return {code:'monthly_budget'};
  if (row && a.daily != null && row.daily+a.reserve>a.daily) return {code:'daily_budget'};
  const hourLimited = a.enforceRequestLimits !== false && row && (row.session_hour>=30 || row.network_hour>=60 || row.global_hour>=300);
  return {code:'request_rate',retryAfter:hourLimited?3600:60};
}
export async function finish(db: D1Database, id: string, answer: Answer, status: string, cost: number, input = 0, output = 0, latency = 0) {
  await db.prepare(`UPDATE chat_requests SET status=?,answer=?,source_ids=?,reserved_micros=?,input_tokens=?,output_tokens=?,latency_ms=? WHERE id=? AND status='pending'`)
    .bind(status, answer.text, JSON.stringify(answer.sources.map(x => x.id)), cost, input, output, latency, id).run();
}
export async function history(db: D1Database, session: string, version: string, now: number) {
  const result = await db.prepare(`SELECT message,answer FROM chat_requests WHERE session_id=? AND knowledge_version=? AND status='answer' AND created_at>? ORDER BY created_at DESC LIMIT 3`)
    .bind(session, version, now-86400000).all<{message:string;answer:string}>();
  return result.results.reverse();
}
export async function cleanup(db: D1Database, now = Date.now()) {
  return db.batch([
    db.prepare(`UPDATE chat_requests SET message=NULL,answer=NULL,session_id='',network_id='' WHERE created_at<? AND message IS NOT NULL`).bind(now-90*86400000),
    db.prepare(`DELETE FROM chat_requests WHERE created_at<?`).bind(now-365*86400000)
  ]);
}
