import { createHmac,timingSafeEqual } from 'node:crypto';
const secret=()=>process.env.ADMIN_SESSION_SECRET||'missing-admin-secret';
const token=()=>createHmac('sha256',secret()).update('retired-millionaire-admin').digest('base64url');
const same=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)};
export const adminOk=req=>{const value=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('rm_admin='))?.slice(9);return Boolean(value)&&same(decodeURIComponent(value),token())};
export const setAdmin=(req,res)=>res.setHeader('Set-Cookie',`rm_admin=${encodeURIComponent(token())}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${req.headers['x-forwarded-proto']==='https'?'; Secure':''}`);
export const clearAdmin=res=>res.setHeader('Set-Cookie','rm_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure');
export const pinValid=pin=>same(pin,process.env.ADMIN_PIN||'67');
