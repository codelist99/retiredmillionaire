import { clearAdmin } from '../lib/admin-auth.mjs';
export default function handler(req,res){clearAdmin(res);return res.status(200).json({ok:true})}
