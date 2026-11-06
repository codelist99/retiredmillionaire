import { adminOk } from '../lib/admin-auth.mjs';
import { query } from '../lib/db.mjs';

const periodStart=value=>{
  if(/^\d{4}-\d{2}$/.test(value))return `${value}-01T00:00:00-06:00`;
  if(value==='7d')return new Date(Date.now()-7*86400000).toISOString();
  if(value==='30d')return new Date(Date.now()-30*86400000).toISOString();
  if(value==='all')return '2000-01-01T00:00:00Z';
  const now=new Date(),parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit'}).formatToParts(now),year=parts.find(x=>x.type==='year').value,month=parts.find(x=>x.type==='month').value;
  return `${year}-${month}-01T00:00:00-06:00`;
};
const num=value=>Number(value||0);

export default async function handler(req,res){
  if(!adminOk(req))return res.status(401).json({error:'Admin PIN required'});
  try{
    const start=periodStart(String(req.query?.period||'month'));
    const [summary,dropoff,video,timeline,recent,months]=await Promise.all([
      query(`SELECT COUNT(*)::int page_views,COUNT(DISTINCT visitor_id)::int unique_visitors,COUNT(*) FILTER(WHERE last_seen_at>NOW()-interval '5 minutes')::int live_visitors,COUNT(*) FILTER(WHERE video_started)::int video_starts,COUNT(*) FILTER(WHERE cta_clicked)::int checkout_clicks,ROUND(COALESCE(AVG(engaged_seconds),0))::int avg_engaged_seconds,ROUND(COALESCE(AVG(max_video_percent) FILTER(WHERE video_started),0))::int avg_video_percent FROM rm_sessions WHERE started_at >= $1`,[start]),
      query(`SELECT bucket,COUNT(*)::int sessions FROM (SELECT CASE WHEN engaged_seconds<15 THEN 'Under 15 sec' WHEN engaged_seconds<30 THEN '15–29 sec' WHEN engaged_seconds<60 THEN '30–59 sec' WHEN engaged_seconds<180 THEN '1–3 min' ELSE '3+ min' END bucket,CASE WHEN engaged_seconds<15 THEN 1 WHEN engaged_seconds<30 THEN 2 WHEN engaged_seconds<60 THEN 3 WHEN engaged_seconds<180 THEN 4 ELSE 5 END rank FROM rm_sessions WHERE started_at >= $1) x GROUP BY bucket,rank ORDER BY rank`,[start]),
      query(`SELECT stage,COUNT(*)::int sessions FROM (SELECT unnest(CASE WHEN NOT video_started THEN ARRAY['No video start'] WHEN max_video_percent>=100 THEN ARRAY['Started','25% watched','50% watched','75% watched','100% watched'] WHEN max_video_percent>=75 THEN ARRAY['Started','25% watched','50% watched','75% watched'] WHEN max_video_percent>=50 THEN ARRAY['Started','25% watched','50% watched'] WHEN max_video_percent>=25 THEN ARRAY['Started','25% watched'] ELSE ARRAY['Started'] END) stage FROM rm_sessions WHERE started_at >= $1) x GROUP BY stage ORDER BY CASE stage WHEN 'No video start' THEN 0 WHEN 'Started' THEN 1 WHEN '25% watched' THEN 2 WHEN '50% watched' THEN 3 WHEN '75% watched' THEN 4 ELSE 5 END`,[start]),
      query(`SELECT to_char((started_at AT TIME ZONE 'America/Chicago')::date,'Mon DD') AS label,COUNT(*)::int visitors,COUNT(*) FILTER(WHERE cta_clicked)::int clicks,ROUND(AVG(engaged_seconds))::int avg_seconds FROM rm_sessions WHERE started_at >= $1 GROUP BY (started_at AT TIME ZONE 'America/Chicago')::date ORDER BY (started_at AT TIME ZONE 'America/Chicago')::date`,[start]),
      query(`SELECT session_id,device,started_at,last_seen_at,engaged_seconds,video_started,max_video_percent,cta_clicked,referrer FROM rm_sessions WHERE started_at >= $1 ORDER BY started_at DESC LIMIT 50`,[start]),
      query(`SELECT DISTINCT to_char(started_at AT TIME ZONE 'America/Chicago','YYYY-MM') value,to_char(started_at AT TIME ZONE 'America/Chicago','Mon YYYY') label FROM rm_sessions ORDER BY value DESC`)
    ]);
    const s=summary.rows[0]||{},views=num(s.page_views),starts=num(s.video_starts),clicks=num(s.checkout_clicks);
    return res.status(200).json({summary:{...s,video_start_rate:views?starts/views*100:0,checkout_click_rate:views?clicks/views*100:0},dropoff:dropoff.rows,video:video.rows,timeline:timeline.rows,recent:recent.rows,months:months.rows});
  }catch(error){console.error(error);return res.status(500).json({error:'Unable to load analytics'})}
}
