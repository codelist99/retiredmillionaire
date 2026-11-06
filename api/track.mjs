import { query } from '../lib/db.mjs';

const json=(res,status,data)=>{res.status(status).setHeader('Cache-Control','no-store').json(data)};
const clean=(value,max)=>String(value||'').replace(/[\u0000-\u001f]/g,'').slice(0,max);
const integer=(value,max)=>Math.max(0,Math.min(max,Math.round(Number(value)||0)));

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  try{
    const input=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const sessionId=clean(input.sessionId,80),visitorId=clean(input.visitorId,80);
    if(!/^[a-zA-Z0-9_-]{12,80}$/.test(sessionId)||!/^[a-zA-Z0-9_-]{12,80}$/.test(visitorId))return json(res,400,{error:'Invalid session'});
    const device=['mobile','tablet','desktop'].includes(input.device)?input.device:'desktop';
    await query(`INSERT INTO rm_sessions(session_id,visitor_id,path,referrer,query_string,device,engaged_seconds,video_started,video_seconds,max_video_percent,cta_clicked,exited)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT(session_id) DO UPDATE SET last_seen_at=NOW(),engaged_seconds=GREATEST(rm_sessions.engaged_seconds,EXCLUDED.engaged_seconds),video_started=rm_sessions.video_started OR EXCLUDED.video_started,video_seconds=GREATEST(rm_sessions.video_seconds,EXCLUDED.video_seconds),max_video_percent=GREATEST(rm_sessions.max_video_percent,EXCLUDED.max_video_percent),cta_clicked=rm_sessions.cta_clicked OR EXCLUDED.cta_clicked,exited=rm_sessions.exited OR EXCLUDED.exited`,[
      sessionId,visitorId,clean(input.path,500)||'/',clean(input.referrer,1000),clean(input.query,1500),device,integer(input.engagedSeconds,86400),Boolean(input.videoStarted),integer(input.videoSeconds,86400),integer(input.videoPercent,100),Boolean(input.ctaClicked),Boolean(input.exited)
    ]);
    return json(res,200,{ok:true});
  }catch(error){console.error(error);return json(res,500,{error:'Tracking unavailable'})}
}
