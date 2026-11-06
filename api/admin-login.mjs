import { pinValid,setAdmin } from '../lib/admin-auth.mjs';
export default function handler(req,res){if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});const pin=String(req.body?.pin||'');if(!pinValid(pin))return res.status(401).json({error:'Incorrect PIN'});setAdmin(req,res);return res.status(200).json({ok:true})}
